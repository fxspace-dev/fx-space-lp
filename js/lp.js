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
    gsap.to('#hero-stats', {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.6,
        onComplete: function () {
            countUp(document.getElementById('stat-pros'), 420, 1800);
            countUp(document.getElementById('stat-prop'), 300, 1500);
            countUp(document.getElementById('stat-amount'), 1.2, 1200, 1);
        }
    });

    // Proof
    gsap.utils.toArray('.proof-card').forEach(function (c, i) {
        gsap.to(c, {
            scrollTrigger: { trigger: c, start: 'top 90%', once: true },
            opacity: 1, y: 0, duration: 0.5, delay: i * 0.08, ease: 'power3.out'
        });
    });

    // Features
    gsap.utils.toArray('.feature-card').forEach(function (c, i) {
        gsap.to(c, {
            scrollTrigger: { trigger: c, start: 'top 88%', once: true },
            opacity: 1, y: 0, duration: 0.7, delay: i * 0.12, ease: 'power3.out'
        });
    });

    // Community chat
    gsap.from('.community-chat', {
        scrollTrigger: { trigger: '.community-section', start: 'top 78%', once: true },
        opacity: 0, y: 40, duration: 0.8, ease: 'power3.out'
    });

    // Founder
    gsap.from('.founder-card', {
        scrollTrigger: { trigger: '.founder-section', start: 'top 80%', once: true },
        opacity: 0, y: 40, duration: 0.8, ease: 'power3.out'
    });

    // Plan cards
    gsap.utils.toArray('.plan-card').forEach(function (c, i) {
        gsap.to(c, {
            scrollTrigger: { trigger: c, start: 'top 88%', once: true },
            opacity: 1, y: 0, duration: 0.7, delay: i * 0.15, ease: 'power3.out'
        });
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

    // ── Role Model section ──
    (function () {
        var chartLine = document.getElementById('rm-chart-line');
        if (!chartLine) return;

        // Section header
        gsap.from('.rolemodel-inner .heading-lg', {
            scrollTrigger: { trigger: '.rolemodel-section', start: 'top 80%', once: true },
            opacity: 0, y: 30, duration: 0.7, ease: 'power3.out'
        });
        gsap.from('.rolemodel-lead', {
            scrollTrigger: { trigger: '.rolemodel-section', start: 'top 78%', once: true },
            opacity: 0, y: 20, duration: 0.6, delay: 0.15, ease: 'power3.out'
        });

        // 1. V-Shape Chart: SVG path draw-on
        var pathLength = chartLine.getTotalLength();
        chartLine.style.strokeDasharray = pathLength;
        chartLine.style.strokeDashoffset = pathLength;

        gsap.to(chartLine, {
            scrollTrigger: { trigger: '.rolemodel-chart-wrap', start: 'top 75%', once: true },
            strokeDashoffset: 0,
            duration: 2.5,
            ease: 'power2.inOut',
            onComplete: function () {}
        });

        // FX SPACE join marker
        gsap.to('.rm-join-line', {
            scrollTrigger: { trigger: '.rolemodel-chart-wrap', start: 'top 75%', once: true },
            opacity: 1, duration: 0.5, delay: 1.0, ease: 'power2.out'
        });
        gsap.to('.rm-join-bg', {
            scrollTrigger: { trigger: '.rolemodel-chart-wrap', start: 'top 75%', once: true },
            opacity: 1, duration: 0.4, delay: 1.2, ease: 'back.out(1.7)'
        });
        gsap.to('.rm-join-text', {
            scrollTrigger: { trigger: '.rolemodel-chart-wrap', start: 'top 75%', once: true },
            opacity: 1, duration: 0.4, delay: 1.2, ease: 'power2.out'
        });

        // Data dots
        gsap.utils.toArray('.rm-dot').forEach(function (dot, i) {
            gsap.to(dot, {
                scrollTrigger: { trigger: '.rolemodel-chart-wrap', start: 'top 75%', once: true },
                opacity: 1, duration: 0.4,
                delay: 0.5 + i * 0.4,
                ease: 'back.out(2)'
            });
        });

        // Data labels
        gsap.utils.toArray('.rm-dot-label').forEach(function (label, i) {
            gsap.to(label, {
                scrollTrigger: { trigger: '.rolemodel-chart-wrap', start: 'top 75%', once: true },
                opacity: 1, duration: 0.5,
                delay: 0.8 + i * 0.4,
                ease: 'power2.out'
            });
        });

        // 2. Step cards (integrated above chart)
        gsap.utils.toArray('.rm-step').forEach(function (step, i) {
            gsap.to(step, {
                scrollTrigger: { trigger: '.rm-steps-overlay', start: 'top 85%', once: true },
                opacity: 1, y: 0,
                duration: 0.5, delay: i * 0.12,
                ease: 'power3.out'
            });
        });

        // 3. Monthly income comparison bars
        gsap.to('#rm-bar-salary', {
            scrollTrigger: { trigger: '.rolemodel-compare', start: 'top 80%', once: true },
            width: '11%',
            duration: 1.2,
            ease: 'power3.out',
            onComplete: function () {
                gsap.to('#rm-bar-salary .rm-bar-value', { opacity: 1, duration: 0.4 });
            }
        });
        gsap.to('#rm-bar-fx', {
            scrollTrigger: { trigger: '.rolemodel-compare', start: 'top 80%', once: true },
            width: '72.6%',
            duration: 1.5, delay: 0.3,
            ease: 'power3.out',
            onComplete: function () {
                gsap.to('#rm-bar-fx .rm-bar-value', { opacity: 1, duration: 0.4 });
                gsap.from('#rm-multiplier', { opacity: 0, scale: 0.5, duration: 0.6, ease: 'back.out(2)' });
            }
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

})();
