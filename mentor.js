// script.js

document.addEventListener('DOMContentLoaded', function() {

    let currentUser = null;
    let userRole = 'learner'; // Default role
    let authAction = ''; // To track if user clicked 'login' or 'signup'
  

    // --- Sample Mentor Data (This will be replaced by data from your database) ---
    const allMentors = [
        { id: 1, name: 'r. R. A. Mashelkar', email: 'ramesh@mentor.com', headline: 'Former Director General of CSIR', industry: 'Science & Innovation', expertise: ['Innovation', 'Startups', 'Leadership'], quote: 'Mentoring young innovators to build a better tomorrow.', image: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Ramesh_Mashelkar_Apr09.jpg', joinedDate: '2025-07-20', about: 'Dr. Mashelkar is a national research professor and a renowned advocate for "inclusive innovation." With decades of experience leading one of India\'s largest research organizations, he is passionate about helping young minds turn their scientific ideas into impactful ventures.' },
        { id: 2, name: 'Kiran Karnik', email: 'kiran@mentor.com', headline: 'Former President, NASSCOM', industry: 'IT & Policy', expertise: ['IT Professionals', 'Startups', 'Policy'], quote: 'Guiding the next generation of IT leaders.', image: 'https://www.apnic.net/wp-content/uploads/2015/08/kiran-karnik.jpg', joinedDate: '2025-07-22', about: 'Kiran Karnik played a pivotal role in shaping India\'s IT industry. He offers invaluable insights into technology trends, policy-making, and scaling technology businesses.' },
        { id: 3, name: 'Ravi Venkatesan', email: 'ravi@mentor.com', headline: 'Former Chairman, Microsoft India', industry: 'Business Strategy', expertise: ['Social Entrepreneurs', 'Business Development', 'Leadership'], quote: 'Helping social entrepreneurs make a global impact.', image: 'https://images.livemint.com/rf/Image-621x414/LiveMint/Period2/2018/02/01/Photos/Processed/RaviVenkatesan-kI3F--621x414@LiveMint.jpg', joinedDate: '2025-07-15', about: 'Ravi Venkatesan is a business leader with a deep commitment to social change. He specializes in mentoring entrepreneurs who are building organizations that aim to solve critical societal challenges.' },
        { id: 4, name: 'Dr. Devi Shetty', email: 'devi@mentor.com', headline: 'Founder, Narayana Health', industry: 'Healthcare', expertise: ['Healthcare Innovation', 'Entrepreneurship', 'Low-cost Solutions'], quote: 'Promoting innovation in affordable healthcare.', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Devi_Shetty.jpg/800px-Devi_Shetty.jpg', joinedDate: '2025-07-25', about: 'A world-renowned cardiac surgeon, Dr. Devi Shetty is a pioneer in making high-quality healthcare accessible. He is eager to mentor health-tech innovators and entrepreneurs looking to disrupt the medical field.' },
        { id: 5, name: 'Arun Maira', email: 'arun@mentor.com', headline: 'Former Member, Planning Commission', industry: 'Policy & Strategy', expertise: ['Policy', 'Strategy', 'Leadership'], quote: 'Shaping future leaders through policy and strategic thinking.', image: 'https://placehold.co/400x400/a3a3a3/ffffff?text=Arun+Maira', joinedDate: '2025-06-30', about: 'Arun Maira has extensive experience in both the corporate world and public policy. He provides guidance on systems thinking, leadership, and navigating complex institutional challenges.' },
        { id: 6, name: 'Prof. Deepak B. Phatak', email: 'deepak@mentor.com', headline: 'Professor (Retired), IIT Bombay', industry: 'Education Technology', expertise: ['EdTech', 'Computer Science', 'MOOCs'], quote: 'Leveraging technology for national education.', image: 'https://placehold.co/400x400/d4d4d4/ffffff?text=Prof.+Phatak', joinedDate: '2025-07-24', about: 'A stalwart of computer science education in India, Prof. Phatak has been instrumental in large-scale educational technology projects. He mentors those passionate about using tech to solve educational challenges.' },
    ];


    // --- Element Selectors ---
    const allViews = document.querySelectorAll('main');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileSignupBtn = document.getElementById('mobile-signup-btn');
    const joinNowBtn = document.getElementById('join-now-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    // Dashboard Buttons
    const goToProfileBtn = document.getElementById('go-to-profile-btn');
    const findMentorBtn = document.getElementById('find-mentor-btn');
    const viewSessionsBtn = document.getElementById('view-sessions-btn');
    const backToDashboardBtns = document.querySelectorAll('.back-to-dashboard-btn');
    const backToFindMentorBtn = document.querySelector('.back-to-find-mentor-btn');
    const manageProfileBtn = document.getElementById('manage-profile-btn');
    const viewRequestsBtn = document.getElementById('view-requests-btn');
    const viewScheduleBtn = document.getElementById('view-schedule-btn');

    // Modals
    const roleChoiceModal = document.getElementById('role-choice-modal');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const messageModal = document.getElementById('message-modal');
    const bookSessionModal = document.getElementById('book-session-modal');
    const allModals = [roleChoiceModal, loginModal, signupModal, messageModal, bookSessionModal];

    // Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const profileForm = document.getElementById('profile-form');
    const filterForm = document.getElementById('filter-form');
    const bookSessionForm = document.getElementById('book-session-form');

    // Nav and Content areas
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const welcomeMessage = document.getElementById('welcome-message');
    const mobileAuthLinks = document.getElementById('mobile-auth-links');
    const mobileUserInfo = document.getElementById('mobile-user-info');
    const mobileWelcomeMessage = document.getElementById('mobile-welcome-message');
    const dashboardWelcome = document.getElementById('dashboard-welcome');
    const mentorDashboardWelcome = document.getElementById('mentor-dashboard-welcome');
    
    // Profile Page Elements
    const profileCompletionText = document.getElementById('profile-completion-text');
    const profileCompletionBar = document.getElementById('profile-completion-bar');
    const profileName = document.getElementById('profile-name');
    const profileHeadline = document.getElementById('profile-headline');
    const profileLocation = document.getElementById('profile-location');
    const profileFocus = document.getElementById('profile-focus');
    const profileInterests = document.getElementById('profile-interests');
    const profileGuidanceChecklist = document.getElementById('profile-guidance-checklist');
    const profileGoals = document.getElementById('profile-goals');
    const profileEducation = document.getElementById('profile-education');
    const profileSkills = document.getElementById('profile-skills');
    const profileExpectations = document.getElementById('profile-expectations');
    
    // Find Mentor Page Elements
    const findMentorGrid = document.getElementById('find-mentor-grid');
    const guestMentorGrid = document.getElementById('guest-mentor-grid');
    const mentorResultsCount = document.getElementById('mentor-results-count');
    const industryFilters = document.getElementById('industry-filters');
    const expertiseFilters = document.getElementById('expertise-filters');
    const sortMentors = document.getElementById('sort-mentors');
    const mentorProfileDetails = document.getElementById('mentor-profile-details');
    const timeSlotsContainer = document.getElementById('time-slots-container');
    
    // My Sessions Page Elements
    const sessionsTabs = document.getElementById('sessions-tabs');
    const sessionsTabContent = document.getElementById('sessions-tab-content');
    const upcomingSessionsContent = document.getElementById('upcoming-sessions-content');
    const pendingSessionsContent = document.getElementById('pending-sessions-content');
    const pastSessionsContent = document.getElementById('past-sessions-content');


    // --- View Management ---
    const showView = (viewId) => {
        allViews.forEach(view => {
            view.classList.add('hidden');
        });
        const viewToShow = document.getElementById(viewId);
        if (viewToShow) {
            viewToShow.classList.remove('hidden');
        }
        window.scrollTo(0, 0); // Scroll to top on view change
    };

    // --- UI Update & Data Functions ---
    const updateProfileCompletion = (user) => {
        if (!user || !user.profile) return;
        const fields = [
            user.name, user.profile.headline, user.profile.location,
            user.profile.focus, user.profile.interests, user.profile.goals,
            user.profile.education, user.profile.skills, user.profile.expectations
        ];
        const filledFields = fields.filter(field => {
            if (Array.isArray(field)) return field.length > 0;
            return field && String(field).trim().length > 0;
        }).length;
        const percentage = Math.round((filledFields / fields.length) * 100);
        
        profileCompletionText.textContent = `${percentage}%`;
        profileCompletionBar.style.width = `${percentage}%`;
    };
    
    const populateGuidanceChecklist = () => {
        const guidanceOptions = ["Career Advice", "Resume Review", "Interview Prep", "Networking", "Skill Development", "Project Feedback"];
        profileGuidanceChecklist.innerHTML = '';
        guidanceOptions.forEach(option => {
            profileGuidanceChecklist.innerHTML += `
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" value="${option}" class="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                    <span class="text-gray-700">${option}</span>
                </label>
            `;
        });
    };

    const updateUIForLogin = (user) => {
        currentUser = user;
        localStorage.setItem('legacyLearnersCurrentUser', JSON.stringify(user));
        const firstName = user.name.split(' ')[0];
        
        authLinks.classList.add('hidden');
        authLinks.classList.remove('md:flex');
        userInfo.classList.remove('hidden');
        userInfo.classList.add('md:flex');
        welcomeMessage.textContent = `Hi, ${firstName}!`;

        mobileAuthLinks.classList.add('hidden');
        mobileUserInfo.classList.remove('hidden');
        mobileWelcomeMessage.textContent = `Hi, ${firstName}!`;

        if (user.role === 'mentor') {
            renderMentorDashboard();
            showView('mentor-dashboard-content');
        } else {
            dashboardWelcome.textContent = `Welcome to your Dashboard, ${firstName}!`;
            showView('dashboard-content');
        }
        
        profileName.value = user.name || '';
        profileHeadline.value = user.profile.headline || '';
        profileLocation.value = user.profile.location || '';
        profileFocus.value = user.profile.focus || '';
        profileInterests.value = (user.profile.interests || []).join(', ');
        profileGoals.value = user.profile.goals || '';
        profileEducation.value = user.profile.education || '';
        profileSkills.value = (user.profile.skills || []).join(', ');
        profileExpectations.value = user.profile.expectations || '';
        
        const guidanceCheckboxes = profileGuidanceChecklist.querySelectorAll('input[type="checkbox"]');
        guidanceCheckboxes.forEach(checkbox => {
            checkbox.checked = (user.profile.guidance || []).includes(checkbox.value);
        });
        
        updateProfileCompletion(user);
    };

    const updateUIForLogout = () => {
        currentUser = null;
        localStorage.removeItem('legacyLearnersCurrentUser');
        
        authLinks.classList.remove('hidden');
        authLinks.classList.add('md:flex');
        userInfo.classList.add('hidden');
        userInfo.classList.remove('md:flex');
        welcomeMessage.textContent = '';

        mobileAuthLinks.classList.remove('hidden');
        mobileUserInfo.classList.add('hidden');
        mobileWelcomeMessage.textContent = '';
        
        showView('guest-content');
    };

    // --- Modal Functionality ---
    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('visible'), 20);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
            if (!document.querySelector('.modal.visible')) document.body.style.overflow = '';
        }, 300);
    };
    
    const showMessage = (message, onOk) => {
        const messageText = document.getElementById('message-text');
        const messageOkBtn = document.getElementById('message-ok-btn');
        if (messageText && messageModal && messageOkBtn) {
            messageText.textContent = message;
            const newOkBtn = messageOkBtn.cloneNode(true);
            messageOkBtn.parentNode.replaceChild(newOkBtn, messageOkBtn);
            newOkBtn.addEventListener('click', () => {
                closeModal(messageModal);
                if (typeof onOk === 'function') onOk();
            });
            openModal(messageModal);
        }
    };

    // --- Event Listeners ---
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    
    const startAuthProcess = (action) => {
        authAction = action;
        const title = action === 'login' ? 'Log In As...' : 'Join As...';
        document.getElementById('role-choice-title').textContent = title;
        openModal(roleChoiceModal);
    };

    loginBtn.addEventListener('click', (e) => { e.preventDefault(); startAuthProcess('login'); });
    mobileLoginBtn.addEventListener('click', (e) => { e.preventDefault(); startAuthProcess('login'); });
    signupBtn.addEventListener('click', (e) => { e.preventDefault(); startAuthProcess('signup'); });
    mobileSignupBtn.addEventListener('click', (e) => { e.preventDefault(); startAuthProcess('signup'); });
    joinNowBtn.addEventListener('click', (e) => { e.preventDefault(); startAuthProcess('signup'); });

    roleChoiceModal.querySelectorAll('.role-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            userRole = btn.dataset.role;
            closeModal(roleChoiceModal);

            if (authAction === 'login') {
                document.getElementById('login-title').textContent = `Log In as a ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`;
                openModal(loginModal);
            } else if (authAction === 'signup') {
                document.getElementById('signup-title').textContent = `Create ${userRole === 'learner' ? 'a Learner' : 'a Mentor'} Account`;
                openModal(signupModal);
            }
        });
    });

    const handleLogout = (e) => { e.preventDefault(); updateUIForLogout(); showMessage('You have been logged out.'); };
    [logoutBtn, mobileLogoutBtn].forEach(btn => btn.addEventListener('click', handleLogout));

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        setTimeout(() => {
            const email = prompt("Please enter your email to reset your password:");
            if(email) {
                // This would be a call to a backend endpoint in a real app
                showMessage(`If an account with ${email} exists, a password reset link has been sent.`);
            }
        }, 350);
    });

    allModals.forEach(modal => {
        if (modal) {
            const closeBtn = modal.querySelector('.close-modal-btn');
            if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
        }
    });
    
    // Dashboard navigation
    goToProfileBtn.addEventListener('click', () => showView('profile-content'));
    findMentorBtn.addEventListener('click', () => {
        renderMentors(allMentors, findMentorGrid);
        showView('find-mentor-page-content');
    });
    viewSessionsBtn.addEventListener('click', () => {
        renderMySessions();
        showView('sessions-content');
    });
    backToDashboardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentUser && currentUser.role === 'mentor') {
                showView('mentor-dashboard-content');
            } else {
                showView('dashboard-content');
            }
        });
    });
    backToFindMentorBtn.addEventListener('click', () => showView('find-mentor-page-content'));
    manageProfileBtn.addEventListener('click', () => showView('profile-content'));
    viewRequestsBtn.addEventListener('click', () => {
        renderMySessions();
        sessionsTabs.querySelector('button[data-tab="pending"]').click();
        showView('sessions-content');
    });
    viewScheduleBtn.addEventListener('click', () => {
        renderMySessions();
        sessionsTabs.querySelector('button[data-tab="upcoming"]').click();
        showView('sessions-content');
    });


    // --- Real-time Profile Completion Update ---
    const handleProfileFormChange = () => {
        const tempUser = {
            name: profileName.value,
            profile: {
                headline: profileHeadline.value, location: profileLocation.value,
                focus: profileFocus.value, interests: profileInterests.value.split(',').map(s => s.trim()).filter(Boolean),
                goals: profileGoals.value, education: profileEducation.value,
                skills: profileSkills.value.split(',').map(s => s.trim()).filter(Boolean),
                expectations: profileExpectations.value
            }
        };
        updateProfileCompletion(tempUser);
    };

    profileForm.addEventListener('input', handleProfileFormChange);
    profileForm.addEventListener('change', handleProfileFormChange);


    // --- Form Submission Logic ---
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (password !== confirmPassword) return showMessage('Passwords do not match.');

        const users = JSON.parse(localStorage.getItem('legacyLearnersUsers')) || [];

        if (users.find(user => user.email === email)) return showMessage('An account with this email already exists.');
        if (users.find(user => user.username === username)) return showMessage('This username is already taken.');

        const newUser = { 
            name, username, email, password, role: userRole,
            profile: {
                headline: '', location: '', focus: '', interests: [],
                guidance: [], goals: '', education: '', skills: [], expectations: ''
            }
        };
        users.push(newUser);
        localStorage.setItem('legacyLearnersUsers', JSON.stringify(users));
        
        closeModal(signupModal);
        signupForm.reset();
        showMessage('Account created! Please log in.', () => {
            document.getElementById('login-title').textContent = `Log In as a ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`;
            openModal(loginModal)
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value.trim();
        const password = document.getElementById('login-password').value;
        const users = JSON.parse(localStorage.getItem('legacyLearnersUsers')) || [];
        const user = users.find(u => (u.email === identifier || u.username === identifier) && u.password === password && u.role === userRole);

        if (user) {
            closeModal(loginModal);
            loginForm.reset();
            updateUIForLogin(user);
        } else {
            showMessage(`Invalid credentials for a ${userRole}. Please try again or check your role.`);
        }
    });
    
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;

        currentUser.name = profileName.value;
        currentUser.profile.headline = profileHeadline.value;
        currentUser.profile.location = profileLocation.value;
        currentUser.profile.focus = profileFocus.value;
        currentUser.profile.interests = profileInterests.value.split(',').map(s => s.trim()).filter(Boolean);
        currentUser.profile.goals = profileGoals.value;
        currentUser.profile.education = profileEducation.value;
        currentUser.profile.skills = profileSkills.value.split(',').map(s => s.trim()).filter(Boolean);
        currentUser.profile.expectations = profileExpectations.value;
        
        const selectedGuidance = [];
        profileGuidanceChecklist.querySelectorAll('input:checked').forEach(cb => selectedGuidance.push(cb.value));
        currentUser.profile.guidance = selectedGuidance;
        
        const users = JSON.parse(localStorage.getItem('legacyLearnersUsers')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('legacyLearnersUsers', JSON.stringify(users));
        }
        
        localStorage.setItem('legacyLearnersCurrentUser', JSON.stringify(currentUser));
        updateProfileCompletion(currentUser);
        showMessage('Profile updated successfully!');
    });
    
    bookSessionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedSlot = bookSessionForm.querySelector('input[name="time-slot"]:checked');
        if (!selectedSlot) {
            showMessage('Please select a time slot to book.');
            return;
        }

        const mentorId = parseInt(bookSessionForm.dataset.mentorId);
        const mentor = allMentors.find(m => m.id === mentorId);
        
        const sessions = JSON.parse(localStorage.getItem('legacyLearnersSessions')) || [];
        const newSession = {
            sessionId: Date.now(),
            mentorId: mentor.id,
            menteeId: currentUser.email,
            slot: selectedSlot.value,
            status: 'Pending'
        };
        sessions.push(newSession);
        localStorage.setItem('legacyLearnersSessions', JSON.stringify(sessions));

        closeModal(bookSessionModal);
        showMessage(`Your session request has been sent to ${mentor.name}! For more details and updates, go to 'My Sessions' on your dashboard.`, () => {
            renderMySessions();
            showView('sessions-content');
        });
        bookSessionForm.reset();
    });

    // --- Find Mentor Page Logic ---
    const showMentorProfile = (mentorId) => {
        const mentor = allMentors.find(m => m.id === mentorId);
        if (!mentor) return;

        mentorProfileDetails.innerHTML = `
            <div class="flex flex-col md:flex-row gap-8 items-center">
                <img src="${mentor.image}" alt="Portrait of ${mentor.name}" class="w-32 h-32 rounded-full object-cover border-4 border-indigo-200">
                <div class="text-center md:text-left">
                    <h2 class="text-3xl font-bold">${mentor.name}</h2>
                    <p class="text-indigo-600 font-semibold">${mentor.headline}</p>
                </div>
            </div>
            <hr class="my-8">
            <div>
                <h3 class="text-xl font-bold mb-2">About Me</h3>
                <p class="text-gray-600">${mentor.about}</p>
            </div>
            <div class="mt-6">
                <h3 class="text-xl font-bold mb-2">My Expertise</h3>
                <div class="flex flex-wrap gap-2">
                    ${mentor.expertise.map(tag => `<span class="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="mt-8 text-center">
                <button data-mentor-id="${mentor.id}" class="book-session-btn w-full md:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition">
                    Book a Session with ${mentor.name.split(' ')[0]}
                </button>
            </div>
        `;
        showView('mentor-profile-content');
    };

    const renderMentors = (mentors, gridElement) => {
        gridElement.innerHTML = '';
        if (mentors.length === 0) {
            gridElement.innerHTML = `<p class="col-span-full text-center text-gray-500">No mentors found.</p>`;
            if(mentorResultsCount) mentorResultsCount.textContent = '0 Mentors Found';
            return;
        }

        if(mentorResultsCount) mentorResultsCount.textContent = `${mentors.length} Mentor${mentors.length > 1 ? 's' : ''} Found`;

        mentors.forEach(mentor => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-lg overflow-hidden flex flex-col';
            card.innerHTML = `
                <img src="${mentor.image}" alt="Portrait of ${mentor.name}" class="w-full h-40 object-cover">
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-lg font-bold">${mentor.name}</h3>
                    <p class="text-sm text-indigo-600 font-semibold mb-2">${mentor.headline}</p>
                    <p class="text-gray-600 text-sm italic mb-3">"${mentor.quote}"</p>
                    <div class="flex-grow"></div>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${mentor.expertise.map(tag => `<span class="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">${tag}</span>`).join('')}
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <button data-mentor-id="${mentor.id}" class="view-profile-btn card-btn card-btn-primary flex-1">View Profile</button>
                        <button class="card-btn-icon" title="Save Mentor">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                        </button>
                    </div>
                </div>
            `;
            gridElement.appendChild(card);
        });
    };

    findMentorGrid.addEventListener('click', (e) => {
        const viewProfileButton = e.target.closest('.view-profile-btn');
        if (viewProfileButton) {
            const mentorId = parseInt(viewProfileButton.dataset.mentorId);
            showMentorProfile(mentorId);
        }
    });
    
    mentorProfileDetails.addEventListener('click', (e) => {
        const bookSessionButton = e.target.closest('.book-session-btn');
        if (bookSessionButton) {
            const mentorId = parseInt(bookSessionButton.dataset.mentorId);
            const mentor = allMentors.find(m => m.id === mentorId);
            if(mentor) {
                document.getElementById('book-session-title').textContent = `Book a Session with ${mentor.name}`;
                bookSessionForm.dataset.mentorId = mentor.id;
                populateTimeSlots();
                openModal(bookSessionModal);
            }
        }
    });

    const applyFiltersAndSort = () => {
        const keyword = document.getElementById('keyword-search').value.toLowerCase();
        const selectedIndustries = Array.from(industryFilters.querySelectorAll('input:checked')).map(cb => cb.value);
        const selectedExpertise = Array.from(expertiseFilters.querySelectorAll('input:checked')).map(cb => cb.value);
        
        let filteredMentors = allMentors.filter(mentor => {
            const matchesKeyword = keyword === '' ||
                mentor.name.toLowerCase().includes(keyword) ||
                mentor.headline.toLowerCase().includes(keyword) ||
                mentor.industry.toLowerCase().includes(keyword) ||
                mentor.expertise.some(e => e.toLowerCase().includes(keyword));

            const matchesIndustry = selectedIndustries.length === 0 || selectedIndustries.includes(mentor.industry);
            const matchesExpertise = selectedExpertise.length === 0 || selectedExpertise.some(e => mentor.expertise.includes(e));

            return matchesKeyword && matchesIndustry && matchesExpertise;
        });
        
        const sortBy = sortMentors.value;
        if (sortBy === 'newly-joined') {
            filteredMentors.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
        }

        renderMentors(filteredMentors, findMentorGrid);
    };

    const populateFilters = () => {
        const industries = [...new Set(allMentors.map(m => m.industry))];
        const expertise = [...new Set(allMentors.flatMap(m => m.expertise))];

        industryFilters.innerHTML = industries.map(industry => `
            <label class="flex items-center space-x-2"><input type="checkbox" value="${industry}" class="form-checkbox h-4 w-4 text-indigo-600 rounded"><span>${industry}</span></label>
        `).join('');

        expertiseFilters.innerHTML = expertise.map(exp => `
            <label class="flex items-center space-x-2"><input type="checkbox" value="${exp}" class="form-checkbox h-4 w-4 text-indigo-600 rounded"><span>${exp}</span></label>
        `).join('');
    };
    
    filterForm.addEventListener('input', applyFiltersAndSort);
    sortMentors.addEventListener('change', applyFiltersAndSort);
    
    // --- Session Booking & Display Logic ---
    const generateTimeSlots = () => {
        const slots = [];
        const now = new Date();
        for (let i = 1; i < 8; i++) { // Generate for the next 7 days
            const day = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
            if (day.getDay() > 0 && day.getDay() < 6) { // Monday to Friday
                for (let hour = 10; hour <= 16; hour++) { // 10 AM to 4 PM
                    slots.push(new Date(day.setHours(hour, 0, 0, 0)));
                    slots.push(new Date(day.setHours(hour, 30, 0, 0)));
                }
            }
        }
        return slots;
    };

    const populateTimeSlots = () => {
        const slots = generateTimeSlots();
        timeSlotsContainer.innerHTML = '';
        slots.forEach((slot, index) => {
            const formattedDate = slot.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const formattedTime = slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const slotValue = slot.toISOString();
            timeSlotsContainer.innerHTML += `
                <div>
                    <input type="radio" name="time-slot" id="slot-${index}" value="${slotValue}" class="hidden peer">
                    <label for="slot-${index}" class="block text-center p-2 border rounded-lg cursor-pointer peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 hover:bg-gray-100">
                        <p class="text-sm font-semibold">${formattedDate}</p>
                        <p class="text-xs">${formattedTime}</p>
                    </label>
                </div>
            `;
        });
    };
    
    const renderMySessions = () => {
        const sessions = JSON.parse(localStorage.getItem('legacyLearnersSessions')) || [];
        const mySessions = sessions.filter(s => s.menteeId === currentUser.email);
        const now = new Date();

        const upcoming = mySessions.filter(s => s.status === 'Confirmed' && new Date(s.slot) > now);
        const pending = mySessions.filter(s => s.status === 'Pending');
        const past = mySessions.filter(s => new Date(s.slot) <= now);

        // Render Upcoming
        if (upcoming.length === 0) {
            upcomingSessionsContent.innerHTML = `<div class="bg-white p-8 rounded-lg shadow-md text-center"><p class="text-gray-600">You have no upcoming sessions. Time to find a mentor!</p><button id="find-mentor-shortcut" class="mt-4 card-btn card-btn-primary">Find a Mentor</button></div>`;
        } else {
            upcomingSessionsContent.innerHTML = upcoming.map(session => {
                const mentor = allMentors.find(m => m.id === session.mentorId);
                const sessionDate = new Date(session.slot);
                const formattedDate = sessionDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const formattedTime = sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                return `
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="flex flex-col sm:flex-row gap-6">
                            <img src="${mentor.image}" alt="${mentor.name}" class="w-24 h-24 rounded-full object-cover">
                            <div>
                                <h3 class="text-2xl font-bold">Session with ${mentor.name}</h3>
                                <p class="text-gray-700 mt-2 font-semibold">${formattedDate} at ${formattedTime}</p>
                                <div class="mt-4 flex flex-wrap gap-2">
                                    <button class="card-btn card-btn-primary">Join Call</button>
                                    <button class="card-btn card-btn-secondary">Reschedule</button>
                                    <button class="card-btn card-btn-secondary !bg-red-100 !text-red-700 hover:!bg-red-200">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render Pending
        if (pending.length === 0) {
            pendingSessionsContent.innerHTML = `<div class="bg-white p-8 rounded-lg shadow-md text-center"><p class="text-gray-600">You have no pending session requests.</p></div>`;
        } else {
            pendingSessionsContent.innerHTML = pending.map(session => {
                const mentor = allMentors.find(m => m.id === session.mentorId);
                return `
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="flex items-center gap-6">
                            <img src="${mentor.image}" alt="${mentor.name}" class="w-24 h-24 rounded-full object-cover">
                            <div>
                                <h3 class="text-xl font-bold">Request sent to ${mentor.name}</h3>
                                <p class="text-gray-500">Awaiting response for session on ${new Date(session.slot).toLocaleDateString()}</p>
                                <button class="mt-2 text-red-500 hover:underline text-sm">Withdraw Request</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render Past
        if (past.length === 0) {
            pastSessionsContent.innerHTML = `<div class="bg-white p-8 rounded-lg shadow-md text-center"><p class="text-gray-600">You have no past sessions.</p></div>`;
        } else {
            pastSessionsContent.innerHTML = past.map(session => {
                const mentor = allMentors.find(m => m.id === session.mentorId);
                return `
                    <div class="bg-white p-6 rounded-lg shadow-md opacity-70">
                        <div class="flex items-center gap-6">
                            <img src="${mentor.image}" alt="${mentor.name}" class="w-24 h-24 rounded-full object-cover">
                            <div>
                                <h3 class="text-xl font-bold">Session with ${mentor.name}</h3>
                                <p class="text-gray-500">Completed on ${new Date(session.slot).toLocaleDateString()}</p>
                                <div class="mt-2 flex gap-2">
                                    <button class="card-btn card-btn-secondary">Leave a Review</button>
                                    <button class="card-btn card-btn-secondary">Schedule Follow-up</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    };
    
    sessionsTabs.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const tab = e.target.dataset.tab;
            sessionsTabs.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('border-indigo-500', 'text-indigo-600');
                btn.classList.add('border-transparent', 'hover:text-gray-600', 'hover:border-gray-300');
            });
            e.target.classList.add('border-indigo-500', 'text-indigo-600');
            e.target.classList.remove('border-transparent', 'hover:text-gray-600', 'hover:border-gray-300');
            
            sessionsTabContent.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                panel.classList.add('hidden');
            });
            document.getElementById(`${tab}-sessions-content`).classList.remove('hidden');
        }
    });

    const renderMentorDashboard = () => {
        const firstName = currentUser.name.split(' ')[0];
        mentorDashboardWelcome.textContent = `Welcome to your Dashboard, ${firstName}!`;
        
        const sessions = JSON.parse(localStorage.getItem('legacyLearnersSessions')) || [];
        const myMentorId = allMentors.find(m => m.email === currentUser.email)?.id;
        if (!myMentorId) return;

        const pendingRequests = sessions.filter(s => s.mentorId === myMentorId && s.status === 'Pending');
        
        viewRequestsBtn.textContent = `View Requests (${pendingRequests.length} New)`;
    };

    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'find-mentor-shortcut') {
            renderMentors(allMentors, findMentorGrid);
            showView('find-mentor-page-content');
        }
    });
    
    // --- Initial Setup ---
    function initialize() {
        populateGuidanceChecklist();
        populateFilters();
        renderMentors(allMentors, guestMentorGrid);
        const savedUser = localStorage.getItem('legacyLearnersCurrentUser');
        if (savedUser) {
            updateUIForLogin(JSON.parse(savedUser));
        } else {
            updateUIForLogout();
        }
    }

    initialize();
});
