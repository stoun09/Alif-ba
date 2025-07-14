// progressManager.js

// Ce script doit être inclus dans chaque page d'exercice.
// Il s'appuie sur l'objet currentUser défini dans localStorage par auth.js.

const ProgressManager = {
    // Fonctions pour interagir avec le localStorage
    DB: {
        getUsers: () => JSON.parse(localStorage.getItem('users')) || {},
        saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
        getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')) || null,
        setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
    },

    /**
     * Charge la progression totale de l'utilisateur actuel.
     * @returns {object} L'objet de progression de l'utilisateur.
     */
    loadProgress: function() {
        const currentUser = this.DB.getCurrentUser();
        if (!currentUser) return { score: 0, completedExercises: {} }; // Pas d'utilisateur

        // Pour les invités, la progression est stockée temporairement
        if (currentUser.guest) {
            return currentUser.progress || { score: 0, completedExercises: {} };
        }

        // Pour les utilisateurs enregistrés, on récupère depuis la "base de données"
        const users = this.DB.getUsers();
        if (users[currentUser.username] && users[currentUser.username].progress) {
            return users[currentUser.username].progress;
        }
        return { score: 0, completedExercises: {} }; // Progression par défaut
    },

    /**
     * Sauvegarde l'objet de progression complet pour l'utilisateur actuel.
     * @param {object} progressData L'objet de progression à sauvegarder.
     */
    saveProgress: function(progressData) {
        const currentUser = this.DB.getCurrentUser();
        if (!currentUser) return; // Ne rien faire si personne n'est connecté

        if (currentUser.guest) {
            currentUser.progress = progressData;
            this.DB.setCurrentUser(currentUser);
        } else {
            const users = this.DB.getUsers();
            if (users[currentUser.username]) {
                users[currentUser.username].progress = progressData;
                this.DB.saveUsers(users);
                // Mettre à jour également l'objet currentUser pour la session en cours
                this.DB.setCurrentUser(users[currentUser.username]);
            }
        }
    },

    /**
     * Met à jour le score total de l'utilisateur.
     * @param {number} points Le nombre de points à ajouter (peut être négatif).
     */
    updateScore: function(points) {
        const progress = this.loadProgress();
        if (!progress.score) {
            progress.score = 0;
        }
        progress.score += points;
        this.saveProgress(progress);
        return progress.score;
    },

    /**
     * Marque un exercice comme terminé.
     * @param {string} exerciseId L'ID de l'exercice (ex: 'exercice2').
     */
    completeExercise: function(exerciseId) {
        const progress = this.loadProgress();
        if (!progress.completedExercises) {
            progress.completedExercises = {};
        }
        progress.completedExercises[exerciseId] = true;
        this.saveProgress(progress);
    },

    // --- Fonctions de Récompenses ---

    /**
     * Joue un son.
     * @param {string} soundName Le nom du fichier son (ex: 'correct').
     */
    playSound: function(soundName) {
        // Assure que le chemin est relatif à la racine du projet
        const audio = new Audio(`../sounds/${soundName}.mp3`);
        audio.play().catch(error => console.error(`Erreur lors de la lecture du son ${soundName}:`, error));
    },

    /**
     * Déclenche une animation de confettis.
     */
    triggerConfetti: function() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 }
            });
        } else {
            console.error('La bibliothèque de confettis n\'est pas chargée.');
        }
    },

    /**
     * Met à jour les statistiques de bonnes/mauvaises réponses pour une lettre donnée.
     * @param {string} letter La lettre arabe concernée.
     * @param {boolean} isCorrect Indique si la réponse était correcte (true) ou incorrecte (false).
     */
    updateLetterStats: function(letter, isCorrect) {
        const progress = this.loadProgress();
        if (!progress.letterStats) {
            progress.letterStats = {};
        }
        if (!progress.letterStats[letter]) {
            progress.letterStats[letter] = { correct: 0, incorrect: 0 };
        }

        if (isCorrect) {
            progress.letterStats[letter].correct++;
        } else {
            progress.letterStats[letter].incorrect++;
        }
        this.saveProgress(progress);
    }
};