        // ============================================================
        //  JAVASCRIPT — Complete Application
        //  FIX: Garden flowers bloom fully BEFORE images appear.
        // ============================================================

        (function() {
            "use strict";

            // ─── CONFIG & STATE ──────────────────────────────────────────
            const isMobile = window.matchMedia('(pointer:coarse)').matches;
            let cur = 1;
            const songs = [
                { file: "audio/Tum-Hi-Ho.mp3", title: "Tum Hi Ho", artist: "Arijit Singh" },
                { file: "audio/Sitaare - Ikkis .mp3", title: "Sitaare", artist: "Ikkis" }
            ];

            function prepareImages() {
                document.querySelectorAll('img').forEach(image => {
                    image.loading = 'lazy';
                    image.decoding = 'async';
                });
            }

            function preparePage() {
                const progress = document.querySelector('.loadbar-fill');
                if (progress) progress.style.width = '100%';
                return document.fonts?.ready || Promise.resolve();
            }

            prepareImages();
            const pageReady = preparePage();
            let curSong = 0,
                audio = document.getElementById('audioPlayer'),
                playing = false;

            const anim = {
                frames: [],
                intervals: [],
                timeouts: [],
                addFrame(id) { this.frames.push(id); },
                addInterval(id) { this.intervals.push(id); },
                addTimeout(id) { this.timeouts.push(id); },
                clearAll() {
                    this.frames.forEach(id => cancelAnimationFrame(id));
                    this.intervals.forEach(id => clearInterval(id));
                    this.timeouts.forEach(id => clearTimeout(id));
                    this.frames = [];
                    this.intervals = [];
                    this.timeouts = [];
                }
            };

            // ─── GLOBAL FLOWER CANVAS ──────────────────────────────────
            let flowerCtx, flowerW, flowerH, flowerPetals = [],
                flowerAnimId = null;

            const flowerColors = [
                '#ff6b9d', '#ff8a80', '#ffc1e3', '#ffd700',
                '#f48fb1', '#e91e63', '#ffab91', '#ce93d8',
                '#ff80ab', '#ffb3c6', '#ff9a9e', '#fbc2eb',
                '#a18cd1', '#fad0c4', '#ffd1ff'
            ];

            function initFlowerCanvas() {
                const canvas = document.getElementById('flowerCanvas');
                flowerW = canvas.width = window.innerWidth;
                flowerH = canvas.height = window.innerHeight;
                flowerCtx = canvas.getContext('2d');

                const count = isMobile ? 120 : 220;
                flowerPetals = [];
                for (let i = 0; i < count; i++) {
                    flowerPetals.push(createFlowerPetal());
                }

                if (flowerAnimId) cancelAnimationFrame(flowerAnimId);
                drawFlowers();
            }

            function createFlowerPetal() {
                const isPetal = Math.random() > 0.25;
                const size = isPetal ?
                    8 + Math.random() * 22 :
                    14 + Math.random() * 28;
                const colors = isPetal ? flowerColors : ['#ffd700', '#ffb300', '#ff6f00', '#ffab00', '#ffea00'];
                return {
                    x: Math.random() * flowerW,
                    y: Math.random() * flowerH * 0.8 - 30,
                    size: size,
                    speed: 0.2 + Math.random() * 0.8,
                    angle: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.035,
                    sway: Math.random() * 2 - 1,
                    swaySpeed: 0.004 + Math.random() * 0.018,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    opacity: 0.12 + Math.random() * 0.40,
                    type: isPetal ? 'petal' : 'flower',
                    phase: Math.random() * Math.PI * 2,
                    petalCount: 3 + Math.floor(Math.random() * 4),
                    rotation: Math.random() * Math.PI * 2
                };
            }

            function drawFlowers() {
                flowerCtx.clearRect(0, 0, flowerW, flowerH);

                flowerPetals.forEach(p => {
                    p.y += p.speed * 0.5;
                    p.x += Math.sin(p.phase + Date.now() * p.swaySpeed) * p.sway * 0.5;
                    p.angle += p.rotSpeed;

                    if (p.y > flowerH + 40) {
                        p.y = -40;
                        p.x = Math.random() * flowerW;
                        p.size = (p.type === 'petal' ? 8 : 14) + Math.random() * (p.type === 'petal' ? 22 : 28);
                        p.color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
                        p.petalCount = 3 + Math.floor(Math.random() * 4);
                    }

                    flowerCtx.save();
                    flowerCtx.globalAlpha = p.opacity;
                    flowerCtx.translate(p.x, p.y);
                    flowerCtx.rotate(p.angle);

                    if (p.type === 'petal') {
                        const w = p.size * 0.45;
                        const h = p.size;
                        flowerCtx.beginPath();
                        flowerCtx.moveTo(0, -h);
                        flowerCtx.bezierCurveTo(w, -h * 0.6, w * 1.1, h * 0.1, 0, h * 0.85);
                        flowerCtx.bezierCurveTo(-w * 1.1, h * 0.1, -w, -h * 0.6, 0, -h);
                        flowerCtx.fillStyle = p.color;
                        flowerCtx.shadowColor = 'rgba(255,255,255,0.03)';
                        flowerCtx.shadowBlur = 6;
                        flowerCtx.fill();
                        flowerCtx.beginPath();
                        flowerCtx.moveTo(0, -h * 0.6);
                        flowerCtx.bezierCurveTo(w * 0.35, -h * 0.35, w * 0.3, 0, 0, h * 0.2);
                        flowerCtx.bezierCurveTo(-w * 0.3, 0, -w * 0.35, -h * 0.35, 0, -h * 0.6);
                        flowerCtx.fillStyle = 'rgba(255,255,255,0.12)';
                        flowerCtx.fill();
                    } else {
                        const r = p.size * 0.5;
                        const petalCount = p.petalCount || 5;
                        for (let i = 0; i < petalCount; i++) {
                            const a = (Math.PI * 2 / petalCount) * i + p.rotation;
                            const px = Math.cos(a) * r * 0.75;
                            const py = Math.sin(a) * r * 0.75;
                            flowerCtx.beginPath();
                            flowerCtx.ellipse(px, py, r * 0.5, r * 0.6, a, 0, Math.PI * 2);
                            flowerCtx.fillStyle = p.color;
                            flowerCtx.shadowColor = 'rgba(255,255,255,0.02)';
                            flowerCtx.shadowBlur = 4;
                            flowerCtx.fill();
                        }
                        flowerCtx.beginPath();
                        flowerCtx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
                        flowerCtx.fillStyle = '#ffd700';
                        flowerCtx.shadowColor = 'rgba(255,215,0,0.25)';
                        flowerCtx.shadowBlur = 12;
                        flowerCtx.fill();
                        flowerCtx.beginPath();
                        flowerCtx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
                        flowerCtx.fillStyle = '#fff7e0';
                        flowerCtx.shadowBlur = 8;
                        flowerCtx.fill();
                    }

                    flowerCtx.restore();
                    flowerCtx.globalAlpha = 1;
                    flowerCtx.shadowBlur = 0;
                });

                flowerAnimId = requestAnimationFrame(drawFlowers);
                anim.addFrame(flowerAnimId);
            }

            // ─── TREE FLOWER CANVAS ─────────────────────────────────────
            let treeFlowerCtx, treeFlowerW, treeFlowerH, treeFlowerPetals = [],
                treeFlowerAnimId = null;

            function initTreeFlowerCanvas() {
                const canvas = document.getElementById('treeFlowerCanvas');
                treeFlowerW = canvas.width = window.innerWidth;
                treeFlowerH = canvas.height = window.innerHeight;
                treeFlowerCtx = canvas.getContext('2d');

                const count = isMobile ? 50 : 90;
                treeFlowerPetals = [];
                for (let i = 0; i < count; i++) {
                    const isPetal = Math.random() > 0.3;
                    const size = isPetal ? 6 + Math.random() * 16 : 10 + Math.random() * 20;
                    const colors = isPetal ? flowerColors : ['#ffd700', '#ffb300', '#ffea00'];
                    treeFlowerPetals.push({
                        x: Math.random() * treeFlowerW,
                        y: Math.random() * treeFlowerH * 0.9 - 20,
                        size: size,
                        speed: 0.15 + Math.random() * 0.5,
                        angle: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.025,
                        sway: Math.random() * 2 - 1,
                        swaySpeed: 0.003 + Math.random() * 0.012,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        opacity: 0.10 + Math.random() * 0.30,
                        type: isPetal ? 'petal' : 'flower',
                        phase: Math.random() * Math.PI * 2,
                        petalCount: 3 + Math.floor(Math.random() * 4),
                        rotation: Math.random() * Math.PI * 2
                    });
                }

                if (treeFlowerAnimId) cancelAnimationFrame(treeFlowerAnimId);
                drawTreeFlowers();
            }

            function drawTreeFlowers() {
                treeFlowerCtx.clearRect(0, 0, treeFlowerW, treeFlowerH);

                treeFlowerPetals.forEach(p => {
                    p.y += p.speed * 0.4;
                    p.x += Math.sin(p.phase + Date.now() * p.swaySpeed) * p.sway * 0.4;
                    p.angle += p.rotSpeed;

                    if (p.y > treeFlowerH + 30) {
                        p.y = -30;
                        p.x = Math.random() * treeFlowerW;
                        p.size = (p.type === 'petal' ? 6 : 10) + Math.random() * (p.type === 'petal' ? 16 : 20);
                        p.color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
                    }

                    treeFlowerCtx.save();
                    treeFlowerCtx.globalAlpha = p.opacity;
                    treeFlowerCtx.translate(p.x, p.y);
                    treeFlowerCtx.rotate(p.angle);

                    if (p.type === 'petal') {
                        const w = p.size * 0.4;
                        const h = p.size * 0.9;
                        treeFlowerCtx.beginPath();
                        treeFlowerCtx.moveTo(0, -h);
                        treeFlowerCtx.bezierCurveTo(w, -h * 0.6, w * 1.0, h * 0.1, 0, h * 0.8);
                        treeFlowerCtx.bezierCurveTo(-w * 1.0, h * 0.1, -w, -h * 0.6, 0, -h);
                        treeFlowerCtx.fillStyle = p.color;
                        treeFlowerCtx.fill();
                        treeFlowerCtx.beginPath();
                        treeFlowerCtx.moveTo(0, -h * 0.55);
                        treeFlowerCtx.bezierCurveTo(w * 0.3, -h * 0.3, w * 0.25, 0, 0, h * 0.15);
                        treeFlowerCtx.bezierCurveTo(-w * 0.3, 0, -w * 0.3, -h * 0.3, 0, -h * 0.55);
                        treeFlowerCtx.fillStyle = 'rgba(255,255,255,0.10)';
                        treeFlowerCtx.fill();
                    } else {
                        const r = p.size * 0.45;
                        const petalCount = p.petalCount || 5;
                        for (let i = 0; i < petalCount; i++) {
                            const a = (Math.PI * 2 / petalCount) * i + p.rotation;
                            const px = Math.cos(a) * r * 0.7;
                            const py = Math.sin(a) * r * 0.7;
                            treeFlowerCtx.beginPath();
                            treeFlowerCtx.ellipse(px, py, r * 0.45, r * 0.55, a, 0, Math.PI * 2);
                            treeFlowerCtx.fillStyle = p.color;
                            treeFlowerCtx.fill();
                        }
                        treeFlowerCtx.beginPath();
                        treeFlowerCtx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
                        treeFlowerCtx.fillStyle = '#ffd700';
                        treeFlowerCtx.shadowColor = 'rgba(255,215,0,0.15)';
                        treeFlowerCtx.shadowBlur = 8;
                        treeFlowerCtx.fill();
                        treeFlowerCtx.shadowBlur = 0;
                    }

                    treeFlowerCtx.restore();
                    treeFlowerCtx.globalAlpha = 1;
                });

                treeFlowerAnimId = requestAnimationFrame(drawTreeFlowers);
                anim.addFrame(treeFlowerAnimId);
            }

            // ─── PAGE CLEANUP ──────────────────────────────────────────
            function cleanupPage() {
                anim.clearAll();
                if (window.treeIv) { clearInterval(window.treeIv);
                    window.treeIv = null; }
                if (window.mIv) { clearInterval(window.mIv);
                    window.mIv = null; }
                if (window.gardenIv) { clearInterval(window.gardenIv);
                    window.gardenIv = null; }
                if (loveIv) { cancelAnimationFrame(loveIv);
                    loveIv = null; }
                if (rainImgInterval) { clearInterval(rainImgInterval);
                    rainImgInterval = null; }
                if (frAnimId) { cancelAnimationFrame(frAnimId);
                    frAnimId = null; }
                if (countdownTimer) { clearInterval(countdownTimer);
                    countdownTimer = null; }
                if (hAnim) { cancelAnimationFrame(hAnim);
                    hAnim = null; }
                if (tAnim) { cancelAnimationFrame(tAnim);
                    tAnim = null; }
                if (gAnim) { cancelAnimationFrame(gAnim);
                    gAnim = null; }
                if (gardenSlideTimer) { clearTimeout(gardenSlideTimer);
                    gardenSlideTimer = null; }
                if (gardenSlideInterval) { clearInterval(gardenSlideInterval);
                    gardenSlideInterval = null; }
                if (gardenBloomCheckId) { cancelAnimationFrame(gardenBloomCheckId);
                    gardenBloomCheckId = null; }
                document.querySelectorAll('.card').forEach(el => el.classList.remove('show'));
                stopGardenAutoSlide();
                // Reset garden bloom flag so it re-triggers on revisit
                gardenBloomCompleted = false;
            }

            // ─── NAVIGATION ──────────────────────────────────────────────
            function goTo(n) {
                cleanupPage();

                const countdown = document.getElementById('countdownOverlay');
                countdown.classList.remove('active');
                countdown.style.display = 'none';
                countdown.style.opacity = '0';

                const canvas = document.getElementById('frCanvas');
                canvas.classList.remove('active');
                canvas.style.display = 'none';
                canvas.style.opacity = '1';

                const currentPage = document.getElementById('p' + cur);
                if (currentPage) currentPage.classList.remove('active');

                const nextPage = document.getElementById('p' + n);
                if (nextPage) nextPage.classList.add('active');
                cur = n;

                if (n === 3) initHeart();
                if (n === 4) { initTree();
                    initTreeFlowerCanvas(); }
                if (n === 5) initAlbum();
                if (n === 6) initCarousel();
                if (n === 7) {
                    // GARDEN: start flowers, images will appear ONLY after bloom completes
                    initGarden();
                    // Do NOT call startGardenAutoSlide() here — it will be triggered by bloom completion.
                }
                if (n === 8) initLoveRain();
                if (n === 9) initFinal();
                if (n === 2) showMusic();
            }

            function goToPage9() {
                cleanupPage();
                const countdown = document.getElementById('countdownOverlay');
                countdown.classList.remove('active');
                countdown.style.display = 'none';
                countdown.style.opacity = '0';

                const canvas = document.getElementById('frCanvas');
                canvas.classList.remove('active');
                canvas.style.display = 'none';
                canvas.style.opacity = '1';

                const currentPage = document.getElementById('p8');
                if (currentPage) currentPage.classList.remove('active');

                const nextPage = document.getElementById('p9');
                if (nextPage) nextPage.classList.add('active');
                cur = 9;
                initFinal();
            }

            const loadTimer = setTimeout(() => {
                pageReady.then(() => {
                    if (cur === 1) goTo(2);
                });
            }, 700);
            anim.addTimeout(loadTimer);

            // ─── PETALS ──────────────────────────────────────────────────
            function initPetals() {
                for (let p = 1; p <= 9; p++) {
                    const box = document.getElementById('petal' + p);
                    if (!box) continue;
                    const count = (p === 4) ? 30 : 18;
                    for (let i = 0; i < count; i++) {
                        const s = document.createElement('div');
                        s.className = 'petal';
                        s.innerHTML = ['💕', '💖', '❤️', '💗', '💓', '💝', '♥️', '🌸', '✨'][Math.floor(Math.random() * 9)];
                        s.style.left = Math.random() * 100 + '%';
                        s.style.animationDuration = (8 + Math.random() * 10) + 's';
                        s.style.animationDelay = Math.random() * 5 + 's';
                        const baseSize = 1.8 + Math.random() * 1.2;
                        s.style.fontSize = baseSize + 'rem';
                        box.appendChild(s);
                    }
                }
            }
            initPetals();

            function initTreeExtraFloats() {
                const container = document.getElementById('treeExtraFloats');
                if (!container) return;
                const emojis = ['💕', '💖', '❤️', '💗', '💓', '💝', '♥️', '🌸', '✨'];
                for (let i = 0; i < 20; i++) {
                    const el = document.createElement('div');
                    el.className = 'tree-extra-float';
                    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    el.style.left = Math.random() * 100 + '%';
                    el.style.fontSize = (1.8 + Math.random() * 2) + 'rem';
                    el.style.animationDuration = (15 + Math.random() * 15) + 's';
                    el.style.animationDelay = Math.random() * 10 + 's';
                    container.appendChild(el);
                }
            }
            initTreeExtraFloats();

            // ─── FLOATING EMOJIS ──────────────────────────────────────
            (function() {
                const box = document.getElementById('floatBg');
                const em = ['💕', '💖', '❤️', '💗', '💓', '💝', '♥️', '🌸', '✨', '🦋', '🌷', '🌺'];
                const count = isMobile ? 35 : 50;
                for (let i = 0; i < count; i++) {
                    const h = document.createElement('div');
                    h.className = 'f-emoji';
                    h.innerHTML = em[Math.floor(Math.random() * em.length)];
                    h.style.left = Math.random() * 100 + '%';
                    const dur = 10 + Math.random() * 14;
                    h.style.animationDuration = dur + 's';
                    h.style.animationDelay = Math.random() * 8 + 's';
                    const size = 0.8 + Math.random() * 1.2;
                    h.style.fontSize = size + 'rem';
                    box.appendChild(h);
                }
                for (let i = 0; i < 15; i++) {
                    const h = document.createElement('div');
                    h.className = 'f-emoji';
                    h.innerHTML = '💕';
                    h.style.left = Math.random() * 100 + '%';
                    h.style.animationDuration = (12 + Math.random() * 14) + 's';
                    h.style.animationDelay = Math.random() * 10 + 's';
                    h.style.fontSize = (0.8 + Math.random() * 1.0) + 'rem';
                    box.appendChild(h);
                }
            })();

            // ─── MUSIC ─────────────────────────────────────────────────
            function showMusic() { document.getElementById('musicBox').style.display = 'flex';
                changeSong(0, false); }

            function toggleSongMenu() { document.getElementById('songMenu').classList.toggle('show'); }

            function changeSong(idx, auto = true) {
                curSong = idx;
                audio.src = songs[idx].file;
                document.getElementById('mTitle').textContent = songs[idx].title;
                document.querySelectorAll('.song-opt').forEach((el, i) => el.classList.toggle('active', i === idx));
                document.getElementById('songMenu').classList.remove('show');
                if (auto) {
                    audio.play().then(() => setPlayUI(true)).catch(() => setPlayUI(false));
                } else { setPlayUI(false); }
            }

            function toggleMusic() {
                if (!audio.src) changeSong(0, false);
                if (playing) { audio.pause();
                    setPlayUI(false); } else {
                    audio.play().then(() => setPlayUI(true)).catch(() => alert('Tap page first, then play 💕'));
                }
            }

            function setPlayUI(on) {
                playing = on;
                document.getElementById('mBtn').innerHTML = on ? '⏸' : '▶';
                document.getElementById('mBtn').classList.toggle('playing', on);
                document.getElementById('mViz').classList.toggle('paused', !on);
            }
            document.addEventListener('click', function unlock() {
                if (audio.src && audio.paused && !playing) {
                    audio.play().then(() => setPlayUI(true)).catch(() => {});
                }
                document.removeEventListener('click', unlock);
            }, { once: true });

            // ─── HEART CANVAS ──────────────────────────────────────────
            let hCtx, hW, hH, hAnim, hParts = [],
                hPts = [];

            function initHeart() {
                const c = document.getElementById('heartCanvas');
                hW = c.width = window.innerWidth;
                hH = c.height = window.innerHeight;
                hCtx = c.getContext('2d');
                hParts = [];
                hPts = [];
                const sc = Math.min(hW, hH) * 0.014,
                    cx = hW / 2,
                    cy = hH / 2;
                for (let i = 0; i < Math.PI * 2; i += 0.04) {
                    const x = 16 * Math.pow(Math.sin(i), 3),
                        y = -(13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i));
                    hPts.push([cx + x * sc, cy + y * sc]);
                }
                const n = isMobile ? 250 : 500;
                for (let i = 0; i < n; i++) hParts.push(makePart());
                if (hAnim) cancelAnimationFrame(hAnim);
                drawHeart();
            }

            function makePart() {
                const t = hPts[Math.floor(Math.random() * hPts.length)];
                return {
                    x: Math.random() * hW,
                    y: Math.random() * hH,
                    tx: t[0] + (Math.random() - 0.5) * 40,
                    ty: t[1] + (Math.random() - 0.5) * 40,
                    vx: 0,
                    vy: 0,
                    sp: 1 + Math.random() * 2,
                    sz: 1 + Math.random() * 2,
                    col: `hsla(${340+Math.random()*30},${80+Math.random()*20}%,${50+Math.random()*30}%,${0.3+Math.random()*0.5})`,
                    tr: []
                };
            }

            function drawHeart() {
                hCtx.fillStyle = 'rgba(26,5,18,0.12)';
                hCtx.fillRect(0, 0, hW, hH);
                const tm = Date.now() * 0.001,
                    pl = 1 + Math.sin(tm * 1.5) * 0.08,
                    cx = hW / 2,
                    cy = hH / 2;
                hParts.forEach(p => {
                    const dx = (p.tx - cx) * pl + cx - p.x,
                        dy = (p.ty - cy) * pl + cy - p.y,
                        d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 5 || Math.random() < 0.004) {
                        const t = hPts[Math.floor(Math.random() * hPts.length)];
                        p.tx = t[0] + (Math.random() - 0.5) * 50;
                        p.ty = t[1] + (Math.random() - 0.5) * 50;
                    }
                    p.vx += (dx / d) * p.sp * 0.05;
                    p.vy += (dy / d) * p.sp * 0.05;
                    p.vx *= 0.94;
                    p.vy *= 0.94;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.tr.push({ x: p.x, y: p.y });
                    if (p.tr.length > 8) p.tr.shift();
                    hCtx.beginPath();
                    hCtx.strokeStyle = p.col;
                    hCtx.lineWidth = p.sz * 0.5;
                    for (let i = 1; i < p.tr.length; i++) {
                        hCtx.moveTo(p.tr[i - 1].x, p.tr[i - 1].y);
                        hCtx.lineTo(p.tr[i].x, p.tr[i].y);
                    }
                    hCtx.stroke();
                    hCtx.beginPath();
                    hCtx.fillStyle = p.col;
                    hCtx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
                    hCtx.fill();
                });
                hAnim = requestAnimationFrame(drawHeart);
                anim.addFrame(hAnim);
            }

            // ─── TREE ──────────────────────────────────────────────────
            let tCtx, tW, tH, tAnim, tBranches = [];

            const treeSideData = [
                { img: 'image/pic1.jpg', txt: 'হাত ধরে হাঁটি, আপনার সাথে প্রতিটি পথ ঘরের মতো লাগে...' },
                { img: 'image/pic2.jpg', txt: 'আপনার বাহুতে আমি এই পৃথিবীর সবচেয়ে নিরাপদ জায়গা খুঁজে পেয়েছি...' },
                { img: 'image/pic3.jpg', txt: 'সহজ মুহূর্তগুলোও জাদুকরী হয়ে ওঠে যখন আমি আপনার সাথে থাকি...' },
                { img: 'image/pic4.jpg', txt: 'তারা-ভরা রাতে, আমি আপনাকে চেয়েছিলাম, আর মহাবিশ্ব সাড়া দিয়েছে...' },
                { img: 'image/pic5.jpg', txt: 'বৃষ্টিতে আপনার সাথে নাচ আমার প্রিয় বিশৃঙ্খলা...' },
                { img: 'image/pic6.jpg', txt: 'বালিতে আমাদের পায়ের ছাপ – ঢেউ যাকে কখনো মুছে ফেলতে পারে না...' },
                { img: 'image/pic7.jpg', txt: 'আপনার বিশেষ দিনে আপনার হাসি আমার হৃদয়ের সবচেয়ে বড় উপহার...' },
                { img: 'image/pic8.jpg', txt: 'আমি এই জীবনেও আপনাকে ভালোবাসব, এবং পরবর্তী প্রতিটি জীবনেও...' }
            ];

            let treeImageSequenceStarted = false;
            let treeImageIdx = 0;
            let treeMsgTimers = [];
            let sequenceRunning = false;

            function initTree() {
                const c = document.getElementById('treeCanvas');
                tW = c.width = window.innerWidth;
                tH = c.height = window.innerHeight;
                tCtx = c.getContext('2d');
                tBranches = [];
                treeImageSequenceStarted = false;
                treeImageIdx = 0;
                treeMsgTimers.forEach(t => clearTimeout(t));
                treeMsgTimers = [];
                sequenceRunning = false;

                const imgs = document.querySelectorAll('.tree-side-img');
                imgs.forEach((img) => {
                    img.classList.remove('show');
                    img.style.opacity = '0';
                    img.style.top = '-20%';
                    img.style.left = 'auto';
                    img.style.right = 'auto';
                    const bubble = img.querySelector('.tree-msg-bubble');
                    if (bubble) {
                        bubble.classList.remove('show');
                        bubble.textContent = '';
                    }
                });

                document.getElementById('treeMsg').style.opacity = '0';
                document.getElementById('treeBtn').style.opacity = '0';

                const startLen = Math.min(tW, tH) * 0.28;
                genTree(tW / 2, tH * 0.9, startLen, -90, 0);
                let f = 0,
                    spd = isMobile ? 2 : 3;

                function draw() {
                    tCtx.fillStyle = 'rgba(26,5,18,0.25)';
                    tCtx.fillRect(0, 0, tW, tH);
                    let drawn = 0;
                    for (let i = 0; i < Math.min(f * spd, tBranches.length); i++) {
                        const b = tBranches[i];
                        tCtx.beginPath();
                        tCtx.strokeStyle = b.c;
                        tCtx.lineWidth = b.w;
                        tCtx.lineCap = 'round';
                        tCtx.moveTo(b.x1, b.y1);
                        tCtx.lineTo(b.x2, b.y2);
                        tCtx.stroke();
                        if (b.tip) {
                            tCtx.beginPath();
                            tCtx.fillStyle = '#ff8a65';
                            tCtx.arc(b.x2, b.y2, 2.5, 0, Math.PI * 2);
                            tCtx.fill();
                        }
                        drawn++;
                    }
                    f++;
                    if (drawn < tBranches.length) {
                        tAnim = requestAnimationFrame(draw);
                        anim.addFrame(tAnim);
                    } else {
                        const seqTimer = setTimeout(() => {
                            if (!treeImageSequenceStarted) {
                                treeImageSequenceStarted = true;
                                startFullScreenSequence();
                            }
                        }, 600);
                        anim.addTimeout(seqTimer);
                    }
                }
                if (tAnim) cancelAnimationFrame(tAnim);
                draw();
            }

            function genTree(x, y, len, ang, dep) {
                if (len < 8) return;
                const r = ang * Math.PI / 180,
                    x2 = x + len * Math.cos(r),
                    y2 = y + len * Math.sin(r);
                tBranches.push({
                    x1: x,
                    y1: y,
                    x2: x2,
                    y2: y2,
                    c: `hsl(${20+dep*3},${50+dep*5}%,${25+dep*3}%)`,
                    w: Math.max(1, 6 - dep * 0.7),
                    tip: false
                });
                if (dep > 1 && dep < 8) tBranches.push({ x1: x2, y1: y2, x2: x2, y2: y2, c: '#ff8a65', w: 0, tip: true });
                genTree(x2, y2, len * 0.72, ang - 30, dep + 1);
                genTree(x2, y2, len * 0.72, ang + 30, dep + 1);
            }

            function startFullScreenSequence() {
                if (sequenceRunning) return;
                sequenceRunning = true;
                const imgs = document.querySelectorAll('.tree-side-img');
                imgs.forEach(img => {
                    img.classList.remove('show');
                    img.style.opacity = '0';
                    img.style.top = '-20%';
                    img.style.left = 'auto';
                    img.style.right = 'auto';
                });
                treeImageIdx = 0;
                showNextFullScreen(imgs);
            }

            function showNextFullScreen(imgs) {
                if (treeImageIdx >= imgs.length) {
                    document.getElementById('treeMsg').style.opacity = '1';
                    const btnTimer = setTimeout(() => {
                        document.getElementById('treeBtn').style.opacity = '1';
                    }, 800);
                    anim.addTimeout(btnTimer);
                    sequenceRunning = false;
                    return;
                }

                const idx = treeImageIdx;
                const img = imgs[idx];
                openTreeModalWithCallback(idx, function() {
                    const closeTimer = setTimeout(() => {
                        closeTreeModalDirect();
                        const isLeft = img.classList.contains('ts-left');
                        if (isLeft) {
                            img.style.left = '1.5%';
                            img.style.right = 'auto';
                        } else {
                            img.style.right = '1.5%';
                            img.style.left = 'auto';
                        }
                        const topClass = img.className.match(/ts-\d/);
                        let finalTop = '9%';
                        if (topClass) {
                            const cls = topClass[0];
                            const map = {
                                'ts-1': '9%',
                                'ts-2': '27%',
                                'ts-3': '45%',
                                'ts-4': '63%',
                                'ts-5': '15%',
                                'ts-6': '33%',
                                'ts-7': '51%',
                                'ts-8': '69%'
                            };
                            finalTop = map[cls] || '9%';
                        }
                        requestAnimationFrame(() => {
                            img.style.opacity = '1';
                            img.style.top = finalTop;
                            img.classList.add('show');
                        });
                        const nextTimer = setTimeout(() => {
                            treeImageIdx++;
                            showNextFullScreen(imgs);
                        }, 900);
                        anim.addTimeout(nextTimer);
                    }, 1200);
                    anim.addTimeout(closeTimer);
                });
            }

            function openTreeModalWithCallback(idx, callback) {
                const d = treeSideData[idx];
                const imgContainer = document.getElementById('treeModalImg');
                imgContainer.innerHTML =
                    `<img src="${d.img}" alt="" onerror="this.style.display='none';this.parentElement.innerText='💕';">`;
                const textContainer = document.getElementById('treeModalText');
                textContainer.innerHTML = '';
                document.getElementById('treeModal').classList.add('active');

                let c = 0;
                if (window.treeIv) clearInterval(window.treeIv);
                window.treeIv = setInterval(() => {
                    if (!document.getElementById('treeModal').classList.contains('active')) {
                        clearInterval(window.treeIv);
                        if (callback) callback();
                        return;
                    }
                    if (c < d.txt.length) {
                        textContainer.innerHTML = d.txt.substring(0, c + 1) + '<span class="cursor"></span>';
                        c++;
                    } else {
                        clearInterval(window.treeIv);
                        textContainer.innerHTML = d.txt;
                        if (callback) callback();
                    }
                }, 38);
                anim.addInterval(window.treeIv);
            }

            function openTreeModal(idx) {
                openTreeModalWithCallback(idx, null);
            }

            function closeTreeModal(e) {
                if (e.target === e.currentTarget) {
                    document.getElementById('treeModal').classList.remove('active');
                    if (window.treeIv) clearInterval(window.treeIv);
                }
            }

            function closeTreeModalDirect() {
                document.getElementById('treeModal').classList.remove('active');
                if (window.treeIv) clearInterval(window.treeIv);
            }

            // ─── ALBUM ──────────────────────────────────────────────────
            const albumData = [
                { img: 'image/HMK0.jpg', txt: 'হাত ধরে হাঁটি, আপনার সাথে প্রতিটি পথ ঘরের মতো লাগে…' },
                { img: 'image/HMK01.jpg', txt: 'আপনার বাহুতে আমি এই পৃথিবীর সবচেয়ে নিরাপদ জায়গা খুঁজে পেয়েছি।' },
                { img: 'image/HMK02.jpg', txt: 'সহজ মুহূর্তগুলোও জাদুকরী হয়ে ওঠে যখন আমি আপনার সাথে থাকি।' },
                { img: 'image/HMK03.jpg', txt: 'তারা-ভরা রাতে, আমি আপনাকে চেয়েছিলাম — আর মহাবিশ্ব সাড়া দিয়েছে।' },
                { img: 'image/HMK04.jpg', txt: 'বৃষ্টিতে আপনার সাথে নাচ আমার প্রিয় বিশৃঙ্খলা।' },
                { img: 'image/HMK05.jpg', txt: 'বালিতে আমাদের পায়ের ছাপ — ঢেউ যাকে কখনো মুছে ফেলতে পারে না।' },
                { img: 'image/HMK06.jpg', txt: 'আপনার হাসি আমার হৃদয়ের সবচেয়ে বড় উপহার, আজ এবং চিরকাল।' },
                { img: 'image/HMK07.jpg', txt: 'আমি এই জীবনেও আপনাকে ভালোবাসব, এবং পরবর্তী প্রতিটি জীবনেও।' },
                { img: 'image/HMK07296.jpg', txt: 'গোলাপের ক্ষেতেও আপনি সবচেয়ে সুন্দর ফুল।' },
                { img: 'image/HMK07332.jpg', txt: 'আপনার সাথে প্রতিটি মুহূর্ত আমার আত্মার জন্য পিকনিকের মতো।' },
                { img: 'image/HMK07371.jpg', txt: 'চেরি ব্লসমের নিচে আমাদের ভালোবাসা চিরকাল ফোটে।' }
            ];

            function initAlbum() {
                const g = document.getElementById('albumGrid');
                g.innerHTML = '';
                const q = document.getElementById('albumQ');
                q.style.display = 'none';
                q.classList.remove('show');

                const cardDelay = isMobile ? 1200 : 1500;
                const typingSpeed = isMobile ? 20 : 25;

                albumData.forEach((it, i) => {
                    const d = document.createElement('div');
                    d.className = 'card';
                    d.innerHTML =
                        `<div class="card-img"><img src="${it.img}" alt="" loading="lazy" onerror="this.style.display='none';this.parentElement.innerText='💕';"></div><div class="card-text" id="ct-${i}"><span class="cursor"></span></div>`;
                    g.appendChild(d);
                    const showTimer = setTimeout(() => {
                        d.classList.add('show');
                        typeWrite(`ct-${i}`, it.txt, typingSpeed);
                    }, i * cardDelay);
                    anim.addTimeout(showTimer);
                });

                const totalDelay = albumData.length * cardDelay + 1200;
                const qTimer = setTimeout(() => {
                    q.style.display = 'block';
                    q.style.animation = 'none';
                    requestAnimationFrame(() => {
                        q.style.animation = 'floatIn 0.8s ease';
                        q.classList.add('show');
                    });
                }, totalDelay);
                anim.addTimeout(qTimer);
            }

            function typeWrite(id, txt, speed = 25) {
                const el = document.getElementById(id);
                if (!el) return;
                let i = 0;
                el.innerHTML = '<span class="cursor"></span>';
                const iv = setInterval(() => {
                    if (i < txt.length) {
                        el.innerHTML = txt.substring(0, i + 1) + '<span class="cursor"></span>';
                        i++;
                    } else { clearInterval(iv);
                        el.innerHTML = txt; }
                }, speed);
                anim.addInterval(iv);
            }

            // ─── CAROUSEL ──────────────────────────────────────────────
            const cData = [
                { img: 'image/HMK09.jpg', txt: 'যে মুহূর্তে আমাদের চোখ দেখা হলো...' },
                { img: 'image/HMK10.jpg', txt: 'আমাদের প্রথম সূর্যোদয় একসাথে...' },
                { img: 'image/HMK11.jpg', txt: 'বৃষ্টিতে নাচ...' },
                { img: 'image/HMK12.jpg', txt: 'পিৎজা রাত...' },
                { img: 'image/HMK13.jpg', txt: 'ফেরিস হুইলের চূড়ায়...' },
                { img: 'image/HMK14.jpg', txt: 'আপনার বিশেষ দিন...' },
                { img: 'image/HMK15.jpg', txt: 'মধ্যরাতের কথোপকথন...' },
                { img: 'image/HMK16.jpg', txt: 'আমাদের সৈকত দিন...' },
                { img: 'image/HMK17.jpg', txt: 'সিনেমার রাত...' },
                { img: 'image/HMK18.jpg', txt: 'যে দিন আমি আপনাকে চমকে দিয়েছিলাম...' },
                { img: 'image/HMK19.jpg', txt: 'আইসক্রিম ভাগ করে খাওয়া...' },
                { img: 'image/HMK20.jpg', txt: 'বাগানের মধ্য দিয়ে হাঁটা...' },
                { img: 'image/HMK21.jpg', txt: 'আমাদের প্রথম ভ্রমণ...' },
                { img: 'image/HMK22.jpg', txt: 'যে দিন আমি হাঁটু গেড়েছিলাম...' },
                { img: 'image/HMK23.jpg', txt: 'আমাদের বিয়ের দিন...' }
            ];

            function initCarousel() {
                const r = document.getElementById('cRing');
                r.innerHTML = '';
                const rad = isMobile ? 110 : 170,
                    step = 360 / cData.length;
                cData.forEach((it, i) => {
                    const d = document.createElement('div');
                    d.className = 'c-item';
                    d.innerHTML =
                        `<img src="${it.img}" alt="" loading="lazy" onerror="this.style.display='none';this.parentElement.innerText='💕';">`;
                    d.style.transform = `rotateY(${i*step}deg) translateZ(${rad}px)`;
                    d.onclick = () => openModal(i);
                    r.appendChild(d);
                });
            }

            function openModal(i) {
                const d = cData[i];
                const imgContainer = document.getElementById('mImg');
                imgContainer.innerHTML =
                    `<img src="${d.img}" alt="" onerror="this.style.display='none';this.parentElement.innerText='💕';">`;
                const textContainer = document.getElementById('mText');
                textContainer.innerHTML = '';
                document.getElementById('modal').classList.add('active');

                let c = 0;
                if (window.mIv) clearInterval(window.mIv);
                window.mIv = setInterval(() => {
                    if (!document.getElementById('modal').classList.contains('active')) {
                        clearInterval(window.mIv);
                        return;
                    }
                    if (c < d.txt.length) {
                        textContainer.innerHTML = d.txt.substring(0, c + 1) + '<span class="cursor"></span>';
                        c++;
                    } else {
                        clearInterval(window.mIv);
                        textContainer.innerHTML = d.txt;
                    }
                }, 38);
                anim.addInterval(window.mIv);
            }

            function closeModal(e) {
                if (e.target === e.currentTarget) {
                    document.getElementById('modal').classList.remove('active');
                    if (window.mIv) clearInterval(window.mIv);
                }
            }

            function closeModalDirect() {
                document.getElementById('modal').classList.remove('active');
                if (window.mIv) clearInterval(window.mIv);
            }

            // ─── GARDEN ──────────────────────────────────────────────────
            // 🔹 KEY FIX: Flowers bloom fully before images appear.
            let gCtx, gW, gH, gAnim, gTime = 0,
                gFlowers = [],
                gPetals = [];
            let gardenBloomCompleted = false;
            let gardenBloomCheckId = null;
            let gardenImagesShown = false;

            function initGarden() {
                const c = document.getElementById('gardenCanvas');
                gW = c.width = window.innerWidth;
                gH = c.height = window.innerHeight;
                gCtx = c.getContext('2d');
                gFlowers = [];
                gPetals = [];
                gTime = 0;
                gardenBloomCompleted = false;
                gardenImagesShown = false;

                const cols = ['#ff6b9d', '#e91e63', '#ffd700', '#ff8a80', '#ffc1e3', '#ff8a65', '#f48fb1', '#ce93d8'];
                const cx = gW / 2,
                    cy = gH * 0.85;
                const branchPoints = [];

                function addBranches(x, y, len, ang, dep) {
                    if (dep > 5) return;
                    const r = ang * Math.PI / 180,
                        x2 = x + len * Math.cos(r),
                        y2 = y + len * Math.sin(r);
                    for (let i = 1; i <= 3; i++) {
                        const t = i / 4;
                        branchPoints.push({ x: x + (x2 - x) * t, y: y + (y2 - y) * t, dep: dep });
                    }
                    addBranches(x2, y2, len * 0.7, ang - 25, dep + 1);
                    addBranches(x2, y2, len * 0.7, ang + 25, dep + 1);
                }
                const startLen = Math.min(gW, gH) * 0.22;
                addBranches(cx, cy, startLen, -90, 0);
                branchPoints.forEach((p, i) => {
                    if (Math.random() > 0.4) return;
                    gFlowers.push({
                        x: p.x,
                        y: p.y,
                        baseX: p.x,
                        baseY: p.y,
                        size: 0,
                        maxSize: 4 + Math.random() * 10,
                        col: cols[Math.floor(Math.random() * cols.length)],
                        bloomSpd: 0.05 + Math.random() * 0.08,
                        open: 0,
                        sway: Math.random() * Math.PI * 2,
                        delay: i * 2
                    });
                });
                for (let i = 0; i < 20; i++) {
                    gPetals.push({
                        x: Math.random() * gW,
                        y: Math.random() * gH,
                        size: 2 + Math.random() * 4,
                        col: cols[Math.floor(Math.random() * cols.length)],
                        spd: 0.5 + Math.random() * 1.5,
                        sway: Math.random() * Math.PI * 2,
                        rot: Math.random() * Math.PI * 2
                    });
                }

                // Reset UI: hide images, show "blooming" status
                const thumbs = document.querySelectorAll('.garden-img');
                thumbs.forEach(el => {
                    el.classList.remove('show', 'active-thumb', 'done-thumb');
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(-60px) scale(0.6) rotate(-8deg)';
                    el.style.pointerEvents = 'none';
                });
                document.querySelectorAll('.garden-progress .dot').forEach(d => {
                    d.classList.remove('active', 'done');
                });
                document.getElementById('gardenCounter').textContent = '0/9';
                document.getElementById('gardenContinueBtn').classList.remove('show');

                // Show blooming status text
                const status = document.getElementById('gardenBloomStatus');
                status.classList.remove('done');
                status.classList.add('show');
                status.textContent = '🌸 Flowers are blooming... 🌸';

                if (gAnim) cancelAnimationFrame(gAnim);
                drawGarden();
            }

            function drawGarden() {
                gCtx.fillStyle = 'rgba(26,5,18,0.08)';
                gCtx.fillRect(0, 0, gW, gH);
                gTime++;
                const cx = gW / 2,
                    cy = gH * 0.85;

                function drawBranches(x, y, len, ang, dep) {
                    if (dep > 5) return;
                    const r = ang * Math.PI / 180,
                        x2 = x + len * Math.cos(r),
                        y2 = y + len * Math.sin(r);
                    gCtx.beginPath();
                    gCtx.strokeStyle = `hsl(25,${40+dep*8}%,${20+dep*4}%)`;
                    gCtx.lineWidth = Math.max(1, 8 - dep * 1.2);
                    gCtx.lineCap = 'round';
                    gCtx.moveTo(x, y);
                    gCtx.lineTo(x2, y2);
                    gCtx.stroke();
                    if (dep > 1) {
                        gCtx.fillStyle = 'rgba(100,200,100,0.3)';
                        for (let s = -1; s <= 1; s += 2) {
                            const lx = x2 + Math.cos(r + 1.2 * s) * len * 0.15;
                            const ly = y2 + Math.sin(r + 1.2 * s) * len * 0.15;
                            gCtx.beginPath();
                            gCtx.ellipse(lx, ly, 4, 2, r + 0.5 * s, 0, Math.PI * 2);
                            gCtx.fill();
                        }
                    }
                    drawBranches(x2, y2, len * 0.7, ang - 25 + gTime * 0.02 * Math.sin(gTime * 0.01 + dep), dep + 1);
                    drawBranches(x2, y2, len * 0.7, ang + 25 + gTime * 0.02 * Math.cos(gTime * 0.01 + dep), dep + 1);
                }
                const startLen = Math.min(gW, gH) * 0.22;
                drawBranches(cx, cy, startLen, -90, 0);

                // Draw flowers and track bloom progress
                let allBloomed = true;
                let anyStarted = false;
                gFlowers.forEach(f => {
                    if (gTime < f.delay) {
                        // Not started yet
                        allBloomed = false;
                        return;
                    }
                    anyStarted = true;
                    if (f.open < 1) {
                        f.open += f.bloomSpd;
                        if (f.open > 1) f.open = 1;
                    }
                    if (f.open < 1) allBloomed = false;

                    const sway = Math.sin(gTime * 0.03 + f.sway) * 3;
                    const fx = f.baseX + sway,
                        fy = f.baseY + Math.abs(sway) * 0.5;
                    const s = f.size = f.maxSize * f.open;
                    gCtx.globalAlpha = 0.8;
                    for (let p = 0; p < 5; p++) {
                        const ang = (Math.PI * 2 / 5) * p - Math.PI / 2 + gTime * 0.01;
                        const px = fx + Math.cos(ang) * s;
                        const py = fy + Math.sin(ang) * s;
                        gCtx.beginPath();
                        gCtx.fillStyle = f.col;
                        gCtx.arc(px, py, s * 0.6, 0, Math.PI * 2);
                        gCtx.fill();
                    }
                    gCtx.beginPath();
                    gCtx.fillStyle = '#ffd700';
                    gCtx.arc(fx, fy, s * 0.35, 0, Math.PI * 2);
                    gCtx.fill();
                });
                gCtx.globalAlpha = 1;

                gPetals.forEach(p => {
                    p.y += p.spd;
                    p.x += Math.sin(gTime * 0.02 + p.sway) * 0.5;
                    p.rot += 0.02;
                    if (p.y > gH) { p.y = -10;
                        p.x = Math.random() * gW; }
                    gCtx.save();
                    gCtx.translate(p.x, p.y);
                    gCtx.rotate(p.rot);
                    gCtx.fillStyle = p.col;
                    gCtx.globalAlpha = 0.6;
                    gCtx.beginPath();
                    gCtx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
                    gCtx.fill();
                    gCtx.restore();
                });
                gCtx.globalAlpha = 1;

                // ─── BLOOM COMPLETION CHECK ──────────────────────────
                if (!gardenBloomCompleted && gFlowers.length > 0) {
                    // Check if ALL flowers have open >= 1
                    let complete = true;
                    for (let i = 0; i < gFlowers.length; i++) {
                        if (gFlowers[i].open < 1) {
                            complete = false;
                            break;
                        }
                    }
                    if (complete) {
                        gardenBloomCompleted = true;
                        // Update status text
                        const status = document.getElementById('gardenBloomStatus');
                        status.textContent = '🌷 Our garden is in full bloom! 🌷';
                        setTimeout(() => {
                            status.classList.add('done');
                        }, 1200);

                        // Wait a moment then show images
                        const bloomTimer = setTimeout(() => {
                            if (cur === 7 && !gardenImagesShown) {
                                gardenImagesShown = true;
                                startGardenAutoSlide();
                            }
                        }, 800);
                        anim.addTimeout(bloomTimer);
                    }
                }

                gAnim = requestAnimationFrame(drawGarden);
                anim.addFrame(gAnim);
            }

            // ─── GARDEN AUTO-SLIDE ──────────────────────────────────────
            const gardenSlideData = [
                { img: 'image/HMK07296.jpg', txt: 'গোলাপের ক্ষেতেও আপনি সবচেয়ে সুন্দর ফুল... 🌹' },
                { img: 'image/HMK07332.jpg', txt: 'আপনার সাথে প্রতিটি মুহূর্ত আমার আত্মার জন্য পিকনিকের মতো... 🧺' },
                { img: 'image/HMK07371.jpg', txt: 'চেরি ব্লসমের নিচে আমাদের ভালোবাসা চিরকাল ফোটে... 🌸' },
                { img: 'image/HMK0.jpg', txt: 'হাত ধরে হাঁটি, আপনার সাথে প্রতিটি পথ ঘরের মতো লাগে… 🏡' },
                { img: 'image/HMK01.jpg', txt: 'আপনার বাহুতে আমি এই পৃথিবীর সবচেয়ে নিরাপদ জায়গা খুঁজে পেয়েছি... 🤗' },
                { img: 'image/HMK02.jpg', txt: 'সহজ মুহূর্তগুলোও জাদুকরী হয়ে ওঠে যখন আমি আপনার সাথে থাকি... ✨' },
                { img: 'image/HMK03.jpg', txt: 'তারা-ভরা রাতে, আমি আপনাকে চেয়েছিলাম — আর মহাবিশ্ব সাড়া দিয়েছে... 🌟' },
                { img: 'image/HMK04.jpg', txt: 'বৃষ্টিতে আপনার সাথে নাচ আমার প্রিয় বিশৃঙ্খলা... 🌧️' },
                { img: 'image/HMK05.jpg', txt: 'বালিতে আমাদের পায়ের ছাপ — ঢেউ যাকে কখনো মুছে ফেলতে পারে না... 🏖️' }
            ];

            let gardenSlideTimer = null;
            let gardenSlideInterval = null;
            let gardenSlideIdx = 0;
            let gardenSlideRunning = false;

            function startGardenAutoSlide() {
                if (gardenSlideRunning) return;
                gardenSlideRunning = true;
                gardenSlideIdx = 0;

                const thumbs = document.querySelectorAll('.garden-img');
                thumbs.forEach((el, i) => {
                    el.classList.remove('show', 'active-thumb', 'done-thumb');
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(-60px) scale(0.6) rotate(-8deg)';
                    el.style.pointerEvents = 'none';
                    const delay = 100 + i * 140;
                    setTimeout(() => {
                        if (cur === 7) {
                            el.classList.add('show');
                            el.style.opacity = '1';
                            el.style.transform = 'translateY(0) scale(1) rotate(0deg)';
                            el.style.pointerEvents = 'auto';
                        }
                    }, delay);
                    anim.addTimeout(delay);
                });

                document.querySelectorAll('.garden-progress .dot').forEach(d => {
                    d.classList.remove('active', 'done');
                });
                document.getElementById('gardenCounter').textContent = '0/9';
                document.getElementById('gardenContinueBtn').classList.remove('show');

                document.getElementById('gardenSlideModal').classList.remove('active');

                const totalDropDelay = 100 + 8 * 140 + 400;
                gardenSlideTimer = setTimeout(() => {
                    if (cur === 7) {
                        showGardenSlide(0);
                    }
                }, totalDropDelay);
                anim.addTimeout(gardenSlideTimer);
            }

            function showGardenSlide(idx) {
                if (!gardenSlideRunning || cur !== 7) return;
                if (idx >= gardenSlideData.length) {
                    gardenSlideRunning = false;
                    document.getElementById('gardenContinueBtn').classList.add('show');
                    document.querySelectorAll('.garden-img').forEach(el => {
                        el.classList.add('done-thumb');
                        el.classList.remove('active-thumb');
                        el.style.pointerEvents = 'auto';
                        el.style.opacity = '1';
                    });
                    return;
                }

                gardenSlideIdx = idx;
                const d = gardenSlideData[idx];

                document.querySelectorAll('.garden-progress .dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === idx);
                    dot.classList.toggle('done', i < idx);
                });
                document.getElementById('gardenCounter').textContent = `${idx+1}/${gardenSlideData.length}`;

                document.querySelectorAll('.garden-img').forEach((el, i) => {
                    el.classList.toggle('active-thumb', i === idx);
                    el.classList.toggle('done-thumb', i < idx);
                });

                const modal = document.getElementById('gardenSlideModal');
                const imgContainer = document.getElementById('gardenSlideImg');
                imgContainer.innerHTML =
                    `<img src="${d.img}" alt="" onerror="this.style.display='none';this.parentElement.innerText='💕';">`;
                const textContainer = document.getElementById('gardenSlideText');
                textContainer.innerHTML = '';
                modal.classList.add('active');

                let charIdx = 0;
                const fullText = d.txt;
                textContainer.innerHTML = '<span class="cursor"></span>';

                if (gardenSlideInterval) clearInterval(gardenSlideInterval);
                gardenSlideInterval = setInterval(() => {
                    if (!modal.classList.contains('active')) {
                        clearInterval(gardenSlideInterval);
                        return;
                    }
                    if (charIdx < fullText.length) {
                        textContainer.innerHTML = fullText.substring(0, charIdx + 1) + '<span class="cursor"></span>';
                        charIdx++;
                    } else {
                        clearInterval(gardenSlideInterval);
                        textContainer.innerHTML = fullText;
                        const closeDelay = setTimeout(() => {
                            if (modal.classList.contains('active')) {
                                modal.classList.remove('active');
                                const nextDelay = setTimeout(() => {
                                    if (gardenSlideRunning && cur === 7) {
                                        showGardenSlide(idx + 1);
                                    }
                                }, 700);
                                anim.addTimeout(nextDelay);
                            }
                        }, 2000);
                        anim.addTimeout(closeDelay);
                    }
                }, 45);
                anim.addInterval(gardenSlideInterval);
            }

            function stopGardenAutoSlide() {
                gardenSlideRunning = false;
                if (gardenSlideTimer) { clearTimeout(gardenSlideTimer);
                    gardenSlideTimer = null; }
                if (gardenSlideInterval) { clearInterval(gardenSlideInterval);
                    gardenSlideInterval = null; }
                document.getElementById('gardenSlideModal').classList.remove('active');
            }

            // ─── GARDEN MANUAL MODAL ──────────────────────────────────
            const gardenManualData = [
                { img: 'image/HMK07296.jpg', txt: 'গোলাপের ক্ষেতেও আপনি সবচেয়ে সুন্দর ফুল...' },
                { img: 'image/HMK07332.jpg', txt: 'আপনার সাথে প্রতিটি মুহূর্ত আমার আত্মার জন্য পিকনিকের মতো...' },
                { img: 'image/HMK07371.jpg', txt: 'চেরি ব্লসমের নিচে আমাদের ভালোবাসা চিরকাল ফোটে...' },
                { img: 'image/HMK0.jpg', txt: 'হাত ধরে হাঁটি, আপনার সাথে প্রতিটি পথ ঘরের মতো লাগে…' },
                { img: 'image/HMK01.jpg', txt: 'আপনার বাহুতে আমি এই পৃথিবীর সবচেয়ে নিরাপদ জায়গা খুঁজে পেয়েছি।' },
                { img: 'image/HMK02.jpg', txt: 'সহজ মুহূর্তগুলোও জাদুকরী হয়ে ওঠে যখন আমি আপনার সাথে থাকি।' },
                { img: 'image/HMK03.jpg', txt: 'তারা-ভরা রাতে, আমি আপনাকে চেয়েছিলাম — আর মহাবিশ্ব সাড়া দিয়েছে।' },
                { img: 'image/HMK04.jpg', txt: 'বৃষ্টিতে আপনার সাথে নাচ আমার প্রিয় বিশৃঙ্খলা।' },
                { img: 'image/HMK05.jpg', txt: 'বালিতে আমাদের পায়ের ছাপ — ঢেউ যাকে কখনো মুছে ফেলতে পারে না।' }
            ];

            document.querySelectorAll('.garden-img').forEach((img, idx) => {
                img.addEventListener('click', function(e) {
                    e.stopPropagation();
                    // Only allow click if garden has bloomed and images are shown
                    if (!gardenBloomCompleted || !gardenImagesShown) return;
                    if (gardenSlideRunning) {
                        stopGardenAutoSlide();
                    }
                    openGardenManualModal(idx);
                });
            });

            function openGardenManualModal(idx) {
                const d = gardenManualData[idx];
                const imgContainer = document.getElementById('gardenModalImg');
                imgContainer.innerHTML =
                    `<img src="${d.img}" alt="" onerror="this.style.display='none';this.parentElement.innerText='💕';">`;
                const textContainer = document.getElementById('gardenModalText');
                textContainer.innerHTML = '';
                document.getElementById('gardenModal').classList.add('active');

                let c = 0;
                if (window.gardenIv) clearInterval(window.gardenIv);
                window.gardenIv = setInterval(() => {
                    if (!document.getElementById('gardenModal').classList.contains('active')) {
                        clearInterval(window.gardenIv);
                        return;
                    }
                    if (c < d.txt.length) {
                        textContainer.innerHTML = d.txt.substring(0, c + 1) + '<span class="cursor"></span>';
                        c++;
                    } else {
                        clearInterval(window.gardenIv);
                        textContainer.innerHTML = d.txt;
                    }
                }, 38);
                anim.addInterval(window.gardenIv);
            }

            function closeGardenModal(e) {
                if (e.target === e.currentTarget) {
                    document.getElementById('gardenModal').classList.remove('active');
                    if (window.gardenIv) clearInterval(window.gardenIv);
                    if (cur === 7 && !gardenSlideRunning && gardenBloomCompleted && gardenImagesShown) {
                        startGardenAutoSlide();
                    }
                }
            }

            function closeGardenModalDirect() {
                document.getElementById('gardenModal').classList.remove('active');
                if (window.gardenIv) clearInterval(window.gardenIv);
                if (cur === 7 && !gardenSlideRunning && gardenBloomCompleted && gardenImagesShown) {
                    startGardenAutoSlide();
                }
            }

            // ─── LOVE RAIN ─────────────────────────────────────────────
            let loveIv, loveCnt = 0;
            let rainImgInterval = null;
            const loveEmojis = ['💕', '💖', '❤️', '💗', '💓', '💝', '♥️', '💘', '💟'];
            const rainImgData = [
                { src: 'image/HMK07296.jpg' },
                { src: 'image/HMK07332.jpg' },
                { src: 'image/HMK07371.jpg' },
                { src: 'image/HMK0.jpg' },
                { src: 'image/HMK01.jpg' }
            ];

            function initLoveRain() {
                const b = document.getElementById('loveBox');
                b.innerHTML = '';
                const ib = document.getElementById('rainImgBox');
                ib.innerHTML = '';
                loveCnt = 0;
                document.getElementById('loveCount').innerText = 'Love drops: 0';
                document.getElementById('loveBtn').innerText = 'Collect the Love & Continue 💖';
                document.getElementById('loveBtn').style.pointerEvents = 'auto';
                document.getElementById('loveBtn').style.opacity = '1';

                if (loveIv) cancelAnimationFrame(loveIv);
                let lastSpawn = 0;
                const spawnRate = isMobile ? 400 : 320;

                function spawnLove(timestamp) {
                    if (cur !== 8) return;
                    if (timestamp - lastSpawn > spawnRate) {
                        makeLoveDrop(b);
                        lastSpawn = timestamp;
                    }
                    if (cur === 8) {
                        loveIv = requestAnimationFrame(spawnLove);
                        anim.addFrame(loveIv);
                    }
                }
                loveIv = requestAnimationFrame(spawnLove);
                anim.addFrame(loveIv);
                startImageRainSmooth(ib);
            }

            function startImageRainSmooth(container) {
                if (rainImgInterval) clearInterval(rainImgInterval);

                function spawnImage() {
                    if (cur !== 8) return;
                    const idx = Math.floor(Math.random() * rainImgData.length);
                    const d = rainImgData[idx];
                    const el = document.createElement('div');
                    el.className = 'rain-img';
                    el.innerHTML = `<img src="${d.src}" alt="" onerror="this.style.display='none';this.parentElement.innerText='💕';">`;
                    el.style.left = (5 + Math.random() * 90) + '%';
                    const dur = 4.5 + Math.random() * 2.5;
                    el.style.animationDuration = dur + 's';
                    el.style.animationDelay = Math.random() * 0.3 + 's';
                    const sz = 65 + Math.random() * 45;
                    el.style.width = clamp(sz, 65, 110) + 'px';
                    el.style.height = clamp(sz, 65, 110) + 'px';
                    container.appendChild(el);
                    const rmTimer = setTimeout(() => { if (el.parentNode) el.remove(); }, (dur + 1) * 1000);
                    anim.addTimeout(rmTimer);
                    if (container.children.length > 10) {
                        const first = container.firstChild;
                        if (first) first.remove();
                    }
                }

                for (let i = 0; i < 5; i++) {
                    const st = setTimeout(() => { if (cur === 8) spawnImage(); }, i * 300 + 200);
                    anim.addTimeout(st);
                }

                rainImgInterval = setInterval(() => {
                    if (cur === 8) spawnImage();
                }, isMobile ? 1600 : 1400);
                anim.addInterval(rainImgInterval);
            }

            function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

            function makeLoveDrop(box) {
                if (cur !== 8) return;
                const r = document.createElement('div');
                r.className = 'love-drop';
                r.innerHTML = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];
                r.style.left = Math.random() * 100 + '%';
                const sc = 0.7 + Math.random() * 0.7;
                r.style.fontSize = `calc(${sc} * clamp(1.4rem,4.5vw,2.6rem))`;
                const dur = 3.5 + Math.random() * 3;
                r.style.animationDuration = dur + 's';
                r.style.animationDelay = Math.random() * 0.3 + 's';
                box.appendChild(r);
                loveCnt++;
                document.getElementById('loveCount').innerText = 'Love drops: ' + loveCnt;
                const rmTimer = setTimeout(() => { if (r.parentNode) r.remove(); }, (dur + 1) * 1000);
                anim.addTimeout(rmTimer);
                if (box.children.length > (isMobile ? 20 : 30)) {
                    const first = box.firstChild;
                    if (first) first.remove();
                }
            }

            // ─── LOVE FORMATION ────────────────────────────────────────
            let frAnimId = null;
            let frParticles = [];
            let frTargets = [];
            let frProgress = 0;
            let frComplete = false;
            let formationStarted = false;
            let countdownTimer = null;

            function startLoveFormation() {
                if (formationStarted) return;
                formationStarted = true;

                const btn = document.getElementById('loveBtn');
                btn.innerText = '✨ Forming our love... ✨';
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.5';

                if (loveIv) { cancelAnimationFrame(loveIv);
                    loveIv = null; }
                if (rainImgInterval) { clearInterval(rainImgInterval);
                    rainImgInterval = null; }

                const box = document.getElementById('loveBox');
                const ibox = document.getElementById('rainImgBox');

                box.querySelectorAll('.love-drop').forEach((r) => {
                    const style = window.getComputedStyle(r);
                    const matrix = new DOMMatrix(style.transform);
                    const cy = matrix.m42 || 0;
                    r.style.setProperty('--cy', cy + 'px');
                    r.classList.add('clearing');
                });

                ibox.querySelectorAll('.rain-img').forEach((el) => {
                    const style = window.getComputedStyle(el);
                    const matrix = new DOMMatrix(style.transform);
                    const cy = matrix.m42 || 0;
                    el.style.setProperty('--cy', cy + 'px');
                    el.classList.add('clearing');
                });

                const loveContent = document.querySelector('#p8 > div[style*="z-index:10"]');
                if (loveContent) {
                    loveContent.style.transition = 'opacity 0.6s ease';
                    loveContent.style.opacity = '0';
                }

                const clearTimer = setTimeout(() => {
                    box.innerHTML = '';
                    ibox.innerHTML = '';

                    const canvas = document.getElementById('frCanvas');
                    canvas.style.display = 'block';
                    canvas.style.opacity = '1';
                    canvas.classList.add('active');
                    canvas.style.zIndex = '50';

                    const ctx = canvas.getContext('2d');
                    const W = canvas.width = window.innerWidth;
                    const H = canvas.height = window.innerHeight;

                    ctx.fillStyle = '#1a0512';
                    ctx.fillRect(0, 0, W, H);

                    const heartPoints = [];
                    const scale = Math.min(W, H) * 0.022;
                    const cx = W / 2,
                        cy = H / 2 - 20;
                    for (let t = 0; t < Math.PI * 2; t += 0.06) {
                        const x = 16 * Math.pow(Math.sin(t), 3);
                        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                        heartPoints.push({ x: cx + x * scale, y: cy + y * scale });
                    }

                    const numP = isMobile ? 180 : 280;
                    frTargets = [];
                    for (let i = 0; i < numP; i++) {
                        const pt = heartPoints[Math.floor(Math.random() * heartPoints.length)];
                        frTargets.push({
                            x: pt.x + (Math.random() - 0.5) * 6,
                            y: pt.y + (Math.random() - 0.5) * 6
                        });
                    }

                    frParticles = [];
                    const emojis = ['💕', '💖', '❤️', '💗', '💓', '💝', '♥️', '🌸', '✨'];
                    for (let i = 0; i < frTargets.length; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = Math.max(W, H) * (0.5 + Math.random() * 0.5);
                        const startX = W / 2 + Math.cos(angle) * radius;
                        const startY = H / 2 + Math.sin(angle) * radius;
                        frParticles.push({
                            x: startX,
                            y: startY,
                            targetX: frTargets[i].x,
                            targetY: frTargets[i].y,
                            emoji: emojis[Math.floor(Math.random() * emojis.length)],
                            size: 16 + Math.random() * 22,
                            speed: 0.014 + Math.random() * 0.018,
                            phase: Math.random() * Math.PI * 2,
                            trail: []
                        });
                    }

                    frProgress = 0;
                    frComplete = false;
                    let textFade = 0;

                    function animateFR() {
                        if (frProgress < 1) {
                            frProgress += 0.11;
                            if (frProgress > 1) frProgress = 1;
                        }

                        ctx.clearRect(0, 0, W, H);
                        ctx.fillStyle = '#1a0512';
                        ctx.fillRect(0, 0, W, H);

                        const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.5);
                        grad.addColorStop(0, 'rgba(255,107,157,0.08)');
                        grad.addColorStop(1, 'rgba(255,107,157,0)');
                        ctx.fillStyle = grad;
                        ctx.fillRect(0, 0, W, H);

                        frParticles.forEach((p) => {
                            const ease = 1 - Math.pow(1 - frProgress, 3);
                            const cx = p.x + (p.targetX - p.x) * ease;
                            const cy = p.y + (p.targetY - p.y) * ease;

                            p.trail.push({ x: cx, y: cy });
                            if (p.trail.length > 8) p.trail.shift();
                            for (let t = 0; t < p.trail.length - 1; t++) {
                                const alpha = (t / p.trail.length) * 0.3;
                                ctx.globalAlpha = alpha;
                                ctx.font = (p.size * 0.45) + 'px sans-serif';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(p.emoji, p.trail[t].x, p.trail[t].y);
                            }
                            ctx.globalAlpha = Math.min(1, frProgress * 1.6);
                            ctx.font = p.size + 'px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(p.emoji, cx, cy);
                        });

                        ctx.globalAlpha = 1;

                        if (frProgress > 0.55) {
                            textFade = Math.min(1, (frProgress - 0.55) * 6);
                            ctx.globalAlpha = textFade;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.shadowColor = 'rgba(255,215,0,0.8)';
                            ctx.shadowBlur = 60;
                            ctx.font = `clamp(3.5rem, 12vw, 7rem) 'Great Vibes', cursive`;
                            ctx.fillStyle = '#ffd700';
                            ctx.fillText('F + R', W / 2, H / 2 - 10);
                            ctx.shadowBlur = 0;

                            ctx.font = `clamp(0.8rem, 2.5vw, 1.2rem) 'Quicksand', sans-serif`;
                            ctx.fillStyle = 'rgba(255,255,255,0.5)';
                            ctx.shadowBlur = 20;
                            ctx.shadowColor = 'rgba(255,107,157,0.3)';
                            ctx.fillText('Our love in every drop', W / 2, H / 2 + 70);
                            ctx.shadowBlur = 0;
                            ctx.globalAlpha = 1;
                        }

                        if (frProgress < 1) {
                            frAnimId = requestAnimationFrame(animateFR);
                            anim.addFrame(frAnimId);
                        } else {
                            if (!frComplete) {
                                frComplete = true;
                                startCountdown(canvas, loveContent);
                            }
                        }
                    }

                    if (frAnimId) cancelAnimationFrame(frAnimId);
                    animateFR();

                }, 600);
                anim.addTimeout(clearTimer);
            }

            // ─── COUNTDOWN + ENDING ────────────────────────────────────
            function startCountdown(canvas, loveContent) {
                canvas.style.transition = 'opacity 0.6s ease';
                canvas.style.opacity = '0';

                const overlay = document.getElementById('countdownOverlay');
                overlay.style.display = 'flex';
                overlay.classList.add('active');

                let count = 5;
                const numEl = document.getElementById('countdownNumber');
                numEl.textContent = count;

                if (countdownTimer) clearInterval(countdownTimer);
                countdownTimer = setInterval(() => {
                    count--;
                    if (count <= 0) {
                        clearInterval(countdownTimer);
                        countdownTimer = null;
                        overlay.classList.remove('active');
                        overlay.style.display = 'none';
                        overlay.style.opacity = '0';
                        if (loveContent) loveContent.style.opacity = '0';
                        goToPage9();
                    } else {
                        numEl.textContent = count;
                    }
                }, 1000);
                anim.addInterval(countdownTimer);
            }

            // ─── FINAL — English Love Letter ──────────────────────────
            function initFinal() {
                const container = document.getElementById('finalMsg');
                if (!container) return;
                if (container.children.length > 0) return;

                const letterLines = [
                    "আমার প্রিয়তমা,",
                    "যে মুহূর্তে আমাদের চোখ দেখা হলো, আমি বুঝতে পারলাম আমার পৃথিবী চিরকাল বদলে গেছে।",
                    "আপনার হাসি আমার অন্ধকার দিনগুলোকে আলোকিত করে, আর আপনার ভালোবাসা আমাকে এমন শক্তি দেয় যা আমি কখনো জানতাম না।",
                    "আপনার সাথে কাটানো প্রতিটি মুহূর্ত আমার হৃদয়ের এক অমূল্য সম্পদ।",
                    "আপনার চোখে আমি আমার স্বপ্ন দেখি, আপনার হাসিতে আমি আমার সুখ খুঁজে পাই।",
                    "আপনি যখন কাছে থাকেন, সময় থেমে যায়, আর পুরো বিশ্বটা শুধু আমাদের হয়ে যায়।",
                    "আমি জানি, জীবন সহজ নয়, কিন্তু আপনার সাথে প্রতিটি বাধা আমার কাছে একটি সুযোগ হয়ে দাঁড়ায়।",
                    "আমি আপনাকে ভালোবাসি, কেবল আজকের জন্য নয়, প্রতিটি আগামী দিনের জন্যও।",
                    "আমি প্রতিশ্রুতি দিচ্ছি, আমি আপনার পাশে থাকব, ভালো সময়ে আর মন্দ সময়ে, সুখে আর দুঃখে।",
                    "আপনি আমার সবচেয়ে সুন্দর গল্প, আর আমি চাই এই গল্পটি কখনো শেষ না হোক।",
                    "চিরকাল আপনারই,",
                    "❤️ আপনার ভালোবাসা ❤️"
                ];

                container.innerHTML = '';

                letterLines.forEach((line, i) => {
                    const p = document.createElement('p');
                    p.textContent = line;
                    container.appendChild(p);
                    const showTimer = setTimeout(() => p.classList.add('show'), 300 + i * 700);
                    anim.addTimeout(showTimer);
                });

                const sigTimer = setTimeout(() => {
                    const sigP = document.createElement('p');
                    sigP.textContent = '❤️ Your Love ❤️';
                    sigP.style.color = 'var(--rose)';
                    sigP.style.textAlign = 'center';
                    sigP.style.fontSize = 'clamp(1.2rem, 4vw, 1.6rem)';
                    container.appendChild(sigP);
                    setTimeout(() => sigP.classList.add('show'), 100);
                }, 300 + letterLines.length * 700 + 300);
                anim.addTimeout(sigTimer);

                const totalDelay = 300 + letterLines.length * 700 + 1200;
                const endTimer = setTimeout(() => {
                    const endP = document.createElement('p');
                    endP.className = 'ending-message';
                    endP.textContent = '💖 No end our journey 💖';
                    container.appendChild(endP);
                    setTimeout(() => endP.classList.add('show'), 150);
                }, totalDelay);
                anim.addTimeout(endTimer);
            }

            // ─── CLEANUP ──────────────────────────────────────────────────
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    cleanupPage();
                }
            });

            window.addEventListener('beforeunload', () => {
                cleanupPage();
            });

            // ─── INIT FLOWER CANVAS ──────────────────────────────────────
            initFlowerCanvas();
            window.addEventListener('resize', () => {
                if (flowerAnimId) cancelAnimationFrame(flowerAnimId);
                initFlowerCanvas();
                if (cur === 4) {
                    if (treeFlowerAnimId) cancelAnimationFrame(treeFlowerAnimId);
                    initTreeFlowerCanvas();
                }
            });

            console.log('💕 Love garden: flowers bloom fully BEFORE images appear!');

            // Expose functions to global scope for inline onclick handlers
            window.goTo = goTo;
            window.goToPage9 = goToPage9;
            window.toggleMusic = toggleMusic;
            window.toggleSongMenu = toggleSongMenu;
            window.changeSong = changeSong;
            window.openTreeModal = openTreeModal;
            window.closeTreeModal = closeTreeModal;
            window.closeTreeModalDirect = closeTreeModalDirect;
            window.openModal = openModal;
            window.closeModal = closeModal;
            window.closeModalDirect = closeModalDirect;
            window.closeGardenModal = closeGardenModal;
            window.closeGardenModalDirect = closeGardenModalDirect;
            window.startLoveFormation = startLoveFormation;

        })();