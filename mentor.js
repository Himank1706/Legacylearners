// mentor.js

document.addEventListener('DOMContentLoaded', function() {

    let currentUser = null;
    let userRole = 'learner'; // Default role
    let authAction = ''; // To track if user clicked 'login' or 'signup'
    let allMentors = []; // Will be populated from database

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
    const rescheduleModal = document.getElementById('reschedule-modal');
    const allModals = [roleChoiceModal, loginModal, signupModal, messageModal, bookSessionModal, rescheduleModal];

    // Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const profileForm = document.getElementById('profile-form');
    const filterForm = document.getElementById('filter-form');
    const bookSessionForm = document.getElementById('book-session-form');
    const rescheduleSessionForm = document.getElementById('reschedule-session-form');

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
    // Common fields
    const profileName = document.getElementById('profile-name');
    const profileHeadline = document.getElementById('profile-headline');
    const profileLocation = document.getElementById('profile-location');
    // Role-specific section containers
    const learnerProfileSection = document.getElementById('learner-profile-section');
    const mentorProfileSection = document.getElementById('mentor-profile-section');
    const mentorLinkFieldContainer = document.getElementById('mentor-link-field-container');
    // Learner fields
    const profileFocus = document.getElementById('profile-focus');
    const profileInterests = document.getElementById('profile-interests');
    const profileGuidanceChecklist = document.getElementById('profile-guidance-checklist');
    const profileGoals = document.getElementById('profile-goals');
    const profileEducation = document.getElementById('profile-education');
    const profileSkills = document.getElementById('profile-skills');
    const profileExpectations = document.getElementById('profile-expectations');
    // Mentor fields
    const profileMeetLink = document.getElementById('profile-meet-link');
    const profileIndustry = document.getElementById('profile-industry');
    const profileExpertise = document.getElementById('profile-expertise');
    const profileAbout = document.getElementById('profile-about');
    const profileQuote = document.getElementById('profile-quote');

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

    // --- API Functions ---
    const apiCall = async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API call failed');
            }
            
            const text = await response.text();
            return text ? JSON.parse(text) : {};
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    const loadMentors = async () => {
        try {
            allMentors = await apiCall('/api/mentors');
            allMentors = allMentors.map(mentor => ({
                id: mentor.id,
                name: mentor.name,
                email: mentor.email,
                headline: mentor.headline || 'Professional Mentor',
                industry: mentor.industry || 'General',
                expertise: mentor.expertise ? mentor.expertise.split(',').map(e => e.trim()) : ['Mentoring'],
                quote: mentor.quote || 'Sharing knowledge and experience.',
                image: mentor.image || 'https://placehold.co/400x400/a3a3a3/ffffff?text=' + encodeURIComponent(mentor.name || 'Mentor'),
                joinedDate: mentor.joined_date,
                about: mentor.about || 'Experienced professional ready to mentor.'
            }));
        } catch (error) {
            console.error('Failed to load mentors:', error);
            allMentors = [];
        }
    };

    // --- View Management ---
    const showView = (viewId) => {
        allViews.forEach(view => {
            view.classList.add('hidden');
        });
        const viewToShow = document.getElementById(viewId);
        if (viewToShow) {
            viewToShow.classList.remove('hidden');
        }
        window.scrollTo(0, 0);
    };

    // --- UI Update & Data Functions ---
    const updateProfileCompletion = (user) => {
        if (!user) return;
        const fields = [ user.name, user.headline, user.location ];
        if(user.role === 'learner') {
            fields.push(user.focus, user.interests, user.goals, user.education, user.skills, user.expectations);
        } else {
            fields.push(user.industry, user.expertise, user.about, user.personal_meet_link);
        }

        const filledFields = fields.filter(field => field && String(field).trim().length > 0).length;
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

        // Populate common profile fields first
        profileName.value = user.name || '';
        profileHeadline.value = user.headline || '';
        profileLocation.value = user.location || '';
        
        if (user.role === 'mentor') {
            renderMentorDashboard();
            showView('mentor-dashboard-content');
            
            // Toggle visibility of profile sections
            mentorLinkFieldContainer.classList.remove('hidden');
            mentorProfileSection.classList.remove('hidden');
            learnerProfileSection.classList.add('hidden');

            // Populate mentor-specific fields
            profileMeetLink.value = user.personal_meet_link || '';
            profileIndustry.value = user.industry || '';
            profileExpertise.value = user.expertise || '';
            profileAbout.value = user.about || '';
            profileQuote.value = user.quote || '';

        } else { // Learner
            dashboardWelcome.textContent = `Welcome to your Dashboard, ${firstName}!`;
            showView('dashboard-content');

            // Toggle visibility of profile sections
            mentorLinkFieldContainer.classList.add('hidden');
            mentorProfileSection.classList.add('hidden');
            learnerProfileSection.classList.remove('hidden');

            // Populate learner-specific fields
            profileFocus.value = user.focus || '';
            profileInterests.value = user.interests || '';
            profileGoals.value = user.goals || '';
            profileEducation.value = user.education || '';
            profileSkills.value = user.skills || '';
            profileExpectations.value = user.expectations || '';
            
            const guidanceArray = user.guidance ? user.guidance.split(',').map(g => g.trim()) : [];
            const guidanceCheckboxes = profileGuidanceChecklist.querySelectorAll('input[type="checkbox"]');
            guidanceCheckboxes.forEach(checkbox => {
                checkbox.checked = guidanceArray.includes(checkbox.value);
            });
        }
        updateProfileCompletion(currentUser);
        
        // Initialize profile in view mode
        if (typeof toggleEditMode === 'function') {
            toggleEditMode(false);
        }
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

    const handleLogout = (e) => { e.preventDefault(); updateUIForLogout(); };
    [logoutBtn, mobileLogoutBtn].forEach(btn => btn.addEventListener('click', handleLogout));

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        setTimeout(() => {
            const email = prompt("Please enter your email to reset your password:");
            if(email) {
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

    // --- Form Submission Logic ---
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (password !== confirmPassword) return showMessage('Passwords do not match.');

        try {
            await apiCall('/api/register', {
                method: 'POST',
                body: JSON.stringify({ username, name, email, password, role: userRole })
            });

            closeModal(signupModal);
            signupForm.reset();
            showMessage('Account created! Please log in.', () => {
                document.getElementById('login-title').textContent = `Log In as a ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`;
                openModal(loginModal);
            });
        } catch (error) {
            showMessage(error.message);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            const response = await apiCall('/api/login', {
                method: 'POST',
                body: JSON.stringify({ identifier, password, role: userRole })
            });

            closeModal(loginModal);
            loginForm.reset();
            updateUIForLogin(response.user);
        } catch (error) {
            showMessage(error.message);
        }
    });
    
    let isEditMode = false;
    
    const toggleEditMode = (editMode) => {
        isEditMode = editMode;
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        const inputs = profileForm.querySelectorAll('input, textarea, select');
        const checkboxes = profileForm.querySelectorAll('input[type="checkbox"]');
        
        if (editMode) {
            // Enable editing
            inputs.forEach(input => input.disabled = false);
            checkboxes.forEach(cb => cb.disabled = false);
            submitBtn.textContent = 'Save Changes';
            submitBtn.style.backgroundColor = '#4f46e5'; // indigo-600
            submitBtn.disabled = false;
        } else {
            // Disable editing
            inputs.forEach(input => input.disabled = true);
            checkboxes.forEach(cb => cb.disabled = true);
            submitBtn.textContent = 'Edit Profile';
            submitBtn.style.backgroundColor = '#059669'; // green-600
            submitBtn.disabled = false;
        }
    };

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
            showMessage('Please log in to update your profile.');
            return;
        }

        if (!isEditMode) {
            // Switch to edit mode
            toggleEditMode(true);
            return;
        }

        // Show loading state
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = '#9ca3af'; // gray-400

        try {
            // Collect data from all fields
            const profileData = {
                name: profileName.value.trim(),
                headline: profileHeadline.value.trim(),
                location: profileLocation.value.trim(),
            };

            if (currentUser.role === 'mentor') {
                Object.assign(profileData, {
                    personal_meet_link: profileMeetLink.value.trim(),
                    industry: profileIndustry.value.trim(),
                    expertise: profileExpertise.value.trim(),
                    about: profileAbout.value.trim(),
                    quote: profileQuote.value.trim()
                });
            } else { // Learner
                const selectedGuidance = [];
                profileGuidanceChecklist.querySelectorAll('input:checked').forEach(cb => selectedGuidance.push(cb.value));

                Object.assign(profileData, {
                    focus: profileFocus.value.trim(),
                    interests: profileInterests.value.trim(),
                    guidance: selectedGuidance.join(', '),
                    goals: profileGoals.value.trim(),
                    education: profileEducation.value.trim(),
                    skills: profileSkills.value.trim(),
                    expectations: profileExpectations.value.trim()
                });
            }

            // Make API call to update profile
            const response = await apiCall(`/api/profile/${currentUser.user_id || currentUser.id}`, {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            // Update current user object locally with the new data
            Object.assign(currentUser, profileData);
            localStorage.setItem('legacyLearnersCurrentUser', JSON.stringify(currentUser));
            
            // Update profile completion
            updateProfileCompletion(currentUser);
            
            // Switch back to view mode
            toggleEditMode(false);
            
            // Show success feedback
            showMessage('Profile updated successfully!');

            // If mentors list is loaded, refresh it to show updated info
            if (allMentors.length > 0) {
                await loadMentors();
                // Re-render mentors if we're currently viewing them
                const findMentorView = document.getElementById('find-mentor-page-content');
                const guestView = document.getElementById('guest-content');
                if (!findMentorView.classList.contains('hidden')) {
                    renderMentors(allMentors, findMentorGrid);
                }
                if (!guestView.classList.contains('hidden')) {
                    renderMentors(allMentors, guestMentorGrid);
                }
            }

        } catch (error) {
            console.error('Profile update error:', error);
            showMessage('Failed to update profile: ' + error.message);
            // Keep in edit mode if there was an error
            toggleEditMode(true);
        }
    });
    
    // Payment flow elements
    const paymentModal = document.getElementById('payment-modal');
    const proceedToPaymentBtn = document.getElementById('proceed-to-payment-btn');
    const verifyPaymentBtn = document.getElementById('verify-payment-btn');
    const backToBookingBtn = document.getElementById('back-to-booking-btn');
    const paymentReference = document.getElementById('payment-reference');

    // Add payment modal to allModals array
    allModals.push(paymentModal);

    proceedToPaymentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedSlot = bookSessionForm.querySelector('input[name="time-slot"]:checked');
        if (!selectedSlot) {
            showMessage('Please select a time slot to book.');
            return;
        }
        closeModal(bookSessionModal);
        openModal(paymentModal);
    });

    backToBookingBtn.addEventListener('click', () => {
        closeModal(paymentModal);
        openModal(bookSessionModal);
    });

    verifyPaymentBtn.addEventListener('click', async () => {
        const reference = paymentReference.value.trim();
        if (!reference) {
            showMessage('Please enter payment reference/transaction ID.');
            return;
        }

        const selectedSlot = bookSessionForm.querySelector('input[name="time-slot"]:checked');
        if (!selectedSlot) {
            showMessage('Session slot not found. Please start booking again.');
            return;
        }

        const mentorId = parseInt(bookSessionForm.dataset.mentorId);
        const mentor = allMentors.find(m => m.id === mentorId);

        try {
            // Verify payment first
            const paymentVerification = await apiCall('/api/verify-payment', {
                method: 'POST',
                body: JSON.stringify({
                    reference: reference,
                    amount: 500,
                    mentorId: mentor.id,
                    menteeId: currentUser.user_id || currentUser.id
                })
            });

            if (paymentVerification.verified) {
                // If payment verified, book the session
                await apiCall('/api/sessions', {
                    method: 'POST',
                    body: JSON.stringify({
                        mentorId: mentor.id,
                        menteeId: currentUser.user_id || currentUser.id,
                        slot: selectedSlot.value,
                        paymentReference: reference
                    })
                });

                closeModal(paymentModal);
                showMessage(`Payment verified! Your session request has been sent to ${mentor.name}!`, () => {
                    renderMySessions();
                    showView('sessions-content');
                });
                bookSessionForm.reset();
                paymentReference.value = '';
            } else {
                showMessage('Payment verification failed. Please check your transaction ID and try again.');
            }
        } catch (error) {
            showMessage('Failed to verify payment or book session: ' + error.message);
        }
    });
    
    if (rescheduleSessionForm) {
        rescheduleSessionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedSlot = rescheduleSessionForm.querySelector('input[name="reschedule-time-slot"]:checked');
            if (!selectedSlot) {
                showMessage('Please select a new time slot to reschedule.');
                return;
            }

            const sessionId = rescheduleSessionForm.dataset.sessionId;
            
            try {
                await apiCall(`/api/sessions/${sessionId}/reschedule`, {
                    method: 'PUT',
                    body: JSON.stringify({ newSlot: selectedSlot.value })
                });

                closeModal(rescheduleModal);
                showMessage('Your reschedule request has been sent.', () => {
                    renderMySessions();
                });
            } catch (error) {
                showMessage('Failed to reschedule session: ' + error.message);
            }
        });
    }

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
                populateTimeSlots(timeSlotsContainer);
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
        const industries = [...new Set(allMentors.map(m => m.industry).filter(Boolean))];
        const expertise = [...new Set(allMentors.flatMap(m => m.expertise).filter(Boolean))];

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
        // Updated to use current date, July 30, 2025
        const today = new Date('2025-07-30T00:00:00');
        for (let i = 1; i < 8; i++) { // Next 7 days
            const day = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
            if (day.getDay() > 0 && day.getDay() < 6) { // Mon-Fri
                for (let hour = 10; hour <= 16; hour++) { // 10 AM to 4 PM
                    slots.push(new Date(day.setHours(hour, 0, 0, 0)));
                    slots.push(new Date(day.setHours(hour, 30, 0, 0)));
                }
            }
        }
        return slots;
    };

    const populateTimeSlots = (container) => {
        const slots = generateTimeSlots();
        if (!container) return; 
        container.innerHTML = '';
        
        const inputName = container.id.includes('reschedule') ? 'reschedule-time-slot' : 'time-slot';

        slots.forEach((slot, index) => {
            const formattedDate = slot.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const formattedTime = slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const slotValue = slot.toISOString();
            const slotId = `${inputName}-slot-${index}`;
            container.innerHTML += `
                <div>
                    <input type="radio" name="${inputName}" id="${slotId}" value="${slotValue}" class="hidden peer">
                    <label for="${slotId}" class="block text-center p-2 border rounded-lg cursor-pointer peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 hover:bg-gray-100">
                        <p class="text-sm font-semibold">${formattedDate}</p>
                        <p class="text-xs">${formattedTime}</p>
                    </label>
                </div>
            `;
        });
    };
    
    const renderMySessions = async () => {
        if (!currentUser) return;
        
        try {
            const sessions = await apiCall(`/api/sessions/${currentUser.user_id || currentUser.id}`);
            const now = new Date();
    
            const upcoming = sessions.filter(s => s.status === 'Confirmed' && new Date(s.slot) > now);
            const pending = sessions.filter(s => s.status === 'Pending');
            const past = sessions.filter(s => new Date(s.slot) <= now || ['Completed', 'Cancelled'].includes(s.status));
    
            if (upcoming.length === 0) {
                upcomingSessionsContent.innerHTML = `<div class="bg-white p-8 rounded-lg shadow-md text-center"><p class="text-gray-600">You have no upcoming sessions!</p><button id="find-mentor-shortcut" class="mt-4 card-btn card-btn-primary"> </button></div>`;
            } else {
                upcomingSessionsContent.innerHTML = upcoming.map(session => {
                    const sessionDate = new Date(session.slot);
                    const formattedDate = sessionDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    const formattedTime = sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    
                    const otherPersonName = currentUser.role === 'mentor' ? session.mentee_name : session.mentor_name;
                    const otherPersonImage = currentUser.role === 'mentor' ? session.mentee_image : session.mentor_image;
                    const otherPersonInitial = otherPersonName ? encodeURIComponent(otherPersonName.charAt(0)) : 'U';

                    // Use session-specific meet_link or mentor's personal_meet_link as fallback
                    let meetingLink = session.meet_link || session.personal_meet_link;
                    let linkAvailable = meetingLink && meetingLink.trim() !== '';

                    return `
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <div class="flex flex-col sm:flex-row gap-6">
                                <img src="${otherPersonImage || 'https://placehold.co/96x96/a3a3a3/ffffff?text=' + otherPersonInitial}" alt="${otherPersonName}" class="w-24 h-24 rounded-full object-cover">
                                <div class="flex-grow">
                                    <h3 class="text-2xl font-bold">Session with ${otherPersonName}</h3>
                                    <p class="text-gray-700 mt-2 font-semibold">${formattedDate} at ${formattedTime}</p>
                                    <div class="mt-4 flex flex-wrap gap-2">
                                        <a href="${linkAvailable ? meetingLink : '#'}" target="_blank" rel="noopener noreferrer" class="card-btn card-btn-primary ${!linkAvailable ? 'opacity-50 cursor-not-allowed' : ''}" title="${!linkAvailable ? 'Meeting link not available. Please add a link or ask mentor to update their profile.' : 'Join Meeting'}">Join Call</a>
                                        <button data-session-id="${session.id}" data-other-person-name="${otherPersonName}" class="reschedule-btn card-btn card-btn-secondary">Reschedule</button>
                                        <button data-session-id="${session.id}" data-other-person-name="${otherPersonName}" class="edit-link-btn card-btn card-btn-secondary">Edit Link</button>
                                        <button data-session-id="${session.id}" class="cancel-btn card-btn card-btn-secondary !bg-red-100 !text-red-700 hover:!bg-red-200">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
    
            if (pending.length === 0) {
                pendingSessionsContent.innerHTML = `<div class="bg-white p-8 rounded-lg shadow-md text-center"><p class="text-gray-600">You have no pending session requests.</p></div>`;
            } else {
                pendingSessionsContent.innerHTML = pending.map(session => {
                    const sessionDate = new Date(session.slot);
                    const formattedDate = sessionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                    const formattedTime = sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                    if (currentUser.role === 'mentor' && currentUser.id === session.mentor_id) {
                        const menteeNameInitial = session.mentee_name ? encodeURIComponent(session.mentee_name.charAt(0)) : 'L';
                        return `
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <div class="flex flex-col sm:flex-row items-start gap-6">
                                    <img src="${session.mentee_image || 'https://placehold.co/96x96/c7d2fe/3730a3?text=' + menteeNameInitial}" alt="${session.mentee_name}" class="w-24 h-24 rounded-full object-cover">
                                    <div class="flex-grow">
                                        <h3 class="text-xl font-bold">Request from ${session.mentee_name}</h3>
                                        <p class="text-gray-600 font-semibold">${formattedDate} at ${formattedTime}</p>
                                        <div class="mt-4 flex flex-wrap gap-2">
                                            <button data-session-id="${session.id}" class="approve-request-btn card-btn card-btn-primary">Approve</button>
                                            <button data-session-id="${session.id}" class="decline-request-btn card-btn card-btn-secondary !bg-red-100 !text-red-700 hover:!bg-red-200">Decline</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <div class="flex items-center gap-6">
                                    <img src="${session.mentor_image || 'https://placehold.co/96x96/a3a3a3/ffffff?text=M'}" alt="${session.mentor_name}" class="w-24 h-24 rounded-full object-cover">
                                    <div>
                                        <h3 class="text-xl font-bold">Request sent to ${session.mentor_name}</h3>
                                        <p class="text-gray-500">Awaiting response for session on ${formattedDate}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                }).join('');
            }
    
            if (past.length === 0) {
                pastSessionsContent.innerHTML = `<div class="bg-white p-8 rounded-lg shadow-md text-center"><p class="text-gray-600">You have no past sessions.</p></div>`;
            } else {
                pastSessionsContent.innerHTML = past.map(session => {
                    const otherPersonName = currentUser.role === 'mentor' ? session.mentee_name : session.mentor_name;
                    const otherPersonImage = currentUser.role === 'mentor' ? session.mentee_image : session.mentor_image;
                    const otherPersonInitial = otherPersonName ? encodeURIComponent(otherPersonName.charAt(0)) : 'U';

                    let statusText, buttonArea, containerClass = 'bg-white p-6 rounded-lg shadow-md opacity-75';
                    if (session.status === 'Cancelled') {
                        statusText = `<p class="text-red-600 font-semibold">Cancelled</p>`;
                        containerClass = 'bg-red-50 p-6 rounded-lg shadow-md opacity-80';
                        buttonArea = `<p class="text-sm text-gray-500">This session was cancelled.</p>`;
                    } else {
                        statusText = `<p class="text-gray-500">Completed on ${new Date(session.slot).toLocaleDateString()}</p>`;
                        buttonArea = `<button class="card-btn card-btn-secondary">Leave a Review</button>`;
                    }

                    return `
                        <div class="${containerClass}">
                            <div class="flex items-center gap-6">
                                <img src="${otherPersonImage || 'https://placehold.co/96x96/a3a3a3/ffffff?text=' + otherPersonInitial}" alt="${otherPersonName}" class="w-24 h-24 rounded-full object-cover">
                                <div>
                                    <h3 class="text-xl font-bold">Session with ${otherPersonName}</h3>
                                    ${statusText}
                                    <div class="mt-2 flex gap-2">${buttonArea}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
            const errorHtml = `<div class="bg-red-100 text-red-700 p-4 rounded-lg">Error loading sessions.</div>`;
            upcomingSessionsContent.innerHTML = errorHtml;
            pendingSessionsContent.innerHTML = errorHtml;
            pastSessionsContent.innerHTML = errorHtml;
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
            
            sessionsTabContent.querySelectorAll('[role="tabpanel"]').forEach(panel => panel.classList.add('hidden'));
            document.getElementById(`${tab}-sessions-content`).classList.remove('hidden');
        }
    });

    sessionsTabContent.addEventListener('click', async (e) => {
        const approveBtn = e.target.closest('.approve-request-btn');
        const declineBtn = e.target.closest('.decline-request-btn');
        const rescheduleBtn = e.target.closest('.reschedule-btn');
        const cancelBtn = e.target.closest('.cancel-btn');
    
        const updateSessionStatus = async (sessionId, status) => {
            try {
                await apiCall(`/api/sessions/${sessionId}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status })
                });
                showMessage(`Request has been ${status.toLowerCase()}.`, () => {
                    renderMySessions();
                    if (currentUser.role === 'mentor') renderMentorDashboard();
                });
            } catch (error) {
                showMessage(`Failed to update request: ${error.message}`);
            }
        };
    
        if (approveBtn) {
            await updateSessionStatus(approveBtn.dataset.sessionId, 'Confirmed');
        } else if (declineBtn) {
            await updateSessionStatus(declineBtn.dataset.sessionId, 'Cancelled');
        } else if (cancelBtn) {
            if (confirm('Are you sure you want to cancel this session? You will receive a refund confirmation message.')) {
                const sessionId = cancelBtn.dataset.sessionId;
                try {
                    await apiCall(`/api/sessions/${sessionId}/status`, {
                        method: 'PUT',
                        body: JSON.stringify({ status: 'Cancelled' })
                    });
                    showMessage('Session cancelled successfully. We will process your refund within 5-7 business days. You will receive a confirmation email shortly.', () => {
                        renderMySessions();
                        if (currentUser.role === 'mentor') renderMentorDashboard();
                    });
                } catch (error) {
                    showMessage(`Failed to cancel session: ${error.message}`);
                }
            }
        } else if (rescheduleBtn) {
            const sessionId = rescheduleBtn.dataset.sessionId;
            const otherPersonName = rescheduleBtn.dataset.otherPersonName;
            const rescheduleSessionTitle = document.getElementById('reschedule-session-title');
            const rescheduleTimeSlotsContainer = document.getElementById('reschedule-time-slots-container');

            if (rescheduleModal && rescheduleSessionForm && rescheduleSessionTitle && rescheduleTimeSlotsContainer) {
                rescheduleSessionTitle.textContent = `Reschedule Session with ${otherPersonName}`;
                rescheduleSessionForm.dataset.sessionId = sessionId;
                populateTimeSlots(rescheduleTimeSlotsContainer);
                openModal(rescheduleModal);
            }
        }

        const editLinkBtn = e.target.closest('.edit-link-btn');
        if (editLinkBtn) {
            const sessionId = editLinkBtn.dataset.sessionId;
            const otherPersonName = editLinkBtn.dataset.otherPersonName;
            const newLink = prompt(`Enter meeting link for session with ${otherPersonName}:`, '');
            
            if (newLink !== null) {
                try {
                    await apiCall(`/api/sessions/${sessionId}/link`, {
                        method: 'PUT',
                        body: JSON.stringify({ meetLink: newLink.trim() })
                    });
                    showMessage('Meeting link updated successfully!', () => {
                        renderMySessions();
                    });
                } catch (error) {
                    showMessage('Failed to update meeting link: ' + error.message);
                }
            }
        }
    });

    const renderMentorDashboard = async () => {
        const firstName = currentUser.name.split(' ')[0];
        mentorDashboardWelcome.textContent = `Welcome to your Dashboard, ${firstName}!`;
        
        try {
            const sessions = await apiCall(`/api/sessions/${currentUser.user_id || currentUser.id}`);
            const pendingRequests = sessions.filter(s => s.status === 'Pending' && s.mentor_id === currentUser.id);
            if (pendingRequests.length > 0) {
                viewRequestsBtn.textContent = `View Requests (${pendingRequests.length} New)`;
                viewRequestsBtn.classList.add('animate-pulse');
            } else {
                viewRequestsBtn.textContent = `View Requests (0 New)`;
                viewRequestsBtn.classList.remove('animate-pulse');
            }
        } catch (error) {
            console.error('Failed to load mentor dashboard data:', error);
            viewRequestsBtn.textContent = 'View Requests';
        }
    };

    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'find-mentor-shortcut') {
            renderMentors(allMentors, findMentorGrid);
            showView('find-mentor-page-content');
        }
    });
    
    // --- Initial Setup ---
    async function initialize() {
        populateGuidanceChecklist();
        await loadMentors();
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
