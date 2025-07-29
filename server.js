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

    // Sessions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mentor_id INTEGER NOT NULL,
            mentee_id INTEGER NOT NULL,
            slot DATETIME NOT NULL,
            meet_link TEXT,
            status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
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


// ⭐️⭐️ UPDATE USER PROFILE (NOW FULLY IMPLEMENTED) ⭐️⭐️
app.put('/api/profile/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const profileData = req.body;

        // Update user name in users table if provided
        if (profileData.name) {
            db.prepare('UPDATE users SET name = ? WHERE id = ?').run(profileData.name, userId);
        }

        // List of allowed fields in the user_profiles table to prevent SQL injection
        const allowedProfileFields = [
            'headline', 'location', 'focus', 'interests', 'guidance', 'goals', 'education', 
            'skills', 'expectations', 'about', 'industry', 'expertise', 'quote', 'personal_meet_link'
        ];
        
        const setClauses = [];
        const values = [];

        // Dynamically build the SET part of the query for user_profiles table
        for (const field of allowedProfileFields) {
            if (profileData[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                values.push(profileData[field]);
            }
        }
        
        // If there are fields to update in the profile, run the query
        if (setClauses.length > 0) {
            values.push(userId); // Add the user_id for the WHERE clause
            const sql = `UPDATE user_profiles SET ${setClauses.join(', ')} WHERE user_id = ?`;
            const stmt = db.prepare(sql);
            stmt.run(...values);
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
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

// Book a session
app.post('/api/sessions', (req, res) => {
    try {
        const { mentorId, menteeId, slot } = req.body;
        const result = db.prepare(`
            INSERT INTO sessions (mentor_id, mentee_id, slot, status) 
            VALUES (?, ?, ?, 'Pending')
        `).run(mentorId, menteeId, slot);
        res.status(201).json({ message: 'Session request sent successfully', sessionId: result.lastInsertRowid });
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
                   mentor_profile.personal_meet_link as meet_link,
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


// Update session status (handles mentor's personal link)
app.put('/api/sessions/:sessionId/status', (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status } = req.body;

        if (!['Confirmed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status provided.' });
        }

        let result;
        if (status === 'Confirmed') {
            const session = db.prepare('SELECT mentor_id FROM sessions WHERE id = ?').get(sessionId);
            if (!session) {
                return res.status(404).json({ error: 'Session not found.' });
            }
            
            const mentorProfile = db.prepare('SELECT personal_meet_link FROM user_profiles WHERE user_id = ?').get(session.mentor_id);
            const meetLink = mentorProfile ? mentorProfile.personal_meet_link : null;

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

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mentor.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});