document.addEventListener('DOMContentLoaded', () => {

    // --- GESTION DU CLASSEMENT ---
    const leaderboardBody = document.getElementById('leaderboard-body');

    function populateLeaderboard() {
        if (!leaderboardBody) return;

        let users = [];
        try {
            const storedUsers = JSON.parse(localStorage.getItem('users')) || {};
            // Transforme l'objet en tableau et filtre les invités
            users = Object.values(storedUsers).filter(user => !user.guest);
        } catch (e) {
            console.error("Erreur lors de la lecture des utilisateurs pour le classement :", e);
            return;
        }

        // Trie les utilisateurs par score, du plus élevé au plus bas
        users.sort((a, b) => (b.progress.score || 0) - (a.progress.score || 0));

        // Vide le tableau avant de le remplir
        leaderboardBody.innerHTML = '';

        // Remplit le tableau avec les 10 meilleurs joueurs
        const topUsers = users.slice(0, 10);
        topUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.progress.score || 0}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    // --- GESTION DE L'UI DES EXERCICES (Niveaux complétés) ---
    function updateCompletedLevels() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.guest) return;

        const users = JSON.parse(localStorage.getItem('users')) || {};
        const userProgress = users[currentUser.username]?.progress;

        if (!userProgress || !userProgress.completedExercises) return;

        const completed = userProgress.completedExercises;

        // Parcourir tous les boutons de niveau sur la page
        document.querySelectorAll('.level-button').forEach(button => {
            const level = button.dataset.level;
            const exerciseContainer = button.closest('.exercise-container');
            if (!exerciseContainer) return;

            const exerciseId = `${exerciseContainer.id}_level${level}`;

            if (completed[exerciseId]) {
                button.classList.add('completed');
            }
        });
    }

    // --- GESTION DE LA LANGUE ---
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', (event) => {
            const selectedLanguage = event.target.value;
            // Ici, vous pourriez ajouter la logique pour changer la langue du site.
            console.log(`Langue sélectionnée : ${selectedLanguage}`);
        });
    }

    // --- INITIALISATION ---
    populateLeaderboard();
    updateCompletedLevels();

});