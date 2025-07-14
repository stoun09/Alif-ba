document.addEventListener('DOMContentLoaded', () => {
    const languageSelector = document.getElementById('language-selector');

    const getLanguage = () => {
        return localStorage.getItem('language') || 'fr'; // Français par défaut
    };

    const setLanguage = (lang) => {
        localStorage.setItem('language', lang);
    };

    const translatePage = () => {
        const lang = getLanguage();
        const translatableElements = document.querySelectorAll('[data-translate-key]');

        // Définir la direction de la page pour l'arabe
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', lang);
        }

        translatableElements.forEach(element => {
            const key = element.dataset.translateKey;
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
    };

    if (languageSelector) {
        languageSelector.value = getLanguage(); // Définit la valeur actuelle du sélecteur

        languageSelector.addEventListener('change', (e) => {
            setLanguage(e.target.value);
            translatePage();
        });
    }

    // Traduire la page au chargement initial
    translatePage();
});