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
        console_ai_thinking: "> АНАЛІЗ ВЕКТОРА АТАКИ...",
        
        // --- НОВЕ: ПОВІДОМЛЕННЯ В ГОЛОВНОМУ МЕНЮ ---
        console_menu_welcome: "> ШІ на зв'язку. Тут будуть з'являтися підказки та статус систем.",
        
        ai_prefix: "ШІ: ", 

        start_title: "CYBERGUARD",
        start_subtitle: "LEGACY PROTOCOL",
        start_desc: "Симулятор етичного хакінгу. Ваша місія: пройти крізь захист застарілої корпоративної системи, використовуючи реальні вектори атак (OWASP Top 10).",
        start_btn: "ІНІЦІАЛІЗУВАТИ СИСТЕМУ",
        start_instruction: "УВАГА: Використовуйте знання лише для захисту.",

        levels_btn: "СПИСОК РІВНІВ",
        levels_title: "ВИБІР ПРОТОКОЛУ АТАКИ",
        back_btn: "НАЗАД",

        win_title: "МІСІЯ ВИКОНАНА",
        win_desc: "Систему зламано. Права Root отримано.",
        win_h1: "ПЕРЕМОГА",
        win_msg_full: "Всі рівні пройдено безпечно.",
        win_msg_single: "Ціль нейтралізовано.",
        
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
        console_ai_thinking: "> ANALYZING ATTACK VECTOR...",
        
        // --- NEW ---
        console_menu_welcome: "> AI Online. Hints and system status will appear here.",
        
        ai_prefix: "AI: ",

        start_title: "CYBERGUARD",
        start_subtitle: "LEGACY PROTOCOL",
        start_desc: "Ethical hacking simulator. Your mission: Breach the legacy corporate system using real-world attack vectors (OWASP&nbsp;Top&nbsp;10).",
        start_btn: "INITIALIZE SYSTEM",
        start_instruction: "WARNING: Use knowledge for defense only.",

        levels_btn: "LEVEL SELECT",
        levels_title: "SELECT ATTACK PROTOCOL",
        back_btn: "BACK",

        win_title: "MISSION ACCOMPLISHED",
        win_desc: "System compromised. Root access obtained.",
        win_h1: "YOU WIN",
        win_msg_full: "All levels passed securely.",
        win_msg_single: "Target neutralized.",

        reset_btn: "RESET PROGRESS",
        restart_btn: "RESTART SIMULATION",
        menu_btn: "MAIN MENU"
    }
};

