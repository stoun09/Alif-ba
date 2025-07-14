document.addEventListener('DOMContentLoaded', () => {
    // Vérification de sécurité : l'accès à cette page est-il autorisé ?
    if (sessionStorage.getItem('parentAccessGranted') !== 'true') {
        alert("Accès non autorisé. Veuillez passer par l'accès parent.");
        window.location.href = 'index.html';
        return;
    }

    const userSelector = document.getElementById('user-selector');
    const dashboardContent = document.getElementById('dashboard-content');
    const noUserMessage = document.getElementById('no-user-message');
    const improvementCard = document.getElementById('areas-for-improvement'); 
    const allUsers = DB.getUsers(); // Utilise la DB de auth.js (doit être inclus avant)

    const childUsers = Object.values(allUsers).filter(user => !user.guest);

    if (childUsers.length === 0) {
        noUserMessage.style.display = 'block';
        document.getElementById('user-selector-container').style.display = 'none';
        improvementCard.style.display = 'none';
    } else {
        populateUserSelector(childUsers);
        userSelector.addEventListener('change', handleUserSelection);
        // Cacher les sections de données au début
        dashboardContent.style.display = 'none';
        improvementCard.style.display = 'none';
    }

    function populateUserSelector(users) {
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            userSelector.appendChild(option);
        });
    }

    function handleUserSelection() {
        const selectedUsername = userSelector.value;
        if (selectedUsername) {
            const selectedUser = allUsers[selectedUsername];
            const userProgress = selectedUser.progress || { score: 0, completedExercises: {}, letterStats: {} };
            displayDashboard(selectedUser, userProgress);
            displayImprovementAreas(userProgress.letterStats || {}); 
            dashboardContent.style.display = 'block';
        } else {
            dashboardContent.style.display = 'none';
            improvementCard.style.display = 'none';
        }
    }

    function displayDashboard(user, progress) {
        // La carte des points à améliorer est maintenant en dehors de ce innerHTML
        dashboardContent.innerHTML = `
            <section id="summary-card" class="dashboard-card">
                <h2>Résumé pour ${user.username}</h2>
                <div id="summary-content">
                    <img src="images/avatars/${user.avatar}" alt="Avatar de l'utilisateur" class="profile-avatar">
                    <div id="summary-details">
                        <p>Âge : ${user.age} ans</p>
                        <p class="score">Score Total : ${progress.score || 0}</p>
                    </div>
                </div>
            </section>

            <section id="exercises-card" class="dashboard-card">
                <h2>Exercices Terminés</h2>
                <ul id="completed-exercises-list">
                    ${generateCompletedList(progress.completedExercises || {})}
                </ul>
            </section>

            <section id="stats-card" class="dashboard-card">
                <h2>Détails par Lettre</h2>
                <div class="table-container">
                    <table id="letter-stats-table">
                        <thead>
                            <tr>
                                <th>Lettre</th>
                                <th>Réponses Correctes</th>
                                <th>Réponses Incorrectes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateLetterStats(progress.letterStats || {})}
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    }

    function displayImprovementAreas(stats) {
        const difficultLettersList = document.getElementById('areas-for-improvement-list');

        const difficultLetters = Object.entries(stats)
            .map(([letter, data]) => {
                const incorrect = data.incorrect || 0;
                const correct = data.correct || 0;
                const total = correct + incorrect;
                if (total === 0) return null; 

                const difficultyScore = (incorrect * 2) - correct;
                return { letter, difficultyScore, incorrect, total };
            })
            .filter(item => item && item.difficultyScore > 0) 
            .sort((a, b) => b.difficultyScore - a.difficultyScore) 
            .slice(0, 5); 

        if (difficultLetters.length > 0) {
            difficultLettersList.innerHTML = difficultLetters.map(item => 
                `<li>
                    <span class="difficult-letter">${item.letter}</span> - ${item.incorrect} erreur(s) sur ${item.total} tentative(s)
                </li>`
            ).join('');
            improvementCard.style.display = 'block';
        } else {
            difficultLettersList.innerHTML = '<li>Aucune difficulté particulière détectée. Excellent travail !</li>';
            improvementCard.style.display = 'block'; 
        }
    }

    function generateCompletedList(completed) {
        const exerciseNames = {
            'exercice1_level1': 'Composer les Mots (Niv. 1)',
            'exercice1_level2': 'Composer les Mots (Niv. 2)',
            'exercice1_level3': 'Composer les Mots (Niv. 3)',
            'exercice2_level1': 'Identifier la Lettre (Niv. 1)',
            'exercice2_level2': 'Identifier la Lettre (Niv. 2)',
            'exercice3_level1': 'Répéter le Mot (Niv. 1)',
            'exercice3_level2': 'Répéter le Mot (Niv. 2)',
            'exercice3_level3': 'Répéter le Mot (Niv. 3)',
        };

        if (Object.keys(completed).length === 0) {
            return '<li>Aucun exercice terminé pour le moment.</li>';
        }

        return Object.keys(completed)
            .map(id => `<li>${exerciseNames[id] || id}</li>`)
            .join('');
    }

    function generateLetterStats(stats) {
        if (Object.keys(stats).length === 0) {
            return '<tr><td colspan="3">Pas encore de statistiques.</td></tr>';
        }

        return Object.entries(stats)
            .map(([letter, data]) => `
                <tr>
                    <td class="letter">${letter}</td>
                    <td class="correct-count">${data.correct || 0}</td>
                    <td class="incorrect-count">${data.incorrect || 0}</td>
                </tr>
            `)
            .join('');
    }

    // À la fin du script, on efface le jeton d'accès pour des raisons de sécurité,
    // forçant le parent à retaper le code à chaque nouvelle visite de la page.
    // sessionStorage.removeItem('parentAccessGranted');
});
