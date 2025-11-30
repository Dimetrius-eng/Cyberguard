let currentLang = 'ua';

const translations = {
    ua: {
        access_level: "Рівень доступу:",
        console_header: "СИСТЕМНИЙ ЛОГ // ШІ ПОМІЧНИК",
        
        // --- ТЕКСТИ ДЛЯ КОНСОЛІ (НОВІ) ---
        console_boot: "> Запуск системного протоколу...",
        console_level_load: "> Завантаження рівня...",
        console_success: "> Успіх! Доступ дозволено.",
        console_error: "> Помилка! Доступ заборонено.",
        console_win: "> КРИТИЧНИЙ УСПІХ. СИСТЕМУ ЗЛАМАНО.",
        // ---------------------------------

        win_title: "МІСІЯ ВИКОНАНА",
        win_desc: "Систему зламано. Права Root отримано.",
        win_h1: "ПЕРЕМОГА",
        win_msg: "Всі рівні пройдено безпечно.",
        restart_btn: "ПЕРЕЗАПУСТИТИ СИМУЛЯЦІЮ"
    },
    en: {
        access_level: "Access Level:",
        console_header: "SYSTEM LOG // AI ASSISTANT",
        
        // --- CONSOLE TEXTS (NEW) ---
        console_boot: "> System boot sequence initiated...",
        console_level_load: "> Loading level data...",
        console_success: "> Success! Access granted.",
        console_error: "> Error! Access denied.",
        console_win: "> CRITICAL SUCCESS. SYSTEM PWNED.",
        // ---------------------------

        win_title: "MISSION ACCOMPLISHED",
        win_desc: "System compromised. Root access obtained.",
        win_h1: "YOU WIN",
        win_msg: "All levels passed securely.",
        restart_btn: "RESTART SIMULATION"
    }
};

// Дані рівнів
const levels = [
    // --- LEVEL 1: SQL Injection ---
    {
        id: 0,
        texts: {
            ua: { 
                title: "Рівень 1: Сторож (SQL Injection)", 
                description: "Корпоративний портал використовує застарілу перевірку. Увійдіть як адмін без пароля (використайте ' OR ...).", 
                btn: "УВІЙТИ" 
            },
            en: { 
                title: "Level 1: The Gatekeeper (SQL Injection)", 
                description: "Login as admin without a password. Try to manipulate the SQL query (e.g. use ' OR ...).", 
                btn: "LOGIN" 
            }
        },
        html: `
            <div class="login-form">
                <p>Credentials:</p>
                <input type="text" id="username" placeholder="Username">
                <input type="password" id="password" placeholder="Password">
                <button onclick="game.checkLevel()" id="level-btn">LOGIN</button>
            </div>
        `,
        checkSolution: function() {
            const u = document.getElementById('username').value.toUpperCase();
            const p = document.getElementById('password').value.toUpperCase();
            // Перевірка на типові пейлоади SQLi
            if (u.includes("' OR '1'='1") || u.includes("' OR 1=1")) {
                return { success: true, message: "SQL Injection Success!" };
            }
            // Або якщо вгадали "хардкод" пароль (для тесту)
            if (u === "ADMIN" && p === "12345") {
                return { success: true, message: "Pass guessed." };
            }
            return { success: false, message: "Access Denied." };
        }
    },

    // --- LEVEL 2: XSS ---
    {
        id: 1,
        texts: {
            ua: { 
                title: "Рівень 2: Токсичні коментарі (XSS)", 
                description: "Чат не фільтрує повідомлення. Виконайте alert() через тег <script>.", 
                btn: "НАДІСЛАТИ" 
            },
            en: { 
                title: "Level 2: Toxic Comments (XSS)", 
                description: "Chat has no filter. Execute alert() using <script> tag.", 
                btn: "SEND" 
            }
        },
        html: `
            <div class="mission-board">
                <div id="chat-history" class="chat-box">
                    <div class="msg system">System: Online</div>
                </div>
                <div class="input-area">
                    <input type="text" id="xss-input" placeholder="Message...">
                    <button onclick="game.checkLevel()" id="level-btn">SEND</button>
                </div>
            </div>
        `,
        checkSolution: function() {
            const input = document.getElementById('xss-input').value;
            const hist = document.getElementById('chat-history');
            
            // Додаємо повідомлення в чат (симуляція відображення)
            hist.innerHTML += `<div class="msg user-player">Guest: ${input}</div>`; 
            hist.scrollTop = hist.scrollHeight;
            
            // Перевірка на наявність скрипта
            if (input.includes("<script>") || input.includes("alert(")) {
                return { success: true, message: "XSS Detected!" };
            }
            return { success: false, message: "Message sent." };
        }
    },

    // --- LEVEL 3: IDOR ---
    {
        id: 2,
        texts: {
            ua: { 
                title: "Рівень 3: Привид (IDOR)", 
                description: "Ви бачите профіль ID: 3050. Знайдіть профіль Адміністратора (ID: 1).", 
                btn: "ЗАВАНТАЖИТИ" 
            },
            en: { 
                title: "Level 3: The Ghost User (IDOR)", 
                description: "You are user 3050. Find the Administrator profile (ID: 1).", 
                btn: "LOAD" 
            }
        },
        html: `
            <div class="db-viewer">
                <div class="url-bar">
                    <span>GET /api/users?id=</span>
                    <input type="number" id="user-id-input" value="3050">
                    <button onclick="game.checkLevel()" id="level-btn">LOAD</button>
                </div>
                <div id="profile-card"></div>
            </div>
        `,
        checkSolution: function() {
            const id = document.getElementById('user-id-input').value;
            const card = document.getElementById('profile-card');
            
            if (id === "1") { 
                card.innerHTML = "<h3 style='color:red'>ROOT (ADMIN)</h3>"; 
                return { success: true, message: "IDOR Found!" }; 
            }
            
            card.innerHTML = `<p>User ${id}: Guest</p>`; 
            return { success: false, message: "Normal user loaded." };
        }
    },

    // --- LEVEL 4: HIDDEN INPUT ---
    {
        id: 3,
        texts: {
            ua: { 
                title: "Рівень 4: Забутий ключ", 
                description: "Ключ сховано у коді (Inspector F12 -> Hidden Input). Введіть його.", 
                btn: "РОЗБЛОКУВАТИ" 
            },
            en: { 
                title: "Level 4: Forgotten Key", 
                description: "Key is hidden in source code (Inspector F12 -> Hidden Input). Enter it.", 
                btn: "UNLOCK" 
            }
        },
        html: `
            <div class="server-lock">
                <input type="hidden" id="dev-debug-key" value="DELTA_FORCE_99">
                <div class="lock-screen">
                    <span style="font-size: 50px;">🔒</span>
                    <input type="password" id="final-pass" placeholder="Master Key">
                    <button onclick="game.checkLevel()" id="level-btn">UNLOCK</button>
                </div>
            </div>
        `,
        checkSolution: function() {
            const inp = document.getElementById('final-pass').value;
            const secret = document.getElementById('dev-debug-key').value;
            
            if (inp === secret) {
                return { success: true, message: "Access Granted." };
            }
            return { success: false, message: "Access Denied." };
        }
    }
];