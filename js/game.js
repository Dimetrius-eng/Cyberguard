// --- LOGIC: GAME ENGINE ---

// Об'єкт для збереження звуків
const audioFiles = {
    click: new Audio('sounds/click.mp3'),
    success: new Audio('sounds/success.mp3'),
    error: new Audio('sounds/error.mp3')
};

// Налаштування гучності (щоб не кричало)
Object.values(audioFiles).forEach(sound => sound.volume = 0.5);

function playSound(name) {
    const sound = audioFiles[name];
    if (sound) {
        sound.currentTime = 0; // Перемотати на початок (для швидких кліків)
        sound.play().catch(e => console.log("Audio blocked:", e));
    }
}

function changeLanguage(lang) {
    if (typeof translations === 'undefined') return;
    currentLang = lang;
    
    // Оновлення кнопок
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${lang}`);
    if(btn) btn.classList.add('active');

    // Оновлення текстів
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

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
        
        // Додаємо звук кліку на всі кнопки глобально
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                playSound('click');
            }
        });

        this.init();
    }

    init() {
        const saved = localStorage.getItem('cyberguard_level');
        if (saved) this.currentLevelIndex = parseInt(saved);
        
        changeLanguage(currentLang);
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

        // Оновлення додаткового напису (Credentials)
        const lbl = document.getElementById('level-label');
        if(lbl && txt.label) lbl.innerText = txt.label;

        if (this.levelIndicator) this.levelIndicator.innerText = this.currentLevelIndex + 1;
    }

    checkLevel() {
        if (this.isTransitioning) return;
        const level = levels[this.currentLevelIndex];
        try {
            const result = level.checkSolution();
            if (result.success) {
                // ЗВУК УСПІХУ
                playSound('success');
                
                this.log(translations[currentLang].console_success, 'success', 'console_success');
                this.isTransitioning = true;
                setTimeout(() => this.nextLevel(), 1500);
            } else {
                // ЗВУК ПОМИЛКИ
                playSound('error');
                
                this.log(translations[currentLang].console_error, 'error', 'console_error');
                
                // Ефект тремтіння екрану при помилці
                document.body.style.animation = "shake 0.3s";
                setTimeout(() => document.body.style.animation = "", 300);
            }
        } catch (e) { console.error(e); }
    }

    nextLevel() {
        this.currentLevelIndex++;
        localStorage.setItem('cyberguard_level', this.currentLevelIndex);
        this.log(translations[currentLang].console_level_load, 'info', 'console_level_load');
        this.renderLevel();
    }

    log(msg, type = 'info', translationKey = null) {
        if (!this.consoleOutput) return;
        const p = document.createElement('p');
        p.innerText = `> ${msg}`;
        p.className = 'log-entry ' + (type === 'success' ? 'log-success' : (type === 'error' ? 'log-error' : ''));
        if (translationKey) p.setAttribute('data-lang', translationKey);
        this.consoleOutput.appendChild(p);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    showVictory() {
        // Звук перемоги (той самий, що й успіх, або можна додати окремий win.mp3)
        playSound('success');

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
