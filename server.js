// server.js

const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5000;

// Initialize SQLite database
const db = new Database('mentorship.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Create tables if they don't exist
const initDB = () => {
    // Users table for both learners and mentors
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('learner', 'mentor')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // User profiles table (UPDATED: Added personal_meet_link)
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            headline TEXT,
            location TEXT,
            focus TEXT,
            interests TEXT,
            guidance TEXT,
            goals TEXT,
            education TEXT,
            skills TEXT,
            expectations TEXT,
            about TEXT,
            industry TEXT,
            expertise TEXT,
            quote TEXT,
            image TEXT,
            personal_meet_link TEXT,
            joined_date DATE DEFAULT CURRENT_DATE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `);

    // Sessions table (updated with payment_reference)
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mentor_id INTEGER NOT NULL,
            mentee_id INTEGER NOT NULL,
            slot DATETIME NOT NULL,
            meet_link TEXT,
            payment_reference TEXT,
            status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (mentor_id) REFERENCES users (id),
            FOREIGN KEY (mentee_id) REFERENCES users (id)
        )
    `);

    // Payments table
    db.exec(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference_id TEXT UNIQUE NOT NULL,
            mentor_id INTEGER NOT NULL,
            mentee_id INTEGER NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'refunded')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (mentor_id) REFERENCES users (id),
            FOREIGN KEY (mentee_id) REFERENCES users (id)
        )
    `);

    console.log('Database initialized successfully');
};

// Initialize database on startup
initDB();

// --- API Routes ---

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, name, email, password, role } = req.body;
        
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
        if (existingUser) {
            return res.status(400).json({ 
                error: existingUser.email === email ? 'Email already exists' : 'Username already taken' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = db.prepare(`
            INSERT INTO users (username, name, email, password, role) 
            VALUES (?, ?, ?, ?, ?)
        `).run(username, name, email, hashedPassword, role);

        db.prepare(`
            INSERT INTO user_profiles (user_id) VALUES (?)
        `).run(result.lastInsertRowid);

        res.status(201).json({ message: 'User registered successfully', userId: result.lastInsertRowid });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password, role } = req.body;
        
        // The p.* will now automatically include the new personal_meet_link column
        const user = db.prepare(`
            SELECT u.*, p.* FROM users u 
            LEFT JOIN user_profiles p ON u.id = p.user_id 
            WHERE (u.email = ? OR u.username = ?) AND u.role = ?
        `).get(identifier, identifier, role);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Update user profile (Enhanced with better validation and error handling)
app.put('/api/profile/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const profileData = req.body;

        // Validate user exists
        const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Start a transaction for data consistency
        const transaction = db.transaction(() => {
            // Update user name in users table if provided
            if (profileData.name && profileData.name.trim()) {
                const nameResult = db.prepare('UPDATE users SET name = ? WHERE id = ?').run(profileData.name.trim(), userId);
                if (nameResult.changes === 0) {
                    throw new Error('Failed to update user name');
                }
            }

            // Check if user_profiles entry exists, if not create it
            const profileExists = db.prepare('SELECT user_id FROM user_profiles WHERE user_id = ?').get(userId);
            if (!profileExists) {
                db.prepare('INSERT INTO user_profiles (user_id) VALUES (?)').run(userId);
            }

            // Dynamically build the SET part of the query for user_profiles table
            const fieldsToUpdate = [
                'headline', 'location', 'focus', 'interests', 'guidance', 'goals', 'education', 
                'skills', 'expectations', 'about', 'industry', 'expertise', 'quote', 'personal_meet_link'
            ];
            
            const setClauses = [];
            const values = [];

            for (const field of fieldsToUpdate) {
                if (profileData[field] !== undefined) {
                    setClauses.push(`${field} = ?`);
                    values.push(profileData[field]);
                }
            }
            
            if (setClauses.length > 0) {
                values.push(userId);
                const sql = `UPDATE user_profiles SET ${setClauses.join(', ')} WHERE user_id = ?`;
                const profileResult = db.prepare(sql).run(...values);
                if (profileResult.changes === 0) {
                    throw new Error('Failed to update profile data');
                }
            }
        });

        // Execute the transaction
        transaction();

        res.json({ 
            message: 'Profile updated successfully',
            updatedFields: Object.keys(profileData).length
        });
    } catch (error) {
        console.error('Profile update error:', error);
        if (error.message.includes('Failed to update')) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error during profile update' });
        }
    }
});


// Get all mentors
app.get('/api/mentors', (req, res) => {
    try {
        const mentors = db.prepare(`
            SELECT u.id, u.name, u.email, p.* FROM users u 
            JOIN user_profiles p ON u.id = p.user_id 
            WHERE u.role = 'mentor'
        `).all();
        res.json(mentors);
    } catch (error) {
        console.error('Get mentors error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Payment verification endpoint
app.post('/api/verify-payment', (req, res) => {
    try {
        const { reference, amount, mentorId, menteeId } = req.body;
        
        // In a real application, you would integrate with actual payment gateway APIs
        // For demo purposes, we'll simulate payment verification
        // Accept any reference that's at least 6 characters long
        const isValid = reference && reference.length >= 6;
        
        if (isValid) {
            // Store payment record
            db.prepare(`
                INSERT INTO payments (reference_id, mentor_id, mentee_id, amount, status, created_at) 
                VALUES (?, ?, ?, ?, 'verified', CURRENT_TIMESTAMP)
            `).run(reference, mentorId, menteeId, amount);
            
            res.json({ verified: true, message: 'Payment verified successfully' });
        } else {
            res.json({ verified: false, message: 'Invalid payment reference' });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Book a session (updated to include payment reference)
app.post('/api/sessions', (req, res) => {
    try {
        const { mentorId, menteeId, slot, paymentReference } = req.body;
        
        // Check if payment was verified
        if (paymentReference) {
            const payment = db.prepare(`
                SELECT * FROM payments 
                WHERE reference_id = ? AND mentor_id = ? AND mentee_id = ? AND status = 'verified'
            `).get(paymentReference, mentorId, menteeId);
            
            if (!payment) {
                return res.status(400).json({ error: 'Payment not verified or not found' });
            }
        }
        
        const result = db.prepare(`
            INSERT INTO sessions (mentor_id, mentee_id, slot, payment_reference, status) 
            VALUES (?, ?, ?, ?, 'Pending')
        `).run(mentorId, menteeId, slot, paymentReference || null);
        
        res.status(201).json({ message: 'Session booked successfully', sessionId: result.lastInsertRowid });
    } catch (error) {
        console.error('Book session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get user sessions
app.get('/api/sessions/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const sessions = db.prepare(`
            SELECT s.*, 
                   mentor.name as mentor_name, 
                   mentor_profile.image as mentor_image,
                   mentor_profile.personal_meet_link,
                   mentee.name as mentee_name,
                   mentee_profile.image as mentee_image
            FROM sessions s
            JOIN users mentor ON s.mentor_id = mentor.id
            JOIN users mentee ON s.mentee_id = mentee.id
            LEFT JOIN user_profiles mentor_profile ON mentor.id = mentor_profile.user_id
            LEFT JOIN user_profiles mentee_profile ON mentee.id = mentee_profile.user_id
            WHERE s.mentor_id = ? OR s.mentee_id = ?
            ORDER BY s.slot ASC
        `).all(userId, userId);
        res.json(sessions);
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Update session status (UPDATED to use mentor's personal link)
app.put('/api/sessions/:sessionId/status', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status } = req.body;

        if (!['Confirmed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status provided.' });
        }

        let result;
        if (status === 'Confirmed') {
            // Find the mentor for this session to get their meeting link
            const session = db.prepare('SELECT mentor_id FROM sessions WHERE id = ?').get(sessionId);
            if (!session) {
                return res.status(404).json({ error: 'Session not found.' });
            }
            
            // Get the mentor's personal link from their profile
            const mentorProfile = db.prepare('SELECT personal_meet_link FROM user_profiles WHERE user_id = ?').get(session.mentor_id);
            const meetLink = mentorProfile ? mentorProfile.personal_meet_link : null;

            // Update the session with the status and the retrieved link
            result = db.prepare(`
                UPDATE sessions 
                SET status = ?, meet_link = ? 
                WHERE id = ?
            `).run(status, meetLink, sessionId);

        } else { // 'Cancelled'
            result = db.prepare(`
                UPDATE sessions 
                SET status = ?, meet_link = NULL 
                WHERE id = ?
            `).run(status, sessionId);
        }

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        res.json({ message: `Session status updated to ${status}` });
    } catch (error) {
        console.error('Update session status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reschedule Route
app.put('/api/sessions/:sessionId/reschedule', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { newSlot } = req.body;
        if (!newSlot) {
            return res.status(400).json({ error: 'A new time slot is required.' });
        }
        const result = db.prepare(`
            UPDATE sessions
            SET slot = ?, status = 'Pending', meet_link = NULL
            WHERE id = ?
        `).run(newSlot, sessionId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }
        res.json({ message: 'Session reschedule request sent successfully.' });
    } catch (error) {
        console.error('Reschedule session error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update session meeting link
app.put('/api/sessions/:sessionId/link', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { meetLink } = req.body;
        
        const result = db.prepare(`
            UPDATE sessions 
            SET meet_link = ? 
            WHERE id = ?
        `).run(meetLink || null, sessionId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }
        
        res.json({ message: 'Meeting link updated successfully.' });
    } catch (error) {
        console.error('Update session link error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mentor.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});