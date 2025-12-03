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

    const prefix = translations[lang].ai_prefix;
    document.querySelectorAll('.log-hint').forEach(logEntry => {
        const levelId = logEntry.getAttribute('data-level-id');
        const stage = logEntry.getAttribute('data-stage');
        const variant = logEntry.getAttribute('data-variant');

        if (levelId !== null && stage !== null && variant !== null) {
            const hintsArray = levels[levelId].hints[lang][stage];
            let newText = "";
            if (Array.isArray(hintsArray)) {
                newText = hintsArray[variant]; 
            } else {
                newText = hintsArray;
            }
            logEntry.innerText = prefix + newText;
        }
    });

    if(window.game) {
        if (document.querySelector('.level-menu-screen')) {
            window.game.renderLevelMenu(false);
        } 
        else if (window.game.gameStarted) {
            window.game.renderLevel();
        }
        else {
            // Якщо ми на старті і змінили мову - перезапускаємо анімацію
            window.game.renderStartScreen();
        }
    }
}

class GameEngine {
    constructor() {
        this.currentLevelIndex = 0;
        this.gameStarted = false;
        this.startedFromBeginning = false;
        this.isLevelSelectMode = false;
        this.levelErrorCount = 0;

        this.consoleOutput = document.getElementById('console-output');
        this.levelTitle = document.getElementById('level-title');
        this.levelDesc = document.getElementById('level-description');
        this.levelContent = document.getElementById('level-content');
        this.levelIndicator = document.getElementById('level-indicator');
        this.globalResetBtn = document.getElementById('global-reset-btn');
        this.playerStatusDiv = document.getElementById('player-status');
        
        this.isTransitioning = false;
        this.isAiThinking = false;
        this.typingTimeouts = []; // Масив для зберігання таймерів друку
        
        document.addEventListener('click', (e) => {
            if (this.isAiThinking) return;

            if (e.target.tagName === 'BUTTON' && 
                e.target.id !== 'global-reset-btn' && 
                !e.target.classList.contains('start-btn') &&
                !e.target.closest('.level-btn-item')) { 
                
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
        this.startedFromBeginning = false;
        this.isLevelSelectMode = false;
        this.renderStartScreen();
        window.scrollTo(0,0);
    }

    clearLog() {
        if (this.consoleOutput) {
            this.consoleOutput.innerHTML = '';
        }
    }

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
            this.globalResetBtn.style.display = 'block';
            this.globalResetBtn.innerText = t.menu_btn;
            this.globalResetBtn.className = "reset-btn";
            
            this.globalResetBtn.addEventListener('click', (e) => {
                e.preventDefault(); 
                this.goToMainMenu();
            });
        } 
        else if (mode === 'reset') {
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
            this.startedFromBeginning = true;
            this.isLevelSelectMode = false;
        } else {
            this.gameStarted = false;
        }
        
        changeLanguage(currentLang);
        
        if (this.gameStarted) {
            this.clearLog();
            this.log(translations[currentLang].console_boot, 'info', 'console_boot');
        }
        
        this.renderLevel();
    }

    renderLevelMenu(playAudio = true) {
        this.stopTyping(); // Зупиняємо друк, якщо він йшов
        if (playAudio) playSound('click');
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
        this.isLevelSelectMode = true; 
        this.levelErrorCount = 0;
        
        if (index === 0) {
            this.startedFromBeginning = true;
            this.isLevelSelectMode = false;
        } else {
            this.startedFromBeginning = false;
        }

        this.clearLog();
        this.log(translations[currentLang].console_boot, 'info', 'console_boot');

        document.body.classList.remove('on-start'); 
        this.renderLevel();
    }

    startGame() {
        this.stopTyping();
        playSound('click');
        this.gameStarted = true;
        this.startedFromBeginning = true;
        this.isLevelSelectMode = false;
        this.currentLevelIndex = 0;
        this.levelErrorCount = 0;
        
        this.clearLog();
        this.log(translations[currentLang].console_boot, 'info', 'console_boot');
        
        this.renderLevel();
    }

    renderLevel() {
        this.isTransitioning = false;
        this.isAiThinking = false;

        if (!this.gameStarted) {
            this.renderStartScreen();
            return;
        }

        document.body.classList.remove('on-start'); 

        if (this.currentLevelIndex >= levels.length) { 
            this.showVictory(); 
            return; 
        }

        if (this.isLevelSelectMode || this.currentLevelIndex === 0) {
            this.updateFooterButton('menu');
        } else {
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

    // --- НОВА ЛОГІКА ДРУКУ ТЕКСТУ ---
    
    // Функція для зупинки попереднього друку (якщо перемкнули мову)
    stopTyping() {
        this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
        this.typingTimeouts = [];
    }

    // Універсальний друкар
    typeWriter(elementId, text, speed, callback) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.innerHTML = ""; // Очищаємо
        element.classList.add('typing-cursor'); // Додаємо курсор
        
        let i = 0;
        const type = () => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                // Зберігаємо таймер, щоб можна було скасувати
                this.typingTimeouts.push(setTimeout(type, speed));
            } else {
                element.classList.remove('typing-cursor'); // Прибираємо курсор в кінці
                if (callback) callback();
            }
        };
        type();
    }

