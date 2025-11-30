// --- LOGIC: GAME ENGINE ---

const audioFiles = {
    click: new Audio('sounds/click.mp3'),
    success: new Audio('sounds/success.mp3'),
    error: new Audio('sounds/error.mp3')
};

// Налаштування аудіо
Object.values(audioFiles).forEach(sound => {
    sound.volume = 0.5;
    sound.preload = 'auto';
});

// ФУНКЦІЯ-ЧИСТИЛЬНИК: Зупиняє всі звуки
function stopAllSounds() {
    Object.values(audioFiles).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
}

function playSound(name) {
    const sound = audioFiles[name];
    if (sound) {
        // Спочатку повна тиша (вирішує проблему накладання)
        stopAllSounds();
        
        // Потім граємо потрібний звук
        const playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Ігноруємо помилки автозапуску
            });
        }
    }
}

// "Прогрів" аудіо для мобільних
function warmUpAudio() {
    Object.values(audioFiles).forEach(sound => {
        sound.muted = true;
        sound.play().then(() => {
            sound.pause();
            sound.currentTime = 0;
            sound.muted = false;
        }).catch(() => {});
    });
    document.removeEventListener('click', warmUpAudio);
    document.removeEventListener('touchstart', warmUpAudio);
}
document.addEventListener('click', warmUpAudio);
document.addEventListener('touchstart', warmUpAudio);


function changeLanguage(lang) {
    if (typeof translations === 'undefined') return;
    currentLang = lang;
    
    // Оновлення кнопок мови
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${lang}`);
    if(btn) btn.classList.add('active');

    // Оновлення ВСІХ текстів (включаючи кнопку Reset)
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
        
        // Глобальний клік для звуку (крім кнопки Reset, бо у неї своя логіка)
        document.addEventListener('click', (e) => {
            // Перевіряємо, чи це кнопка, і чи це НЕ кнопка Reset
            if (e.target.tagName === 'BUTTON' && e.target.id !== 'global-reset-btn') {
                // Граємо клік тільки якщо зараз не йде перехід (щоб не перебивати звук успіху)
                if (!this.isTransitioning) {
                    playSound('click');
                }
            }
        });

        this.init();
    }

    // МЕТОД ПОВНОГО СКИДАННЯ (викликається з HTML)
    triggerFullReset() {
        stopAllSounds(); // Зупинити все інше
        audioFiles.click.play(); // Програти клік
        
        console.log("Resetting...");
        
        // Затримка перед перезавантаженням
        setTimeout(() => {
            localStorage.clear();
            location.reload();
        }, 500);
    }

    init() {
        const saved = localStorage.getItem('cyberguard_level');
        if (saved) this.currentLevelIndex = parseInt(saved);
        
        // Застосовуємо мову
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
                // Тут playSound автоматично вимкне будь-який попередній клік
                playSound('success'); 
                this.log(translations[currentLang].console_success, 'success', 'console_success');
                this.isTransitioning = true;
                setTimeout(() => this.nextLevel(), 1500);
            } else {
                playSound('error'); 
                this.log(translations[currentLang].console_error, 'error', 'console_error');
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
                <button onclick="game.triggerFullReset()" class="reset-btn" style="padding: 15px; font-size: 1.2em;">${t.restart_btn}</button>
            </div>
        `;
        this.log(t.console_win, 'success', 'console_win');
    }
}

window.addEventListener('load', () => {
    if (typeof levels === 'undefined' || typeof translations === 'undefined') {
        console.error("Data missing");
        return;
    }
    window.game = new GameEngine();
});
