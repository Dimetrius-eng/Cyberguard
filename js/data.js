let currentLang = 'ua';

const translations = {
    ua: {
        access_level: "Рівень доступу:",
        console_header: "СИСТЕМНИЙ ЛОГ // ШІ ПОМІЧНИК",
        console_boot: "> Запуск системного протоколу...",
        console_level_load: "> Завантаження рівня...",
        console_success: "> Успіх! Доступ дозволено.",
        console_error: "> Помилка! Доступ заборонено.",
        console_win: "> КРИТИЧНИЙ УСПІХ. СИСТЕМУ ЗЛАМАНО.",

        start_title: "CYBERGUARD",
        start_subtitle: "LEGACY PROTOCOL",
        start_desc: "Симулятор етичного хакінгу. Ваша місія: пройти крізь захист застарілої корпоративної системи, використовуючи реальні вектори атак (OWASP Top 10).",
        start_btn: "ІНІЦІАЛІЗУВАТИ СИСТЕМУ",
        start_instruction: "УВАГА: Використовуйте знання лише для захисту.",

        // --- ВИПРАВЛЕНІ КЛЮЧІ ДЛЯ МЕНЮ ---
        levels_btn: "СПИСОК РІВНІВ",
        levels_title: "ВИБІР ПРОТОКОЛУ АТАКИ",
        back_btn: "НАЗАД",

        win_title: "МІСІЯ ВИКОНАНА",
        win_desc: "Систему зламано. Права Root отримано.",
        win_h1: "ПЕРЕМОГА",
        
        // --- ЛОГІКА ПОВІДОМЛЕНЬ ПЕРЕМОГИ ---
        win_msg_full: "Всі рівні пройдено безпечно.", // Для повного проходження
        win_msg_single: "Ціль нейтралізовано.",      // Для одного рівня (Боса)
        
        reset_btn: "СКИНУТИ ПРОГРЕС",
        restart_btn: "ПЕРЕЗАПУСТИТИ СИМУЛЯЦІЮ",
        menu_btn: "ГОЛОВНЕ МЕНЮ"
    },
    en: {
        access_level: "Access Level:",
        console_header: "SYSTEM LOG // AI ASSISTANT",
        console_boot: "> System boot sequence initiated...",
        console_level_load: "> Loading level data...",
        console_success: "> Success! Access granted.",
        console_error: "> Error! Access denied.",
        console_win: "> CRITICAL SUCCESS. SYSTEM PWNED.",

        start_title: "CYBERGUARD",
        start_subtitle: "LEGACY PROTOCOL",
        start_desc: "Ethical hacking simulator. Your mission: Breach the legacy corporate system using real-world attack vectors (OWASP Top 10).",
        start_btn: "INITIALIZE SYSTEM",
        start_instruction: "WARNING: Use knowledge for defense only.",

        // --- FIXED MENU KEYS ---
        levels_btn: "LEVEL SELECT",
        levels_title: "SELECT ATTACK PROTOCOL",
        back_btn: "BACK",

        win_title: "MISSION ACCOMPLISHED",
        win_desc: "System compromised. Root access obtained.",
        win_h1: "YOU WIN",
        
        // --- VICTORY MESSAGES ---
        win_msg_full: "All levels passed securely.",
        win_msg_single: "Target neutralized.",

        reset_btn: "RESET PROGRESS",
        restart_btn: "RESTART SIMULATION",
        menu_btn: "MAIN MENU"
    }
};

