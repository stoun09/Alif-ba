document.addEventListener('DOMContentLoaded', () => {

    // --- GESTION DE LA BASE DE DONNÉES LOCALE ---
    const DB = {
        getUsers: () => {
            try {
                return JSON.parse(localStorage.getItem('users')) || {};
            } catch (e) {
                return {};
            }
        },
        saveUsers: (users) => {
            localStorage.setItem('users', JSON.stringify(users));
        },
        getCurrentUser: () => {
            try {
                return JSON.parse(localStorage.getItem('currentUser')) || null;
            } catch (e) {
                return null;
            }
        },
        setCurrentUser: (user) => {
            localStorage.setItem('currentUser', JSON.stringify(user));
        },
        logout: () => {
            localStorage.removeItem('currentUser');
        }
    };

    // --- LOGIQUE D'INSCRIPTION (register.html) ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const usernameInput = document.getElementById('username');
        const usernameError = document.getElementById('username-error');
        const avatars = document.querySelectorAll('.avatar-option');
        let selectedAvatar = 'avatar1.png'; // Avatar par défaut

        avatars.forEach(avatar => {
            avatar.addEventListener('click', () => {
                avatars.forEach(a => a.classList.remove('active'));
                avatar.classList.add('active');
                selectedAvatar = avatar.dataset.avatar;
            });
        });

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = usernameInput.value.trim();
            const age = document.getElementById('age').value;
            const users = DB.getUsers();

            if (!username || !age) {
                usernameError.textContent = 'Le pseudo et l\'âge sont requis.';
                return;
            }

            if (users[username]) {
                usernameError.textContent = `Ce pseudo est déjà pris ! Essaie avec ${username}123 ou ${username}_${Math.floor(Math.random() * 100)}`;
            } else {
                const newUser = {
                    username,
                    age,
                    avatar: selectedAvatar,
                    progress: {
                        score: 0,
                        completedExercises: {}
                    }
                };
                users[username] = newUser;
                DB.saveUsers(users);
                DB.setCurrentUser(newUser);
                window.location.href = 'home.html';
            }
        });
    }

    // --- LOGIQUE DE CONNEXION (login.html) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const usernameInput = document.getElementById('username');
        const loginError = document.getElementById('login-error');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = usernameInput.value.trim();
            const users = DB.getUsers();

            if (users[username]) {
                DB.setCurrentUser(users[username]);
                window.location.href = 'home.html';
            } else {
                loginError.textContent = 'Ce pseudo n\'existe pas.';
            }
        });

        const guestModeLink = document.getElementById('guest-mode');
        if (guestModeLink) { // S'assurer que le bouton existe sur la page
            guestModeLink.addEventListener('click', (e) => {
                e.preventDefault();
                DB.setCurrentUser({ username: 'Invité', guest: true, progress: { score: 0, completedExercises: {} } });
                window.location.href = 'home.html';
            });
        }
    }

    // --- LOGIQUE D'ACCÈS PARENTS (index.html et login.html) ---
    const parentAccessBtn = document.getElementById('parent-access-btn');
    if (parentAccessBtn) {
        parentAccessBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let storedCode = localStorage.getItem('parentAccessCode');

            if (!storedCode) {
                // Si aucun code n'est défini, c'est la première utilisation. On demande de le créer.
                const newCode = prompt("Aucun code d'accès parent n'est défini. Veuillez en créer un (4 chiffres) :");
                if (newCode && newCode.match(/^\d{4}$/)) {
                    localStorage.setItem('parentAccessCode', newCode);
                    alert("Le nouveau code d'accès a été enregistré.");
                } else if (newCode) {
                    alert("Le code doit être composé de 4 chiffres.");
                }
                return; // On arrête ici après la configuration
            }

            const enteredCode = prompt("Veuillez entrer le code d'accès parent :");

            if (enteredCode === storedCode) {
                sessionStorage.setItem('parentAccessGranted', 'true');
                window.location.href = 'parents.html';
            } else if (enteredCode) { // Si l'utilisateur a entré quelque chose mais que c'est faux
                alert('Code d\'accès incorrect.');
            }
        });
    }

    // --- MISE À JOUR DE L'INTERFACE (home.html) ---
    const currentUser = DB.getCurrentUser();
    if (document.body.contains(document.getElementById('welcome-message'))) {
        const welcomeMessage = document.getElementById('welcome-message');
        const userProfile = document.getElementById('user-profile');

        if (currentUser) {
            if (currentUser.guest) {
                welcomeMessage.textContent = 'Bienvenue, Invité !';
                userProfile.innerHTML = '<a href="#" id="logout-btn" class="auth-link">Quitter</a>';
            } else {
                welcomeMessage.innerHTML = `Bienvenue, <span class="username">${currentUser.username}</span> !`;
                userProfile.innerHTML = `
                    <img src="images/avatars/${currentUser.avatar}" alt="Avatar" class="profile-avatar">
                    <a href="#" id="logout-btn" class="auth-link">Se déconnecter</a>
                `;
            }

            // Logique de déconnexion commune pour les invités et les utilisateurs enregistrés
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    DB.logout();
                    window.location.replace('login.html');
                });
            }
        } 
    }
});