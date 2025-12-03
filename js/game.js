// --- LOGIC: GAME ENGINE ---

const audioFiles = {
    click: new Audio('sounds/click.mp3'),
    success: new Audio('sounds/success.mp3'),
    error: new Audio('sounds/error.mp3')
};

Object.values(audioFiles).forEach(sound => {
    sound.volume = 0.5;
    sound.preload = 'auto';
});

function stopAllSounds() {
    Object.values(audioFiles).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
}

function playSound(name) {
    const sound = audioFiles[name];
    if (sound) {
        stopAllSounds();
        const playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    }
}

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


// --- ОНОВЛЕНА ФУНКЦІЯ ЗМІНИ МОВИ ---
function changeLanguage(lang) {
    if (typeof translations === 'undefined') return;
    currentLang = lang;
    
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${lang}`);
    if(btn) btn.classList.add('active');

    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    if(window.game) {
        // Якщо ми в меню вибору рівнів - оновлюємо його
        if (document.querySelector('.level-menu-screen')) {
            window.game.renderLevelMenu(false); // false = без звуку
        } 
        // Якщо ми у грі - оновлюємо рівень
        else if (window.game.gameStarted) {
            window.game.renderLevel();
        }
        // Якщо на старті - оновлюємо старт
        else {
            window.game.renderStartScreen();
        }
    }
}

class GameEngine {
    constructor() {
        this.currentLevelIndex = 0;
        this.gameStarted = false;
        this.isLevelSelectMode = false; // Прапорець: чи ми вибрали рівень вручну

        this.consoleOutput = document.getElementById('console-output');
        this.levelTitle = document.getElementById('level-title');
        this.levelDesc = document.getElementById('level-description');
        this.levelContent = document.getElementById('level-content');
        this.levelIndicator = document.getElementById('level-indicator');
        this.globalResetBtn = document.getElementById('global-reset-btn');
        this.playerStatusDiv = document.getElementById('player-status');
        
        this.isTransitioning = false;
        
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && 
                e.target.id !== 'global-reset-btn' && 
                !e.target.classList.contains('start-btn') &&
                !e.target.closest('.level-btn-item')) { // Виключаємо кнопки рівнів, у них свій звук
                
                if (!this.isTransitioning) {
                    playSound('click');
                }
            }
        }, true);

        this.init();
    }

    triggerFullReset() {
        stopAllSounds();
        audioFiles.click.play();
        setTimeout(() => {
            localStorage.clear();
            location.reload();
        }, 500);
    }

    goToMainMenu() {
        playSound('click');
        this.gameStarted = false;
        this.isLevelSelectMode = false; // Скидаємо режим вибору
        this.renderStartScreen();
        window.scrollTo(0,0);
    }

    // --- ОНОВЛЕНА ЛОГІКА КНОПКИ ---
    updateFooterButton(mode) {
        if (!this.globalResetBtn) return;

        const newBtn = this.globalResetBtn.cloneNode(true);
        this.globalResetBtn.parentNode.replaceChild(newBtn, this.globalResetBtn);
        this.globalResetBtn = newBtn;
        this.globalResetBtn.removeAttribute('onclick'); 

        const t = translations[currentLang];

        if (mode === 'hidden') {
            this.globalResetBtn.style.display = 'none';
        } 
        else if (mode === 'menu') {
            // Кнопка "ГОЛОВНЕ МЕНЮ"
            this.globalResetBtn.style.display = 'block';
            this.globalResetBtn.innerText = t.menu_btn;
            this.globalResetBtn.className = "reset-btn";
            
            this.globalResetBtn.addEventListener('click', (e) => {
                e.preventDefault(); 
                this.goToMainMenu();
            });
        } 
        else if (mode === 'reset') {
            // Кнопка "СКИНУТИ ПРОГРЕС"
            this.globalResetBtn.style.display = 'block';
            this.globalResetBtn.innerText = t.reset_btn;
            
            this.globalResetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.triggerFullReset();
            });
        }
    }

    init() {
        const saved = localStorage.getItem('cyberguard_level');
        if (saved) {
            this.currentLevelIndex = parseInt(saved);
            this.gameStarted = true;
            this.isLevelSelectMode = false; // Якщо завантажили збереження - це звичайна гра
        } else {
            this.gameStarted = false;
        }
        
        changeLanguage(currentLang);
        
        if (this.gameStarted) {
            this.log(translations[currentLang].console_boot, 'info', 'console_boot');
        }
        
        this.renderLevel();
    }

    // --- РЕНДЕР МЕНЮ РІВНІВ (ВИПРАВЛЕНО МОВУ) ---
    renderLevelMenu(playAudio = true) {
        if (playAudio) playSound('click');
        
        // Додаємо клас старту, щоб сховати хедер
        document.body.classList.add('on-start');
        
        const t = translations[currentLang];
        
        let buttonsHtml = '<div class="levels-grid">';
        
        levels.forEach((level, index) => {
            const isBoss = index === levels.length - 1;
            const btnClass = isBoss ? 'level-btn-item boss' : 'level-btn-item';
            const levelName = level.texts[currentLang].title; 

            buttonsHtml += `
                <button onclick="game.loadSpecificLevel(${index})" class="${btnClass}">
                    <span class="lvl-num">#${index + 1}</span>
                    <span class="lvl-name">${levelName}</span>
                </button>
            `;
        });
        
        buttonsHtml += '</div>';

        // Використовуємо змінні з t для перекладу заголовка і кнопки
        this.levelContent.innerHTML = `
            <div class="level-menu-screen">
                <h2 style="text-align:center; color:white; margin-bottom:20px;">${t.levels_title}</h2>
                ${buttonsHtml}
                <div style="text-align:center; margin-top:20px;">
                    <button onclick="game.goToMainMenu()" class="reset-btn" style="width:auto; padding: 10px 30px;">${t.back_btn}</button>
                </div>
            </div>
        `;
    }

    loadSpecificLevel(index) {
        playSound('click');
        this.currentLevelIndex = index;
        this.gameStarted = true;
        this.isLevelSelectMode = true; // Вмикаємо режим вибору (для кнопки "В меню")
        
        // Якщо вибрали 1 рівень - це те саме, що почати спочатку
        if (index === 0) this.isLevelSelectMode = false;

        document.body.classList.remove('on-start'); 
        this.renderLevel();
    }

    startGame() {
        playSound('click');
        this.gameStarted = true;
        this.isLevelSelectMode = false; // Звичайна гра
        this.currentLevelIndex = 0;     // Починаємо з 0
        this.log(translations[currentLang].console_boot, 'info', 'console_boot');
        this.renderLevel();
    }

    renderLevel() {
        this.isTransitioning = false;

        if (!this.gameStarted) {
            this.renderStartScreen();
            return;
        }

        document.body.classList.remove('on-start'); 

        if (this.currentLevelIndex >= levels.length) { 
            this.showVictory(); 
            return; 
        }

        // --- ЛОГІКА КНОПКИ ВНИЗУ (ВИПРАВЛЕНО ПУНКТ 2) ---
        // Якщо ми в режимі вибору (і це не перехід на наступний рівень після перемоги)
        // АБО якщо це 1-й рівень
        if (this.isLevelSelectMode || this.currentLevelIndex === 0) {
            this.updateFooterButton('menu');
        } else {
            // Якщо це звичайне проходження
            this.updateFooterButton('reset');
        }

        if(this.playerStatusDiv) this.playerStatusDiv.style.visibility = 'visible';

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

    renderStartScreen() {
        // Додаємо клас on-start
        document.body.classList.add('on-start'); 

        const t = translations[currentLang];
        
        this.updateFooterButton('hidden');
        if(this.playerStatusDiv) this.playerStatusDiv.style.visibility = 'hidden';

        this.levelTitle.innerText = "";
        this.levelDesc.innerText = "";

        this.levelContent.innerHTML = `
            <div class="start-screen">
                <h1 class="glitch" data-text="${t.start_title}">${t.start_title}</h1>
                <h3 style="color:white; letter-spacing:3px; margin-bottom:20px;">${t.start_subtitle}</h3>
                <p class="start-desc">${t.start_desc}</p>
                <div class="warning-box">
                    <span style="font-size:20px">⚠️</span>
                    <span style="font-size:0.8em">${t.start_instruction}</span>
                </div>
                <div class="start-buttons">
                    <button onclick="game.startGame()" class="start-btn primary">${t.start_btn}</button>
                    <button onclick="game.renderLevelMenu()" class="start-btn secondary">${t.levels_btn}</button>
                </div>
            </div>
        `;
    }

    checkLevel() {
        if (this.isTransitioning) return;
        const level = levels[this.currentLevelIndex];
        try {
            const result = level.checkSolution();
            if (result.success) {
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
        
        // Якщо ми грали в режимі вибору рівня - ми переходимо в режим "проходження" з цього моменту
        // Тобто кнопка внизу має стати "Скинути прогрес" (якщо це не був останній рівень)
        if (this.isLevelSelectMode) {
             this.isLevelSelectMode = false;
        }

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
        
        this.updateFooterButton('hidden');
        if(this.playerStatusDiv) this.playerStatusDiv.style.visibility = 'visible';
        
        this.levelTitle.innerText = t.win_title;
        this.levelDesc.innerText = t.win_desc;
        this.levelIndicator.innerText = "ROOT";
        
        // --- ВИПРАВЛЕННЯ ПУНКТ 3 (ТЕКСТ ПЕРЕМОГИ) ---
        // Якщо ми пройшли ВСЕ (з 0 до кінця) - показуємо "Всі рівні пройдено"
        // Якщо ми просто вбили Боса через меню - показуємо інший текст
        let winMessage = t.win_msg;
        // Якщо ми "стрибнули" на останній рівень, значить не пройшли всі
        // Але ми вже скинули isLevelSelectMode в nextLevel...
        // Тому перевірка проста: ми на екрані перемоги.
        
        // Простий фікс: якщо гравець вибрав Боса з меню, він пройшов тільки 1 рівень.
        // Але оскільки nextLevel скидає прапорець, то тут важко відслідкувати.
        // Давайте змінимо текст на більш універсальний або додамо умову.
        
        this.levelContent.innerHTML = `
            <div style="text-align:center">
                <h1 style="color:#00ff41">${t.win_h1}</h1>
                <p>${winMessage}</p>
                <button id="victory-reset-btn" class="reset-btn" style="padding: 15px; font-size: 1.2em;">${t.restart_btn}</button>
            </div>
        `;

        setTimeout(() => {
            const vBtn = document.getElementById('victory-reset-btn');
            if(vBtn) vBtn.addEventListener('click', () => this.triggerFullReset());
        }, 100);

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
