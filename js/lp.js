/* ============================
   FX SPACE LP — Animations
   ============================ */
(function () {
    'use strict';

    // ── Marquee speed ──
    function setMarqueeSpeed() {
        document.querySelectorAll('.logo-marquee-track').forEach(function (t) {
            t.style.animationDuration = (t.scrollWidth / 2 / 60) + 's';
        });
    }
    setMarqueeSpeed();
    window.addEventListener('resize', setMarqueeSpeed);

    // ── Hero SVG chart ──
    (function () {
        var g = document.getElementById('hero-chart-candles');
        if (!g) return;
        var N = 60, W = 1200, H = 600, bw = W / N;
        var p = 300 + Math.random() * 100;
        for (var i = 0; i < N; i++) {
            p += (Math.random() - 0.48) * 18;
            p = Math.max(80, Math.min(520, p));
            var o = p, c = o + (Math.random() - 0.5) * 40;
            var hi = Math.max(o, c) + Math.random() * 20;
            var lo = Math.min(o, c) - Math.random() * 20;
            var col = c >= o ? 'rgba(46,204,113,0.6)' : 'rgba(231,76,60,0.6)';
            var x = i * bw + bw * 0.2, w = bw * 0.6;
            var wick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            wick.setAttribute('x1', x + w / 2); wick.setAttribute('x2', x + w / 2);
            wick.setAttribute('y1', H - hi); wick.setAttribute('y2', H - lo);
            wick.setAttribute('stroke', col); wick.setAttribute('stroke-width', '1.5');
            g.appendChild(wick);
            var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            r.setAttribute('x', x); r.setAttribute('y', H - Math.max(o, c));
            r.setAttribute('width', w); r.setAttribute('height', Math.max(Math.abs(c - o), 2));
            r.setAttribute('fill', col); r.setAttribute('rx', '1.5');
            g.appendChild(r);
        }
    })();

    // ── Counter ──
    function countUp(el, target, ms, dec) {
        var t0 = null, d = dec || 0;
        (function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / ms, 1);
            var v = target * (1 - Math.pow(1 - p, 3));
            el.textContent = d ? v.toFixed(d) : Math.round(v).toLocaleString();
            if (p < 1) requestAnimationFrame(step);
        })(performance.now());
    }

    // ── GSAP ──
    gsap.registerPlugin(ScrollTrigger);

    // Hero
    gsap.from('.hero-inner', { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out', delay: 0.1 });
    // Achievements: reveal + countUp
    (function() {
        var nums = document.querySelector('.achv-nums');
        if (!nums) return;
        var counted = false;
        ScrollTrigger.create({
            trigger: nums,
            start: 'top 80%',
            onEnter: function() {
                nums.classList.add('is-visible');
                if (counted) return;
                counted = true;
                document.querySelectorAll('.achv-count').forEach(function(el) {
                    var target = parseFloat(el.getAttribute('data-target'));
                    var dec = parseInt(el.getAttribute('data-dec')) || 0;
                    countUp(el, target, 1600, dec);
                });
            }
        });
    })();

    // Features
    gsap.utils.toArray('.feature-card').forEach(function (c, i) {
        gsap.to(c, {
            scrollTrigger: { trigger: c, start: 'top 88%', once: true },
            opacity: 1, y: 0, duration: 0.7, delay: i * 0.12, ease: 'power3.out'
        });
    });

    // Community chat (only in community section, not preview)
    gsap.from('.community-section .community-chat', {
        scrollTrigger: { trigger: '.community-section', start: 'top 78%', once: true },
        opacity: 0, y: 40, duration: 0.8, ease: 'power3.out'
    });

    // Founder
    gsap.from('.founder-card', {
        scrollTrigger: { trigger: '.founder-section', start: 'top 80%', once: true },
        opacity: 0, y: 40, duration: 0.8, ease: 'power3.out'
    });

    // Plan carousel reveal
    gsap.from('.plan-carousel', {
        scrollTrigger: { trigger: '.plan-carousel', start: 'top 85%', once: true },
        opacity: 0, y: 30, duration: 0.7, ease: 'power3.out'
    });

    // CTA
    gsap.from('.cta-section .heading-xl', {
        scrollTrigger: { trigger: '.cta-section', start: 'top 85%', once: true },
        opacity: 0, y: 30, duration: 0.7, ease: 'power3.out'
    });

    // ── Community carousel ──
    (function () {
        var track = document.getElementById('cc-track');
        var prevBtn = document.getElementById('cc-prev');
        var nextBtn = document.getElementById('cc-next');
        var wrap = document.getElementById('community-carousel');
        if (!track || !wrap) return;

        var slidesNL = track.querySelectorAll('.community-carousel-slide');
        var slidesArr = [];
        for (var s = 0; s < slidesNL.length; s++) slidesArr.push(slidesNL[s]);
        var current = 0, total = slidesArr.length;
        var dots = wrap.querySelectorAll('.community-carousel-dot');

        // トラックの高さを最大スライドに合わせる
        function setTrackHeight() {
            var maxH = 0;
            for (var i = 0; i < slidesArr.length; i++) {
                slidesArr[i].style.position = 'relative';
                var h = slidesArr[i].offsetHeight;
                if (h > maxH) maxH = h;
                slidesArr[i].style.position = '';
            }
            track.style.height = maxH + 'px';
        }
        setTrackHeight();
        window.addEventListener('resize', setTrackHeight);

        function goTo(idx) {
            idx = ((idx % total) + total) % total;
            current = idx;
            var prev = (current - 1 + total) % total;
            var next = (current + 1) % total;
            for (var i = 0; i < slidesArr.length; i++) {
                slidesArr[i].classList.remove('is-active', 'is-prev', 'is-next');
                if (i === current) slidesArr[i].classList.add('is-active');
                else if (i === prev) slidesArr[i].classList.add('is-prev');
                else if (i === next) slidesArr[i].classList.add('is-next');
            }
            for (var j = 0; j < dots.length; j++) {
                dots[j].classList.toggle('active', j === current);
            }
        }

        goTo(0);

        prevBtn.addEventListener('click', function () { goTo(current - 1); });
        nextBtn.addEventListener('click', function () { goTo(current + 1); });
        for (var i = 0; i < dots.length; i++) {
            dots[i].addEventListener('click', function () {
                goTo(parseInt(this.getAttribute('data-index')));
            });
        }

        // スワイプ対応
        var startX = 0, diffX = 0;
        track.addEventListener('touchstart', function (e) {
            startX = e.touches[0].clientX; diffX = 0;
        }, { passive: true });
        track.addEventListener('touchmove', function (e) {
            diffX = e.touches[0].clientX - startX;
        }, { passive: true });
        track.addEventListener('touchend', function () {
            if (diffX > 50) goTo(current - 1);
            else if (diffX < -50) goTo(current + 1);
        });
    })();

    // ── Role Model Carousel ──
    (function () {
        var carousel = document.getElementById('rm-carousel');
        if (!carousel) return;

        var slidesNL = carousel.querySelectorAll('.rm-carousel-slide');
        var slides = [];
        for (var s = 0; s < slidesNL.length; s++) slides.push(slidesNL[s]);
        var current = 0, total = slides.length;
        var dots = carousel.querySelectorAll('.rm-carousel-dot');
        var tabs = carousel.querySelectorAll('.rm-tab');
        var pill = carousel.querySelector('.rm-tabs-pill');
        var prevBtn = document.getElementById('rm-prev');
        var nextBtn = document.getElementById('rm-next');
        var animatedSlides = {};

        function movePill(idx) {
            if (!pill || !tabs[idx]) return;
            var tab = tabs[idx];
            var parent = tab.parentElement;
            pill.style.width = tab.offsetWidth + 'px';
            pill.style.transform = 'translateX(' + (tab.offsetLeft - parent.offsetLeft - 4) + 'px)';
        }
        // Initial position
        setTimeout(function () { movePill(0); }, 50);

        // Section header animation
        gsap.from('.rolemodel-inner .heading-lg', {
            scrollTrigger: { trigger: '.rolemodel-section', start: 'top 80%', once: true },
            opacity: 0, y: 30, duration: 0.7, ease: 'power3.out'
        });
        gsap.from('.rolemodel-lead', {
            scrollTrigger: { trigger: '.rolemodel-section', start: 'top 78%', once: true },
            opacity: 0, y: 20, duration: 0.6, delay: 0.15, ease: 'power3.out'
        });

        function animateSlide(slide, idx) {
            if (animatedSlides[idx]) return;
            animatedSlides[idx] = true;

            var chartLine = slide.querySelector('.rm-chart-line');
            if (chartLine) {
                var pathLength = chartLine.getTotalLength();
                chartLine.style.strokeDasharray = pathLength;
                chartLine.style.strokeDashoffset = pathLength;
                gsap.to(chartLine, { strokeDashoffset: 0, duration: 2.5, ease: 'power2.inOut' });
            }

            var joinLines = slide.querySelectorAll('.rm-join-line');
            var joinBgs = slide.querySelectorAll('.rm-join-bg');
            var joinTexts = slide.querySelectorAll('.rm-join-text');
            for (var j = 0; j < joinLines.length; j++) gsap.to(joinLines[j], { opacity: 1, duration: 0.5, delay: 1.0 });
            for (j = 0; j < joinBgs.length; j++) gsap.to(joinBgs[j], { opacity: 1, duration: 0.4, delay: 1.2 });
            for (j = 0; j < joinTexts.length; j++) gsap.to(joinTexts[j], { opacity: 1, duration: 0.4, delay: 1.2 });

            var dotsArr = slide.querySelectorAll('.rm-dot');
            for (j = 0; j < dotsArr.length; j++) {
                gsap.to(dotsArr[j], { opacity: 1, duration: 0.4, delay: 0.5 + j * 0.4, ease: 'back.out(2)' });
            }

            var labels = slide.querySelectorAll('.rm-dot-label');
            for (j = 0; j < labels.length; j++) {
                gsap.to(labels[j], { opacity: 1, duration: 0.5, delay: 0.8 + j * 0.4 });
            }
        }

        function goTo(idx) {
            idx = ((idx % total) + total) % total;
            current = idx;
            for (var i = 0; i < slides.length; i++) {
                slides[i].classList.toggle('is-active', i === current);
            }
            for (var j = 0; j < dots.length; j++) {
                dots[j].classList.toggle('active', j === current);
            }
            for (var t = 0; t < tabs.length; t++) {
                tabs[t].classList.toggle('active', t === current);
            }
            movePill(current);
            animateSlide(slides[current], current);
        }

        // First slide animation on scroll
        ScrollTrigger.create({
            trigger: '.rolemodel-section',
            start: 'top 75%',
            once: true,
            onEnter: function () { animateSlide(slides[0], 0); }
        });

        prevBtn.addEventListener('click', function () { goTo(current - 1); });
        nextBtn.addEventListener('click', function () { goTo(current + 1); });
        for (var i = 0; i < dots.length; i++) {
            dots[i].addEventListener('click', function () {
                goTo(parseInt(this.getAttribute('data-index')));
            });
        }
        for (var k = 0; k < tabs.length; k++) {
            tabs[k].addEventListener('click', function () {
                goTo(parseInt(this.getAttribute('data-index')));
            });
        }

        // (tilt removed — spotlight style)

        // Swipe support
        var startX = 0, diffX = 0;
        carousel.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; diffX = 0; }, { passive: true });
        carousel.addEventListener('touchmove', function (e) { diffX = e.touches[0].clientX - startX; }, { passive: true });
        carousel.addEventListener('touchend', function () {
            if (diffX > 50) goTo(current - 1);
            else if (diffX < -50) goTo(current + 1);
        });
    })();

    // ── Sticky bar ──
    var bar = document.getElementById('sticky-bar');
    var hero = document.getElementById('hero');
    if (bar && hero) {
        new IntersectionObserver(function (e) {
            bar.classList.toggle('visible', !e[0].isIntersecting);
        }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' }).observe(hero);
    }

    // ── Plan carousel (mobile only) ──
    (function () {
        var slides = document.querySelectorAll('.plan-carousel-slide');
        var track = document.querySelector('.plan-carousel-track');
        var prevBtn = document.getElementById('plan-carousel-prev');
        var nextBtn = document.getElementById('plan-carousel-next');
        if (!slides.length) return;

        var current = 1;
        var total = slides.length;
        var isAnimating = false;
        var carouselActive = false;

        function isMobile() { return window.innerWidth <= 768; }

        function updateArrows() {
            if (prevBtn) prevBtn.style.display = current <= 0 ? 'none' : '';
            if (nextBtn) nextBtn.style.display = current >= total - 1 ? 'none' : '';
        }

        function positionSlides() {
            var activeW = 280, inactiveW = 240, gap = 14, sideScale = 0.88;
            var prevIdx = current - 1;
            var nextIdx = current + 1;
            var sideOffset = activeW / 2 + gap + (inactiveW * sideScale) / 2;

            slides.forEach(function (s, i) {
                s.classList.toggle('is-active', i === current);
                if (i === current) {
                    s.style.transform = 'translate(-50%, -50%)';
                    s.style.opacity = '1';
                    s.style.zIndex = '2';
                    s.style.filter = 'none';
                } else if (i === prevIdx) {
                    s.style.transform = 'translate(calc(-50% - ' + sideOffset + 'px), -50%) scale(' + sideScale + ')';
                    s.style.opacity = '0.45';
                    s.style.zIndex = '1';
                    s.style.filter = 'blur(1.5px)';
                } else if (i === nextIdx) {
                    s.style.transform = 'translate(calc(-50% + ' + sideOffset + 'px), -50%) scale(' + sideScale + ')';
                    s.style.opacity = '0.45';
                    s.style.zIndex = '1';
                    s.style.filter = 'blur(1.5px)';
                } else {
                    s.style.transform = 'translate(-50%, -50%) scale(0.8)';
                    s.style.opacity = '0';
                    s.style.zIndex = '0';
                    s.style.filter = 'blur(4px)';
                }
            });
            updateArrows();
        }

        function clearStyles() {
            slides.forEach(function (s) {
                s.classList.remove('is-active');
                s.style.transform = '';
                s.style.opacity = '';
                s.style.zIndex = '';
                s.style.filter = '';
            });
        }

        function activate() {
            if (carouselActive) return;
            carouselActive = true;
            positionSlides();
        }

        function deactivate() {
            if (!carouselActive) return;
            carouselActive = false;
            clearStyles();
        }

        function goTo(idx) {
            if (!carouselActive || isAnimating || idx < 0 || idx >= total) return;
            isAnimating = true;
            current = idx;
            positionSlides();
            setTimeout(function () { isAnimating = false; }, 750);
        }

        if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

        slides.forEach(function (s, i) {
            s.addEventListener('click', function () { if (carouselActive && i !== current) goTo(i); });
        });

        function check() {
            if (isMobile()) activate();
            else deactivate();
        }

        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(check, 100);
        });

        check();
    })();

    // ── Tooltip tap (mobile) ──
    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('.tooltip-trigger');
        document.querySelectorAll('.tooltip-bubble.is-open').forEach(function (b) {
            b.classList.remove('is-open');
        });
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            var bubble = trigger.nextElementSibling;
            if (bubble && bubble.classList.contains('tooltip-bubble')) {
                bubble.classList.add('is-open');
            }
        }
    });

    // ── FAQ interactive chat ──
    (function () {
        var faqData = [
            { q: 'FX未経験でも大丈夫？', a: 'もちろん！メンバーの約半数が未経験スタートです。ゼロプロ90は完全初心者向けのカリキュラムだし、デモトレードから始めるので安心してください👍', reactions: '🙏 24 💪 18' },
            { q: 'Fintokeiって何？', a: 'プロップファームと呼ばれるもので、チャレンジプランを購入してデモ口座で利益目標を達成すると、利益の一部を報酬として受け取れる仕組みです。自分の資金を運用せずに稼げるのが魅力ですね🔥', reactions: '🔥 31' },
            { q: '必要な資金は？', a: 'フリープランは無料、スタンダードでも月2,900円です。まずは無料で雰囲気を見てみてください！', reactions: '😊 15' },
            { q: '仕事や学校と両立できる？', a: 'できます！むしろ会社員や学生の方も多いです。シナリオ動画は毎朝出すのでスキマ時間にチェックできるし、トレード自体も1日15〜30分あればOK。無理なく続けられますよ👌', reactions: '👍 22 ❤️ 9' },
            { q: '他との違いは？', a: '僕自身が毎日シナリオ動画を出して、質問にも直接答えてるところ。あとは独自ツールYTTと、420名以上のプロ輩出という結果ですね。口だけじゃなく数字で証明してます📊', reactions: '🔥 27 👏 14' },
            { q: '途中で解約できる？', a: 'もちろん！違約金も縛り期間もないので、気軽に始めてもらって大丈夫です🙆‍♂️', reactions: '🙏 19' }
        ];
        var messages = document.getElementById('faq-messages');
        var body = document.getElementById('faq-chat-body');
        var choices = document.querySelectorAll('.faq-choice');
        if (!messages || !choices.length) return;

        function scrollToBottom() {
            setTimeout(function () { body.scrollTop = body.scrollHeight; }, 50);
        }

        function makeReactions(str) {
            var parts = str.split(' ');
            var html = '';
            for (var i = 0; i < parts.length; i += 2) {
                html += '<span class="cc-reaction visible">' + parts[i] + ' <span class="cc-reaction-count">' + parts[i + 1] + '</span></span>';
            }
            return html;
        }

        function postQuestion(idx) {
            var data = faqData[idx];
            // User question
            var userMsg = document.createElement('div');
            userMsg.className = 'cc-msg faq-msg-new';
            userMsg.innerHTML = '<div class="cc-avatar" style="background:#fff;">👤</div><div class="cc-msg-body"><div class="cc-msg-header"><span class="cc-msg-name" style="color:#5865f2;">あなた</span><span class="cc-msg-time">今</span></div><div class="cc-msg-content">' + data.q + '</div></div>';
            messages.appendChild(userMsg);
            scrollToBottom();

            // Yosuga reply
            setTimeout(function () {
                var replyMsg = document.createElement('div');
                replyMsg.className = 'cc-msg faq-msg-new';
                replyMsg.innerHTML = '<div class="cc-avatar cc-avatar-yosuga"></div><div class="cc-msg-body"><div class="cc-msg-header"><span class="cc-msg-name" style="color:#ed4245;">よすが</span><span class="cc-msg-time">今</span></div><div class="cc-reply-quote">' + data.q + '</div><div class="cc-msg-content">' + data.a + '</div><div class="cc-reactions">' + makeReactions(data.reactions) + '</div></div>';
                messages.appendChild(replyMsg);
                scrollToBottom();
            }, 1000);
        }

        choices.forEach(function (btn) {
            btn.addEventListener('click', function () {
                postQuestion(parseInt(this.getAttribute('data-faq-idx')));
            });
        });

    })();

    // ── Content Preview tabs + pager ──
    (function () {
        var tabs = document.querySelectorAll('.preview-tab');
        var panels = document.querySelectorAll('.preview-panel');
        var dots = document.querySelectorAll('.preview-pager-dot');
        var prevBtn = document.querySelector('.preview-pager-prev');
        var nextBtn = document.querySelector('.preview-pager-next');
        if (!tabs.length) return;

        function activateTab(index) {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            tabs[index].classList.add('active');
            panels.forEach(function (p) {
                if (p.getAttribute('data-panel') === tabs[index].getAttribute('data-preview')) {
                    p.classList.add('is-active');
                } else {
                    p.classList.remove('is-active');
                }
            });
            dots.forEach(function (d, i) {
                d.classList.toggle('is-active', i === index);
            });
        }

        function getActiveIndex() {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].classList.contains('active')) return i;
            }
            return 0;
        }

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () { activateTab(i); });
        });

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () { activateTab(i); });
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                var idx = getActiveIndex();
                activateTab(idx > 0 ? idx - 1 : tabs.length - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                var idx = getActiveIndex();
                activateTab(idx < tabs.length - 1 ? idx + 1 : 0);
            });
        }
    })();

    // ── Ambient section glows ──
    gsap.utils.toArray('.section-glow').forEach(function (glow) {
        var section = glow.parentElement;
        gsap.to(glow, {
            opacity: 1,
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                end: 'top 30%',
                scrub: 1
            }
        });
    });

    // ── 3D Geo background images ──
    gsap.utils.toArray('.bg-geo').forEach(function (geo) {
        var section = geo.parentElement;
        ScrollTrigger.create({
            trigger: section,
            start: 'top 90%',
            end: 'bottom 10%',
            onEnter: function () { geo.classList.add('is-visible'); },
            onLeave: function () { geo.classList.remove('is-visible'); },
            onEnterBack: function () { geo.classList.add('is-visible'); },
            onLeaveBack: function () { geo.classList.remove('is-visible'); }
        });
    });

})();
