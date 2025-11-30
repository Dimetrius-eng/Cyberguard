// --- LOGIC: GAME ENGINE ---

function changeLanguage(lang) {
    if (typeof translations === 'undefined') return;
    currentLang = lang;
    
    // 1. Оновлення кнопок
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${lang}`);
    if(btn) btn.classList.add('active');

    // 2. Оновлення ВСІХ текстів з data-lang (включаючи логи консолі)
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        // Якщо переклад існує, замінюємо текст
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // 3. Перемальовка рівня
    if(window.game) window.game.renderLevel();
}

class GameEngine {
    constructor() {
        this.currentLevelIndex = 0;
        this.consoleOutput = document.getElementById('console-output');
        this.levelTitle = document.getElementById('level-title');
        this.levelDesc = document.getElementById('level-description');
        this.levelContent = document.getElementById('level-content');
        this.levelIndicator = document.getElementById('level-indicator');
        this.globalResetBtn = document.getElementById('global-reset-btn');
        
        this.isTransitioning = false;
        this.init();
    }

    init() {
        const saved = localStorage.getItem('cyberguard_level');
        if (saved) this.currentLevelIndex = parseInt(saved);
        
        changeLanguage(currentLang);
        
        // ВАЖЛИВО: Передаємо третій параметр 'console_boot'
        this.log(translations[currentLang].console_boot, 'info', 'console_boot');
        
        this.renderLevel();
    }

    renderLevel() {
        this.isTransitioning = false;
        if (this.currentLevelIndex >= levels.length) { this.showVictory(); return; }

        if(this.globalResetBtn) this.globalResetBtn.style.display = 'block';

        const level = levels[this.currentLevelIndex];
        const txt = level.texts[currentLang];

        if (this.levelTitle) this.levelTitle.innerText = txt.title;
        if (this.levelDesc) this.levelDesc.innerText = txt.description;
        if (this.levelContent) this.levelContent.innerHTML = level.html;
        
        const btn = document.getElementById('level-btn');
        if(btn) btn.innerText = txt.btn;

        if (this.levelIndicator) this.levelIndicator.innerText = this.currentLevelIndex + 1;
    }

    checkLevel() {
        if (this.isTransitioning) return;
        const level = levels[this.currentLevelIndex];
        try {
            const result = level.checkSolution();
            if (result.success) {
                // Використовуємо generic повідомлення успіху для консолі, щоб воно перекладалось
                // А деталі з result.message поки залишаємо як є (вони приходять з checkSolution)
                // АБО можна використовувати заготовлений ключ console_success
                this.log(translations[currentLang].console_success, 'success', 'console_success');
                
                this.isTransitioning = true;
                setTimeout(() => this.nextLevel(), 1500);
            } else {
                this.log(translations[currentLang].console_error, 'error', 'console_error');
            }
        } catch (e) { console.error(e); }
    }

    nextLevel() {
        this.currentLevelIndex++;
        localStorage.setItem('cyberguard_level', this.currentLevelIndex);
        
        // Логуємо завантаження нового рівня
        this.log(translations[currentLang].console_level_load, 'info', 'console_level_load');
        
        this.renderLevel();
    }

    // ОНОВЛЕНА ФУНКЦІЯ LOG
    // Приймає 3-й параметр: translationKey
    log(msg, type = 'info', translationKey = null) {
        if (!this.consoleOutput) return;
        
        const p = document.createElement('p');
        p.innerText = `> ${msg}`;
        p.className = 'log-entry ' + (type === 'success' ? 'log-success' : (type === 'error' ? 'log-error' : ''));
        
        // Якщо передали ключ, додаємо атрибут data-lang
        if (translationKey) {
            p.setAttribute('data-lang', translationKey);
        }

        this.consoleOutput.appendChild(p);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    showVictory() {
        const t = translations[currentLang];
        
        if(this.globalResetBtn) this.globalResetBtn.style.display = 'none';
        
        this.levelTitle.innerText = t.win_title;
        this.levelDesc.innerText = t.win_desc;
        this.levelIndicator.innerText = "ROOT";
        
        this.levelContent.innerHTML = `
            <div style="text-align:center">
                <h1 style="color:#00ff41">${t.win_h1}</h1>
                <p>${t.win_msg}</p>
                <button onclick="localStorage.clear();location.reload()" class="reset-btn" style="padding: 15px; font-size: 1.2em;">${t.restart_btn}</button>
            </div>
        `;
        
        // Лог про перемогу
        this.log(t.console_win, 'success', 'console_win');
    }
}

// Запуск
window.addEventListener('load', () => {
    if (typeof levels === 'undefined' || typeof translations === 'undefined') {
        console.error("Data missing");
        return;
    }
    window.game = new GameEngine();
});