// ... ДАЛІ ВАШ МАСИВ levels (ВІН ПРАВИЛЬНИЙ, ЗАЛИШАЄМО ЯК Є) ...
// (Я його не дублюю, щоб не займати місце, він у тебе вже є з минулого разу)
// ПЕРЕКОНАЙСЯ, ЩО ТИ ЙОГО НЕ ВИДАЛИВ!
const levels = [
    // ... твої 13 рівнів ...
    // --- LEVEL 1: SQL Injection ---
    {
        id: 0,
        texts: {
            ua: { 
                title: "Рівень 1: Обхідний шлях (SQLi)", 
                description: "Корпоративний портал використовує застарілу перевірку. Увійдіть як адмін без пароля (використайте ' OR ...).", 
                btn: "УВІЙТИ",
                label: "Облікові дані:"
            },
            en: { 
                title: "Level 1: The Bypass Route (SQLi)", 
                description: "Login as admin without a password. Try to manipulate the SQL query (e.g. use ' OR ...).", 
                btn: "LOGIN",
                label: "Credentials:"
            }
        },
        html: `<div class="login-form"><p id="level-label">Credentials:</p><input type="text" id="username" placeholder="Username"><input type="password" id="password" placeholder="Password"><button onclick="game.checkLevel()" id="level-btn">LOGIN</button></div>`,
        checkSolution: function() {
            const u = document.getElementById('username').value.toUpperCase();
            const p = document.getElementById('password').value.toUpperCase();
            if (u.includes("' OR '1'='1") || u.includes("' OR 1=1")) return { success: true, message: "SQL Injection Success!" };
            if (u === "ADMIN" && p === "12345") return { success: true, message: "Pass guessed." };
            return { success: false, message: "Access Denied." };
        }
    },
    // --- LEVEL 2: XSS ---
    {
        id: 1,
        texts: {
            ua: { 
                title: "Рівень 2: Отруйний скрипт (XSS)", 
                description: "Чат не фільтрує повідомлення. Виконайте alert() через тег <script>.", 
                btn: "НАДІСЛАТИ" 
            },
            en: { 
                title: "Level 2: Poisoned Script (XSS)", 
                description: "Chat has no filter. Execute alert() using <script> tag.", 
                btn: "SEND" 
            }
        },
        html: `<div class="mission-board"><div id="chat-history" class="chat-box"><div class="msg system">System: Online</div></div><div class="input-area"><input type="text" id="xss-input" placeholder="Message..."><button onclick="game.checkLevel()" id="level-btn">SEND</button></div></div>`,
        checkSolution: function() {
            const input = document.getElementById('xss-input').value;
            const hist = document.getElementById('chat-history');
            hist.innerHTML += `<div class="msg user-player">Guest: ${input}</div>`; hist.scrollTop = hist.scrollHeight;
            if (input.includes("<script>") || input.includes("alert(")) return { success: true, message: "XSS Detected!" };
            return { success: false, message: "Message sent." };
        }
    },
    // --- LEVEL 3: IDOR ---
    {
        id: 2,
        texts: {
            ua: { 
                title: "Рівень 3: Чужий профіль (IDOR)", 
                description: "Ви бачите профіль ID: 3050. Знайдіть профіль Адміністратора (ID: 1).", 
                btn: "ЗАВАНТАЖИТИ" 
            },
            en: { 
                title: "Level 3: The Other Profile (IDOR)", 
                description: "You are user 3050. Find the Administrator profile (ID: 1).", 
                btn: "LOAD" 
            }
        },
        html: `<div class="db-viewer"><div class="url-bar"><span>GET /api/users?id=</span><input type="number" id="user-id-input" value="3050"><button onclick="game.checkLevel()" id="level-btn">LOAD</button></div><div id="profile-card"></div></div>`,
        checkSolution: function() {
            const id = document.getElementById('user-id-input').value;
            const card = document.getElementById('profile-card');
            if (id === "1") { card.innerHTML = "<h3 style='color:red'>ROOT (ADMIN)</h3>"; return { success: true, message: "IDOR Found!" }; }
            card.innerHTML = `<p>User ${id}: Guest</p>`; return { success: false, message: "Normal user loaded." };
        }
    },
    // --- LEVEL 4: HIDDEN INPUT ---
    {
        id: 3,
        texts: {
            ua: { 
                title: "Рівень 4: Сховане на видноті", 
                description: "Ключ сховано у коді (Inspector F12 -> Hidden Input). Введіть його.", 
                btn: "РОЗБЛОКУВАТИ" 
            },
            en: { 
                title: "Level 4: Hidden in Plain Sight", 
                description: "Key is hidden in source code (Inspector F12 -> Hidden Input). Enter it.", 
                btn: "UNLOCK" 
            }
        },
        html: `<div class="server-lock"><input type="hidden" id="dev-debug-key" value="DELTA_FORCE_99"><div class="lock-screen"><span style="font-size: 50px;">🔒</span><input type="password" id="final-pass" placeholder="Master Key"><button onclick="game.checkLevel()" id="level-btn">UNLOCK</button></div></div>`,
        checkSolution: function() {
            const inp = document.getElementById('final-pass').value;
            const secret = document.getElementById('dev-debug-key').value;
            if (inp === secret) return { success: true, message: "Access Granted." };
            return { success: false, message: "Access Denied." };
        }
    },
    // --- LEVEL 5: CSRF ---
    {
        id: 4,
        texts: {
            ua: { 
                title: "Рівень 5: Підроблений підпис (CSRF)", 
                description: "Сервер перевіряє токен. Зроби запит без нього (DevTools допоможуть).", 
                btn: "ВИКОНАТИ ЗАПИТ" 
            },
            en: { 
                title: "Level 5: Forged Signature (CSRF)", 
                description: "Token is required. Remove or bypass it using DevTools.", 
                btn: "EXECUTE REQUEST" 
            }
        },
        html: `<div class="db-viewer"><p>Transfer money: <b>1000₿</b> to user #1337</p><form id="csrf-form" onsubmit="return false;"><input type="hidden" name="csrf_token" id="csrf" value="9XAZ-SECURE-KEY-7788"><button type="button" onclick="game.checkLevel()" id="level-btn">EXECUTE</button></form></div>`,
        checkSolution: function () {
            const token = document.getElementById("csrf");
            if (!token) return { success: true, message: "Token removed!" };
            if (token && token.value === "") return { success: true, message: "Token emptied!" };
            if (token && token.type !== "hidden") return { success: true, message: "Hidden flag bypassed!" };
            return { success: false, message: "CSRF token still valid." };
        }
    },
    // --- LEVEL 6: SSRF ---
    {
        id: 5,
        texts: {
            ua: { 
                title: "Рівень 6: Внутрішній шпигун (SSRF)", 
                description: "Запит піде на будь-яку адресу. Доступ можливий лише до localhost.", 
                btn: "ЗАПИТ" 
            },
            en: { 
                title: "Level 6: Internal Spy (SSRF)", 
                description: "Server fetches any URL. Reach internal host (localhost).", 
                btn: "FETCH" 
            }
        },
        html: `<div class="db-viewer"><input type="text" id="url-input"><button onclick="game.checkLevel()" id="level-btn">FETCH</button></div>`,
        checkSolution: function() {
            const url = document.getElementById('url-input').value;
            if (url.includes("127.0.0.1") || url.includes("localhost")) return { success: true, message: "SSRF to internal host!" };
            return { success: false, message: "External request blocked." };
        }
    },
    // --- LEVEL 7: BROKEN AUTH ---
    {
        id: 6,
        texts: {
            ua: { 
                title: "Рівень 7: Викрадення особистості", 
                description: "Сервер довіряє cookie без перевірки. Стань ADMIN.", 
                btn: "ПЕРЕВІРИТИ" 
            },
            en: { 
                title: "Level 7: Identity Theft", 
                description: "Session cookie is not validated. Become ADMIN.", 
                btn: "CHECK" 
            }
        },
        html: `<div class="db-viewer"><input type="text" id="cookie" placeholder=""><button type="button" onclick="game.checkLevel()" id="level-btn">CHECK</button><p style="font-size:12px;color:#555;">Hint: session=GUEST</p></div>`,
        checkSolution: function() {
            const cookie = document.getElementById('cookie').value.toUpperCase();
            if (cookie.includes("ADMIN")) return { success: true, message: "Session hijacked!" };
            return { success: false, message: "Session invalid." };
        }
    },
    // --- LEVEL 8: COMMAND INJECTION ---
    {
        id: 7,
        texts: {
            ua: { 
                title: "Рівень 8: Системний наказ", 
                description: "Ping приймає сторонні команди. Спробуй виконати щось зайве.", 
                btn: "ВИКОНАТИ" 
            },
            en: { 
                title: "Level 8: System Command", 
                description: "Ping accepts shell metacharacters. Inject a command.", 
                btn: "EXECUTE" 
            }
        },
        html: `<div class="db-viewer"><input type="text" id="cmd" placeholder="127.0.0.1"><button type="button" onclick="game.checkLevel()" id="level-btn">EXECUTE</button><p style="font-size:12px;color:#555;">Hint: ; або &&</p></div>`,
        checkSolution: function() {
            const cmd = document.getElementById('cmd').value;
            if (cmd.includes(";") || cmd.includes("&&") || cmd.includes("|")) return { success: true, message: "Command injected!" };
            return { success: false, message: "Ping executed only." };
        }
    },
    // --- LEVEL 9: PATH TRAVERSAL ---
    {
        id: 8,
        texts: {
            ua: { 
                title: "Рівень 9: Втеча з папки", 
                description: "Дозволені лише 'public/'. Дістань 'flag.txt'.", 
                btn: "ЗАВАНТАЖИТИ" 
            },
            en: { 
                title: "Level 9: Directory Escape", 
                description: "Only 'public/' is allowed. Retrieve 'flag.txt'.", 
                btn: "LOAD" 
            }
        },
        html: `<div class="db-viewer"><input type="text" id="path9" placeholder="public/readme.txt"><button type="button" onclick="game.checkLevel()" id="level-btn">LOAD</button><div id="file9" style="margin-top:10px;"></div></div>`,
        checkSolution() {
            const p = document.getElementById('path9').value;
            const out = document.getElementById('file9');
            if (p.includes("../") && p.toLowerCase().includes("flag.txt")) {
                out.innerHTML = "<b>FLAG{PATH_TRAVERSAL_OK}</b>";
                return { success: true, message: "Traversal success!" };
            }
            out.textContent = "Access limited to public/.";
            return { success: false, message: "Nope." };
        }
    },
    // --- LEVEL 10: JWT CONFUSION ---
    {
        id: 9,
        texts: {
            ua: { 
                title: "Рівень 10: Фальшивий пропуск (JWT)", 
                description: "Зміни заголовок токена так, щоб сервер прийняв ADMIN.", 
                btn: "ПЕРЕВІРИТИ" 
            },
            en: { 
                title: "Level 10: Fake ID (JWT)", 
                description: "Modify header so system accepts ADMIN.", 
                btn: "VERIFY" 
            }
        },
        html: `<div class="db-viewer"><input type="text" id="jwt" placeholder='{"alg":"RS256","role":"USER"}'><button type="button" onclick="game.checkLevel()" id="level-btn">VERIFY</button><p style="font-size:12px;color:#555;">Hint: подумай про alg</p></div>`,
        checkSolution() {
            try {
                const obj = JSON.parse(document.getElementById('jwt').value);
                if (obj.alg === "none" && obj.role === "ADMIN") return { success: true, message: "JWT accepted!" };
            } catch {}
            return { success: false, message: "Token rejected." };
        }
    },
    // --- LEVEL 11: RACE CONDITION ---
    {
        id: 10,
        texts: {
            ua: { 
                title: "Рівень 11: Перегони з часом", 
                description: "Зніми кошти двічі до блокування.", 
                btn: "ЗНЯТИ" 
            },
            en: { 
                title: "Level 11: Race Against Time", 
                description: "Withdraw twice before lock.", 
                btn: "WITHDRAW" 
            }
        },
        html: `<div class="db-viewer"><p>Balance: <span id="bal">100</span>₿</p><button type="button" id="raceBtn" onclick="game.checkLevel()">WITHDRAW</button></div>`,
        _last: 0,
        checkSolution() {
            const now = performance.now();
            const diff = now - (this._last || 0);
            this._last = now;
            const bal = document.getElementById('bal');
            bal.textContent = Math.max(0, +bal.textContent - 60);
            if (diff && diff < 200) return { success: true, message: "Race won!" };
            return { success: false, message: "Too slow." };
        }
    },
    // --- LEVEL 12: INSECURE DESERIALIZATION ---
    {
        id: 11,
        texts: {
            ua: { 
                title: "Рівень 12: Небезпечний вантаж", 
                description: "Обʼєкт довіряється сліпо. Отримай ADMIN.", 
                btn: "ІМПОРТ" 
            },
            en: { 
                title: "Level 12: Dangerous Payload", 
                description: "Object is blindly trusted. Become ADMIN.", 
                btn: "IMPORT" 
            }
        },
        html: `<div class="db-viewer"><textarea id="obj" rows="4" style="width:100%" placeholder='{"user":"guest","role":"USER"}'></textarea><button type="button" onclick="game.checkLevel()" id="level-btn">IMPORT</button></div>`,
        checkSolution() {
            try {
                const o = JSON.parse(document.getElementById('obj').value);
                if (o.role === "ADMIN") return { success: true, message: "Deserialization abused!" };
            } catch {}
            return { success: false, message: "Import failed." };
        }
    },
    // --- FINAL BOSS: THE CORE ---
    {
        id: 12,
        texts: {
            ua: { 
                title: "БОС: Цитадель (The Core)", 
                description: "Обійди захист: ШЛЯХ + ТОКЕН + СЕСІЯ одночасно.", 
                btn: "АТАКА" 
            },
            en: { 
                title: "BOSS: The Citadel", 
                description: "Bypass PATH + TOKEN + SESSION at once.", 
                btn: "ATTACK" 
            }
        },
        html: `<div class="db-viewer"><input type="text" id="bpath" placeholder="path=/public"><input type="text" id="bjwt"  placeholder='token={"alg":"RS256","role":"USER"}'><input type="text" id="bcook" placeholder="session=USER"><button type="button" onclick="game.checkLevel()" id="level-btn">ATTACK</button><pre id="bosslog"></pre></div>`,
        checkSolution() {
            const p = document.getElementById('bpath').value;
            const t = document.getElementById('bjwt').value;
            const c = document.getElementById('bcook').value.toUpperCase();
            const log = document.getElementById('bosslog');
            let ok = 0;
            if (p.includes("../")) ok++;
            try { const o = JSON.parse(t.replace(/^token=/,'')); if (o.alg==="none" && o.role==="ADMIN") ok++; } catch {}
            if (c.includes("ADMIN")) ok++;
            log.textContent = `Checks passed: ${ok}/3`;
            if (ok === 3) return { success: true, message: "CORE BREACHED!" };
            return { success: false, message: "Core still standing." };
        }
    }
];