    renderStartScreen() {
        document.body.classList.add('on-start'); 
        this.stopTyping(); // Зупиняємо старі анімації, якщо були

        const t = translations[currentLang];
        
        this.updateFooterButton('hidden');
        if(this.playerStatusDiv) this.playerStatusDiv.style.visibility = 'hidden';

        this.levelTitle.innerText = "";
        this.levelDesc.innerText = "";

        // Створюємо HTML з ПУСТИМИ заголовками, щоб потім їх заповнити
        this.levelContent.innerHTML = `
            <div class="start-screen">
                <h1 id="intro-title" class="glitch" data-text="${t.start_title}"></h1> 
                <h3 id="intro-sub" style="color:white; letter-spacing:3px; margin-bottom:20px; min-height: 1.2em;"></h3>
                
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

        // --- ЗАПУСК АНІМАЦІЇ ---
        // 1. Друкуємо головний заголовок (швидкість 50мс)
        this.typeWriter('intro-title', t.start_title, 50, () => {
            // 2. Коли закінчили - друкуємо підзаголовок (швидкість 30мс)
            this.typeWriter('intro-sub', t.start_subtitle, 30, () => {
                // 3. Коли закінчили - блимаємо підзаголовком
                const sub = document.getElementById('intro-sub');
                if(sub) sub.classList.add('blink-once');
            });
        });
    }

    checkLevel() {
        if (this.isTransitioning || this.isAiThinking) return;
        
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

                this.triggerAiHint();
            }
        } catch (e) { console.error(e); }
    }

    triggerAiHint() {
        this.levelErrorCount++;
        this.isAiThinking = true;

        const btn = document.getElementById('level-btn');
        if(btn) {
            btn.disabled = true;
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
        }

        this.log(translations[currentLang].console_ai_thinking, 'ai-thinking', 'console_ai_thinking');

        setTimeout(() => {
            if (this.consoleOutput.lastChild) {
                this.consoleOutput.removeChild(this.consoleOutput.lastChild);
            }

            const level = levels[this.currentLevelIndex];
            const hintsArray = level.hints[currentLang];
            
            let hintText = "";
            let stageIndex = 0;

            if (this.levelErrorCount === 1) stageIndex = 0;
            else if (this.levelErrorCount === 2) stageIndex = 1;
            else stageIndex = 2;

            if (stageIndex >= hintsArray.length) stageIndex = hintsArray.length - 1;

            const stageHints = hintsArray[stageIndex];
            
            let variantIndex = 0; 
            if (Array.isArray(stageHints)) {
                variantIndex = Math.floor(Math.random() * stageHints.length);
                hintText = stageHints[variantIndex];
            } else {
                hintText = stageHints; 
            }

            const prefix = translations[currentLang].ai_prefix;
            this.log(`${prefix}${hintText}`, 'hint', null, { 
                levelId: this.currentLevelIndex, 
                stage: stageIndex, 
                variant: variantIndex 
            }); 

            this.isAiThinking = false;
            if(btn) {
                btn.disabled = false;
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
            }

        }, 1500);
    }

    nextLevel() {
        this.currentLevelIndex++;
        this.levelErrorCount = 0;
        
        if (this.isLevelSelectMode) {
             this.isLevelSelectMode = false;
        }

        localStorage.setItem('cyberguard_level', this.currentLevelIndex);
        
        this.clearLog();
        this.log(translations[currentLang].console_level_load, 'info', 'console_level_load');
        
        this.renderLevel();
    }

    log(msg, type = 'info', translationKey = null, hintData = null) {
        if (!this.consoleOutput) return;
        const p = document.createElement('p');
        p.innerText = `> ${msg}`;
        
        let className = 'log-entry';
        if (type === 'success') className += ' log-success';
        if (type === 'error') className += ' log-error';
        if (type === 'ai-thinking') className += ' log-thinking blink';
        if (type === 'hint') className += ' log-hint';

        p.className = className;
        
        if (translationKey) p.setAttribute('data-lang', translationKey);
        
        if (hintData) {
            p.setAttribute('data-level-id', hintData.levelId);
            p.setAttribute('data-stage', hintData.stage);
            p.setAttribute('data-variant', hintData.variant);
        }

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
        
        let message = this.startedFromBeginning ? t.win_msg_full : t.win_msg_single;

        this.levelContent.innerHTML = `
            <div style="text-align:center">
                <h1 style="color:#00ff41">${t.win_h1}</h1>
                <p>${message}</p>
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
