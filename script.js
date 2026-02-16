document.addEventListener('DOMContentLoaded', () => {
    const launcher = document.getElementById('launcher-screen');
    const appContainer = document.getElementById('app-container');
    const masterStartBtn = document.getElementById('btn-master-start');
    
    const audio = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');

    // hide music control if audio can't be loaded
    audio.addEventListener('error', () => {
        if (musicBtn) musicBtn.style.display = 'none';
    });

    // keep UI in sync with audio state (single button)
    function updateMusicButton() {
        if (!musicBtn) return;
        const icon = audio.paused ? 'music_off' : 'music_note';
        musicBtn.innerHTML = `<span class="material-icons">${icon}</span>`;
        musicBtn.setAttribute('aria-pressed', (!audio.paused).toString());
    }

    // update when audio changes
    audio.addEventListener('play', updateMusicButton);
    audio.addEventListener('pause', updateMusicButton);

    // --- LAUNCHER ---
    masterStartBtn.addEventListener('click', () => {
        masterStartBtn.style.transform = "scale(0.95)";
        
        audio.volume = 0.7;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.log("Audio autoplay prevented. User must interact first."));
        }

        setTimeout(() => {
            launcher.style.opacity = '0';
            launcher.addEventListener('transitionend', () => {
                launcher.style.display = 'none';
                appContainer.classList.remove('hidden');
                appContainer.classList.add('visible');
                requestAnimationFrame(setNoPosition);
            }, { once: true });
        }, 500);
    });

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (audio.paused) {
                const p = audio.play();
                if (p !== undefined) p.catch(()=>{});
            } else {
                audio.pause();
            }
            updateMusicButton();
        });
    }

    // --- BOTÓN NO ---
    const noBtn = document.getElementById('no-btn');
    const placeholder = document.getElementById('placeholder');
    const taunts = ["¿Lag?", "Miss Click?", "¡Casi!", "Nope", "Jamás", "Ward?", "Flash?"];

    function setNoPosition() {
        const rect = placeholder.getBoundingClientRect();
        if(rect.width === 0) { 
            requestAnimationFrame(setNoPosition); 
            return; 
        }
        noBtn.style.position = 'absolute';
        noBtn.style.left = rect.left + 'px';
        noBtn.style.top = rect.top + 'px';
        noBtn.style.width = rect.width + 'px';
        noBtn.style.height = rect.height + 'px';
        noBtn.innerText = "No";
    }
    
    window.addEventListener('resize', setNoPosition);
    noBtn.addEventListener('mouseover', runAway);
    noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); runAway(); });

    function runAway() {
        window.removeEventListener('resize', setNoPosition);
        const maxX = window.innerWidth - noBtn.offsetWidth - 20;
        const maxY = window.innerHeight - noBtn.offsetHeight - 20;
        
        noBtn.style.position = 'fixed';
        noBtn.style.left = Math.max(10, Math.random() * maxX) + 'px';
        noBtn.style.top = Math.max(10, Math.random() * maxY) + 'px';
        noBtn.innerText = taunts[Math.floor(Math.random() * taunts.length)];
    }

    // --- NAVEGACIÓN ---
    function goTo(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    document.getElementById('yes-btn').addEventListener('click', () => {
        goTo('screen-intro');
        noBtn.style.display = 'none';
        if (audio.paused) audio.play();
    });

    document.getElementById('play-btn').addEventListener('click', () => {
        goTo('screen-game');
        initGame();
    });

    // accesibilidad: permitir activar botones con Enter cuando estén enfocados
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const el = document.activeElement;
            if (el && el.tagName === 'BUTTON') el.click();
        }
    });

    // --- JUEGO ---
    const items = ['⚔️', '🛡️', '🔥', '🐉', '🔮', '❤️', '👑', '💍'];
    let deck = [...items, ...items];
    let flipped = [];
    let score = 0;

    function initGame() {
        const grid = document.getElementById('game-grid');
        grid.innerHTML = '';
        deck.sort(() => 0.5 - Math.random());
        score = 0;
        flipped = [];

        deck.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.tabIndex = 0; // accesible por teclado
            card.innerHTML = `<div class="face front"></div><div class="face back">${item}</div>`;
            card.onclick = () => flip(card, item);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    flip(card, item);
                }
            });
            grid.appendChild(card);
        });
    }

    function flip(card, item) {
        if (flipped.length < 2 && !card.classList.contains('flipped')) {
            card.classList.add('flipped');
            flipped.push({ card, item });
            if (flipped.length === 2) check();
        }
    }

    function check() {
        const [a, b] = flipped;
        if (a.item === b.item) {
            score++;
            flipped = [];
            setTimeout(() => {
                a.card.classList.add('matched');
                b.card.classList.add('matched');
                if (score === items.length) winGame();
            }, 500);
        } else {
            setTimeout(() => {
                a.card.classList.remove('flipped');
                b.card.classList.remove('flipped');
                flipped = [];
            }, 1000);
        }
    }

    function winGame() {
        try {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#C8AA6E', '#0AC8B9', '#FFFFFF'] });
        } catch (e) {
            console.warn('Confetti no disponible:', e);
        }
        setTimeout(() => startTypewriter(), 1500);
    }
    
    document.getElementById('skip-game-btn').addEventListener('click', winGame);

    // --- CARTA ---
    // IMPORTANTE: El texto debe estar encerrado en comillas invertidas (`), no en comillas simples (') o dobles (").
    const fullText = `Hoy es San Valentín… y un día más de tortura a tu lado ajaja, no te creas amor. Tenerte así, tan cerca del corazón y todavía no abrazarte como quiero, desespera un poco.

Adamari, desde que llegaste a mi vida he sentido emociones que no sabía que podía sentir con tanta fuerza. Me has puesto nervioso, me has desarmado, me has hecho pensar más de la cuenta… y también me has enseñado que el amor no es algo tibio, es algo que sacude.

Eres una mujer increíble y maravillosa. No lo digo por decirlo. Lo digo porque contigo he sentido admiración, deseo, ternura, orgullo y hasta miedo de perder algo que apenas estoy construyendo. Desde que te conocí me encantó todo de ti: tu carácter, tu dulzura, tu forma de mirar, la manera en que hablas, cómo te enojas, cómo sonríes. Eres sumamente tierna y bella. Tus ojos y tus labios… son mi tentación constante, y no puedo evitar pensarlos.

Te amo porque contigo no siento algo superficial. Te amo porque me retas, porque me haces salir de mi zona cómoda, porque contigo nada es plano. Te amo porque incluso cuando hay problemas, cuando chocamos o no pensamos igual, sigo queriendo estar contigo. Y eso dice mucho. Lo fácil es querer cuando todo es perfecto; lo real es querer incluso cuando hay diferencias.

Aun con los problemas, te quiero conmigo. No por costumbre. No por capricho. Te quiero porque elijo quedarme. Porque veo futuro. Porque siento que lo que tenemos vale la pena trabajarlo y cuidarlo.

Hoy celebro que existes. Y celebro que, entre tantas personas en el mundo, me haya tocado conocerte a ti.`;
    
    let typingTimer;
    let isTyping = false;
    const skipLetterBtn = document.getElementById('skip-letter-btn');

    function startTypewriter() {
        goTo('screen-letter');
        const box = document.getElementById('typewriter-text');
        box.innerHTML = '';
        document.querySelector('.typing-cursor').style.display = 'inline-block';
        skipLetterBtn.style.display = ''; // mostrar si estaba oculto
        let i = 0;
        isTyping = true;
        
        function loop() {
            if (!isTyping) return;
            if (i < fullText.length) {
                const char = fullText.charAt(i);
                // CORRECCIÓN: Comprobar el carácter de nueva línea real (\n)
                box.innerHTML += (char === '\n') ? '<br><br>' : char;
                i++;
                const scroller = document.querySelector('.letter-content');
                scroller.scrollTop = scroller.scrollHeight;
                typingTimer = setTimeout(loop, Math.random() * 30 + 30);
            } else {
                document.querySelector('.typing-cursor').style.display = 'none';
                skipLetterBtn.style.display = 'none';
            }
        }
        loop();
    }

    skipLetterBtn.addEventListener('click', () => {
        isTyping = false;
        clearTimeout(typingTimer);
        const box = document.getElementById('typewriter-text');
        
        // CORRECCIÓN CLAVE: El error estaba aquí. 
        // La forma correcta de reemplazar todos los saltos de línea es con la expresión regular /\n/g
        // Una doble barra \\n buscaría el texto literal "\n", que no existe en el string.
        box.innerHTML = fullText.replace(/\n/g, '<br><br>');

        document.querySelector('.typing-cursor').style.display = 'none';
        skipLetterBtn.style.display = 'none';
    });
    // sincronizar estado inicial del botón de música con el audio
    updateMusicButton();});