// ... ДАЛІ ВАШ МАСИВ levels (ЗАЛИШАЄТЬСЯ БЕЗ ЗМІН) ...
const levels = [ 
    // ... всі 13 рівнів ...
    // (Копіювати їх сюди не буду, вони у вас вже є правильні)
    // Просто переконайтеся, що ви їх не стерли :)
    // --- LEVEL 1: SQL Injection ---
    {
        id: 0,
        texts: {
            ua: { title: "Рівень 1: Обхідний шлях (SQLi)", description: "Корпоративний портал використовує застарілу перевірку. Увійдіть як адмін без пароля (використайте ' OR ...).", btn: "УВІЙТИ", label: "Облікові дані:" },
            en: { title: "Level 1: The Bypass Route (SQLi)", description: "Login as admin without a password. Try to manipulate the SQL query (e.g. use ' OR ...).", btn: "LOGIN", label: "Credentials:" }
        },
        hints: {
            ua: [
                ["Синтаксис SQL дозволяє змінювати логіку запиту.", "Лапки в імені користувача можуть закрити рядок коду."],
                ["Спробуйте додати умову, яка завжди правдива (TRUE).", "Використайте конструкцію OR (АБО)."],
                ["Введіть: admin' OR '1'='1"]
            ],
            en: [
                ["SQL syntax allows modifying query logic.", "Quotes in the username might close the string."],
                ["Try adding a condition that is always TRUE.", "Use the OR operator."],
                ["Type: admin' OR '1'='1"]
            ]
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
            ua: { title: "Рівень 2: Отруйний скрипт (XSS)", description: "Чат не фільтрує повідомлення. Виконайте alert() через тег <script>.", btn: "НАДІСЛАТИ" },
            en: { title: "Level 2: Poisoned Script (XSS)", description: "Chat has no filter. Execute alert() using <script> tag.", btn: "SEND" }
        },
        hints: {
            ua: [
                ["Браузер виконує будь-який HTML код, який ви вводите.", "Спробуйте вставити активний елемент."],
                ["Для виконання коду потрібен тег <script>.", "Функція alert() викликає вікно."],
                ["Введіть: <script>alert(1)</script>"]
            ],
            en: [
                ["Browser executes any HTML code you input.", "Try inserting an active element."],
                ["To execute code, use the <script> tag.", "The alert() function creates a popup."],
                ["Type: <script>alert(1)</script>"]
            ]
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
            ua: { title: "Рівень 3: Чужий профіль (IDOR)", description: "Ви бачите профіль ID: 3050. Знайдіть профіль Адміністратора (ID: 1).", btn: "ЗАВАНТАЖИТИ" },
            en: { title: "Level 3: The Other Profile (IDOR)", description: "You are user 3050. Find the Administrator profile (ID: 1).", btn: "LOAD" }
        },
        hints: {
            ua: [
                ["Подивіться на поле вводу ID. Чи контролює сервер ваш доступ?", "ID користувачів зазвичай йдуть по порядку."],
                ["Адміністратор зазвичай є першим користувачем в базі.", "Змініть свій ID на найменший можливий."],
                ["Введіть ID: 1"]
            ],
            en: [
                ["Check the ID input. Does the server verify your access?", "User IDs usually follow a sequence."],
                ["The Administrator is usually the first user in the database.", "Change your ID to the lowest possible one."],
                ["Enter ID: 1"]
            ]
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
                description: "Ключ сховано у коді сторінки. Натисніть [F12], щоб переглянути вихідний код і знайти його.", 
                btn: "РОЗБЛОКУВАТИ" 
            },
            en: { 
                title: "Level 4: Hidden in Plain Sight", 
                description: "Key is hidden in source code. Press [F12] to view source and find it.", 
                btn: "UNLOCK" 
            }
        },
        hints: {
            ua: [
                ["На мобільних пристроях немає справжньої консолі, тому натисніть кнопку [F12] SOURCE на екрані.", "Це відкриє шматок HTML-коду."],
                ["У коді, що відкрився, шукайте тег <input type='hidden'>.", "Зверніть увагу на атрибут value."],
                ["Ключ: DELTA_FORCE_99"]
            ],
            en: [
                ["Mobile devices lack a real console, so press the [F12] SOURCE button on screen.", "This will reveal a snippet of HTML code."],
                ["In the revealed code, look for the <input type='hidden'> tag.", "Check the value attribute."],
                ["Key: DELTA_FORCE_99"]
            ]
        },
        html: `
            <div class="server-lock">
                <input type="hidden" id="dev-debug-key" value="DELTA_FORCE_99">
                
                <div style="text-align:right; margin-bottom:10px;">
                    <button type="button" 
                        onclick="document.getElementById('fake-source').style.display='block'; this.style.display='none'" 
                        style="background:#333; border:1px dashed #777; font-size:0.8em; padding:5px; width:auto; cursor:pointer; color:#00ff41;">
                        🔍 [F12] SOURCE
                    </button>
                </div>

                <div id="fake-source" style="display:none; text-align:left; background:#000; border:1px solid #00ff41; padding:10px; margin-bottom:15px; font-family:monospace; font-size:0.8em; color:#ccc;">
                    &lt;!-- DEBUG INFO --&gt;<br>
                    &lt;div class="lock"&gt;<br>
                    &nbsp;&nbsp;&lt;input type="hidden"<br>
                    &nbsp;&nbsp;id="dev-debug-key"<br>
                    &nbsp;&nbsp;value="<span style="color:#00ff41; font-weight:bold;">DELTA_FORCE_99</span>"&gt;<br>
                    &lt;/div&gt;
                </div>

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
            
            // Додаємо варіант, якщо користувач введе ключ з лапками (бо може скопіювати зайве)
            if (inp === secret || inp === `"${secret}"`) {
                return { success: true, message: "Access Granted." };
            }
            return { success: false, message: "Access Denied." };
        }
    },
 // --- LEVEL 5: CSRF Attack ---
    {
        id: 4,
        texts: {
            ua: { 
                title: "Рівень 5: Фантомний запит (CSRF)", 
                description: "Сервер перевіряє токен. Змініть або видаліть його. (Натисніть [F12] для симуляції злому).", 
                btn: "ВИКОНАТИ ЗАПИТ" 
            },
            en: { 
                title: "Level 5: Phantom Request (CSRF)", 
                description: "Token is required. Change or remove it. (Press [F12] to simulate hack).", 
                btn: "EXECUTE REQUEST" 
            }
        },
        // --- ОСЬ ЦЕЙ БЛОК БУВ ПРОПУЩЕНИЙ ---
        hints: {
            ua: [
                ["Спочатку натисніть кнопку [F12] INSPECT, щоб побачити приховане поле.", "Токен безпеки (CSRF) знаходиться у полі input."],
                ["Спробуйте обдурити сервер, видаливши цей токен.", "Зробіть поле токена пустим."],
                ["Зітріть все з поля токена і натисніть EXECUTE."]
            ],
            en: [
                ["First press [F12] INSPECT to reveal the hidden field.", "The security token (CSRF) is in the input field."],
                ["Try to fool the server by removing this token.", "Make the token field empty."],
                ["Clear the token field completely and press EXECUTE."]
            ]
        },
        // ------------------------------------
        html: `
            <div class="db-viewer">
                <p>Transfer money: <b>1000₿</b> to user #1337</p>
                <form id="csrf-form" onsubmit="return false;">
                    
                    <input type="hidden" name="csrf_token" id="csrf" value="9XAZ-SECURE-KEY-7788">
                    
                    <div style="text-align:right; margin-bottom:10px;">
                        <button type="button" 
                            onclick="document.getElementById('csrf').type='text'; this.style.display='none'" 
                            style="background:#333; border:1px dashed #777; font-size:0.8em; padding:5px; width:auto; cursor:pointer; color:#00ff41;">
                            🛠️ [F12] INSPECT
                        </button>
                    </div>

                    <button type="button" onclick="game.checkLevel()" id="level-btn">EXECUTE</button>
                </form>
            </div>
        `,
        checkSolution: function () {
            const token = document.getElementById("csrf");

            if (!token) {
                return { success: true, message: "Token removed!" };
            }

            // Якщо поле пусте - перемога
            if (token.value === "") {
                return { success: true, message: "Token emptied!" };
            }

            // Якщо змінили токен - теж перемога
            if (token.type !== "hidden" && token.value !== "9XAZ-SECURE-KEY-7788") {
                 return { success: true, message: "Token modified!" };
            }

            return { success: false, message: "CSRF token still valid." };
        }
    },
    // --- LEVEL 6: SSRF ---
    {
        id: 5,
        texts: {
            ua: { title: "Рівень 6: Внутрішній шпигун (SSRF)", description: "Запит піде на будь-яку адресу. Доступ можливий лише до localhost.", btn: "ЗАПИТ" },
            en: { title: "Level 6: Internal Spy (SSRF)", description: "Server fetches any URL. Reach internal host (localhost).", btn: "FETCH" }
        },
        hints: {
            ua: [
                ["Сервер може звернутися сам до себе.", "Зовнішні сайти заблоковані, але внутрішня мережа відкрита."],
                ["Адреса локального хоста - це ключ.", "Спробуйте loopback адресу."],
                ["Введіть: 127.0.0.1 або localhost"]
            ],
            en: [
                ["The server can request itself.", "External sites are blocked, but internal network is open."],
                ["Localhost address is the key.", "Try the loopback address."],
                ["Type: 127.0.0.1 or localhost"]
            ]
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
            ua: { title: "Рівень 7: Викрадення особистості", description: "Сервер довіряє cookie без перевірки. Стань ADMIN.", btn: "ПЕРЕВІРИТИ" },
            en: { title: "Level 7: Identity Theft", description: "Session cookie is not validated. Become ADMIN.", btn: "CHECK" }
        },
        hints: {
            ua: [
                ["Cookie зберігає вашу роль у відкритому вигляді.", "Ви зараз GUEST."],
                ["Просто замініть своє ім'я на ім'я адміністратора.", "Роль прописана великими літерами."],
                ["Впишіть: session=ADMIN"]
            ],
            en: [
                ["Cookie stores your role in plain text.", "You are currently GUEST."],
                ["Just replace your name with the admin's name.", "Role is in uppercase."],
                ["Type: session=ADMIN"]
            ]
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
            ua: { title: "Рівень 8: Системний наказ", description: "Ping приймає сторонні команди. Спробуй виконати щось зайве.", btn: "ВИКОНАТИ" },
            en: { title: "Level 8: System Command", description: "Ping accepts shell metacharacters. Inject a command.", btn: "EXECUTE" }
        },
        hints: {
            ua: [
                ["Термінал може виконати дві команди підряд.", "Використайте роздільник команд."],
                ["Символи ; або && дозволяють додати свою команду.", "IP адреса не важлива."],
                ["Введіть: 127.0.0.1; ls"]
            ],
            en: [
                ["The terminal can execute two commands in a row.", "Use a command separator."],
                ["Symbols ; or && allow adding your own command.", "The IP address doesn't matter."],
                ["Type: 127.0.0.1; ls"]
            ]
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
            ua: { title: "Рівень 9: Втеча з папки", description: "Дозволені лише 'public/'. Дістань 'flag.txt'.", btn: "ЗАВАНТАЖИТИ" },
            en: { title: "Level 9: Directory Escape", description: "Only 'public/' is allowed. Retrieve 'flag.txt'.", btn: "LOAD" }
        },
        hints: {
            ua: [
                ["Вам потрібно вийти з поточної папки.", "Символ '..' означає 'рівень вгору'."],
                ["Комбінуйте вихід з папки з назвою файлу.", "Сервер перевіряє тільки початок шляху."],
                ["Введіть: public/../flag.txt"]
            ],
            en: [
                ["You need to exit the current directory.", "The '..' symbol means 'level up'."],
                ["Combine exiting the folder with the filename.", "Server only checks the start of the path."],
                ["Type: public/../flag.txt"]
            ]
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
            ua: { title: "Рівень 10: Фальшивий пропуск (JWT)", description: "Зміни заголовок токена так, щоб сервер прийняв ADMIN.", btn: "ПЕРЕВІРИТИ" },
            en: { title: "Level 10: Fake ID (JWT)", description: "Modify header so system accepts ADMIN.", btn: "VERIFY" }
        },
        hints: {
            ua: [
                ["Токен складається з трьох частин. Важлива перша (alg).", "Спробуйте відключити шифрування."],
                ["Змініть алгоритм на 'none'.", "І звісно, змініть роль на ADMIN."],
                ["Введіть: {\"alg\":\"none\",\"role\":\"ADMIN\"}"]
            ],
            en: [
                ["Token has three parts. The first (alg) is crucial.", "Try disabling encryption."],
                ["Change the algorithm to 'none'.", "And of course, change the role to ADMIN."],
                ["Type: {\"alg\":\"none\",\"role\":\"ADMIN\"}"]
            ]
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
            ua: { title: "Рівень 11: Перегони з часом", description: "Зніми кошти двічі до блокування.", btn: "ЗНЯТИ" },
            en: { title: "Level 11: Race Against Time", description: "Withdraw twice before lock.", btn: "WITHDRAW" }
        },
        hints: {
            ua: [
                ["Система перевіряє баланс, потім знімає гроші. Між цими діями є мікро-пауза.", "Спробуйте надіслати два запити майже одночасно."],
                ["Вам потрібно натиснути кнопку швидше, ніж оновиться інтерфейс.", "Зробіть дуже швидкий подвійний клік."],
                ["Швидко натисніть 'ЗНЯТИ' два рази підряд."]
            ],
            en: [
                ["The system checks balance, then withdraws. There is a micro-pause.", "Try sending two requests almost simultaneously."],
                ["You need to click faster than the interface updates.", "Do a very fast double click."],
                ["Quickly click 'WITHDRAW' twice in a row."]
            ]
        },
        // Переконайся, що тут id="level-btn"
        html: `<div class="db-viewer"><p>Balance: <span id="bal">100</span>₿</p><button type="button" id="level-btn" onclick="game.checkLevel()">WITHDRAW</button></div>`,
        _last: 0,
        checkSolution() {
            const now = performance.now();
            const diff = now - (this._last || 0);
            this._last = now;
            
            const bal = document.getElementById('bal');
            bal.textContent = Math.max(0, +bal.textContent - 10);

            // ЗБІЛЬШИЛИ ЧАС ДО 500мс (було 300)
            if (diff && diff < 500) {
                return { success: true, message: "Race won!" };
            }
            
            return { success: false, message: "Too slow." };
        }
    },
    // --- LEVEL 12: INSECURE DESERIALIZATION ---
    {
        id: 11,
        texts: {
            ua: { title: "Рівень 12: Небезпечний вантаж", description: "Обʼєкт довіряється сліпо. Отримай ADMIN.", btn: "ІМПОРТ" },
            en: { title: "Level 12: Dangerous Payload", description: "Object is blindly trusted. Become ADMIN.", btn: "IMPORT" }
        },
        hints: {
            ua: [
                ["Сервер приймає будь-який JSON об'єкт.", "Змініть параметри об'єкта перед відправкою."],
                ["Вам потрібна роль ADMIN.", "Структура має бути валідною (JSON)."],
                ["Введіть: {\"user\":\"hacker\",\"role\":\"ADMIN\"}"]
            ],
            en: [
                ["Server accepts any JSON object.", "Modify object parameters before sending."],
                ["You need the ADMIN role.", "Structure must be valid JSON."],
                ["Type: {\"user\":\"hacker\",\"role\":\"ADMIN\"}"]
            ]
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
            ua: { title: "БОС: Цитадель (The Core)", description: "Обійди захист: ШЛЯХ + ТОКЕН + СЕСІЯ одночасно.", btn: "АТАКА" },
            en: { title: "BOSS: The Citadel", description: "Bypass PATH + TOKEN + SESSION at once.", btn: "ATTACK" }
        },
        hints: {
            ua: [
                ["Це комбінація всього, що ви вивчили.", "Потрібно заповнити всі три поля правильно."],
                ["Path: public/../flag.txt", "Token: alg=none, role=ADMIN", "Session: ADMIN"],
                ["Path: public/../flag.txt | Token: {\"alg\":\"none\",\"role\":\"ADMIN\"} | Session: session=ADMIN"]
            ],
            en: [
                ["This is a combination of everything you've learned.", "Fill all three fields correctly."],
                ["Path: public/../flag.txt", "Token: alg=none, role=ADMIN", "Session: ADMIN"],
                ["Path: public/../flag.txt | Token: {\"alg\":\"none\",\"role\":\"ADMIN\"} | Session: session=ADMIN"]
            ]
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







