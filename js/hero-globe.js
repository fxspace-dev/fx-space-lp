(function () {
    var canvas = document.getElementById('hero-globe');
    if (!canvas || !window.THREE) return;

    // --- Setup ---
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 4.2;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: window.devicePixelRatio < 2 });
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    var isMobile = window.innerWidth < 768;

    // --- Globe group ---
    var globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.25;
    globeGroup.rotation.z = -0.1;
    scene.add(globeGroup);

    // --- Solid dark core (occludes rings behind planet) ---
    var segments = isMobile ? 24 : 36;
    var coreGeo = new THREE.SphereGeometry(0.99, segments, segments / 2);
    var coreMat = new THREE.MeshBasicMaterial({ color: 0x020208 });
    var coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // --- Wireframe globe ---
    var globeGeo = new THREE.SphereGeometry(1, segments, segments / 2);
    var globeMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        depthWrite: false
    });
    var globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);

    // --- Glow ring (inner atmosphere) ---
    var glowGeo = new THREE.SphereGeometry(1.005, segments, segments / 2);
    var glowMat = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
        depthWrite: false
    });
    globeGroup.add(new THREE.Mesh(glowGeo, glowMat));


    // --- Saturn rings (lines) ---
    var saturnRingGroup = new THREE.Group();
    var ringLines = [];
    for (var ri = 0; ri < 4; ri++) ringLines.push({ r: 1.22 + ri * 0.035, op: 0.2, color: 0x818cf8 });
    for (var ri = 0; ri < 10; ri++) ringLines.push({ r: 1.38 + ri * 0.025, op: 0.35 + Math.random() * 0.1, color: 0xc4b5fd });
    ringLines.push({ r: 1.64, op: 0.04, color: 0x6366f1 });
    ringLines.push({ r: 1.66, op: 0.04, color: 0x6366f1 });
    for (var ri = 0; ri < 7; ri++) ringLines.push({ r: 1.7 + ri * 0.03, op: 0.28 + Math.random() * 0.08, color: 0xa5b4fc });
    ringLines.push({ r: 1.95, op: 0.2, color: 0xc4b5fd });

    var ringVertShader = [
        'varying vec3 vWorldPos;',
        'void main() {',
        '    vec4 wp = modelMatrix * vec4(position, 1.0);',
        '    vWorldPos = wp.xyz;',
        '    gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
    ].join('\n');

    var ringFragShader = [
        'uniform vec3 uColor;',
        'uniform float uOpacity;',
        'uniform float uFaintK;',
        'uniform float uSphereR;',
        'uniform vec3 uCamPos;',
        'varying vec3 vWorldPos;',
        'void main() {',
        '    vec3 rd = normalize(vWorldPos - uCamPos);',
        '    float b = dot(uCamPos, rd);',
        '    float c = dot(uCamPos, uCamPos) - uSphereR * uSphereR;',
        '    float disc = b * b - c;',
        '    float alpha = uOpacity;',
        '    if (disc > 0.0) {',
        '        float t = -b - sqrt(disc);',
        '        float fragDist = length(vWorldPos - uCamPos);',
        '        if (t > 0.0 && t < fragDist) {',
        '            alpha = uOpacity * uFaintK;',
        '        }',
        '    }',
        '    gl_FragColor = vec4(uColor, alpha);',
        '}'
    ].join('\n');

    ringLines.forEach(function (rl) {
        var geo = new THREE.RingGeometry(rl.r - 0.003, rl.r + 0.003, 128, 1);
        geo.rotateX(-Math.PI / 2);
        var c = new THREE.Color(rl.color);
        var mat = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
                uOpacity: { value: rl.op },
                uFaintK: { value: 0.10 },
                uSphereR: { value: 0.99 },
                uCamPos: { value: camera.position }
            },
            vertexShader: ringVertShader,
            fragmentShader: ringFragShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false
        });
        saturnRingGroup.add(new THREE.Mesh(geo, mat));
    });
    globeGroup.add(saturnRingGroup);

    // --- 3D candlestick chart wrapping around globe ---
    function latLonToVec3(lat, lon, r) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (lon + 180) * Math.PI / 180;
        return new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
        );
    }

    var chartStrips = [
        { lat: 25, lonStart: -80, count: 24, spread: 4, seed: 1, scale: 0.5 },
        { lat: -20, lonStart: 40, count: 20, spread: 4.5, seed: 7, scale: 0.42 },
        { lat: 45, lonStart: 120, count: 18, spread: 3.5, seed: 3, scale: 0.38 },
        { lat: -35, lonStart: -150, count: 16, spread: 5, seed: 12, scale: 0.35 }
    ];

    chartStrips.forEach(function (strip) {
        // Generate realistic candle data with big variation
        var price = 100;
        var rawCandles = [];
        // Use seeded pseudo-random for consistency
        var _seed = strip.seed * 9301 + 49297;
        function sRand() { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; }

        for (var i = 0; i < strip.count; i++) {
            var trend = Math.sin(i * 0.12 + strip.seed) * 6 + Math.sin(i * 0.04 + strip.seed * 3) * 4;
            price += trend + (sRand() - 0.48) * 5;
            price = Math.max(40, Math.min(180, price));

            // Body sizes: mostly medium-large, occasionally small
            var bodyType = sRand();
            var bodySize;
            if (bodyType < 0.05) bodySize = 1 + sRand() * 2;        // rare doji
            else if (bodyType < 0.25) bodySize = 4 + sRand() * 6;   // medium
            else if (bodyType < 0.65) bodySize = 7 + sRand() * 10;  // large
            else bodySize = 12 + sRand() * 18;                       // very large

            var isGreen = sRand() > 0.45;
            var open = price;
            var close = isGreen ? open + bodySize : open - bodySize;

            // Wick lengths: varied but proportional
            var wickUp = 1 + sRand() * 6;
            var wickDown = 1 + sRand() * 6;

            var high = Math.max(open, close) + wickUp;
            var low = Math.min(open, close) - wickDown;
            rawCandles.push({ open: open, close: close, high: high, low: low });
        }

        // Normalize to 0..1 range within this strip
        var allLow = Infinity, allHigh = -Infinity;
        rawCandles.forEach(function (c) {
            if (c.low < allLow) allLow = c.low;
            if (c.high > allHigh) allHigh = c.high;
        });
        var range = allHigh - allLow || 1;

        rawCandles.forEach(function (c, i) {
            var lon = strip.lonStart + i * strip.spread;
            var isGreen = c.close >= c.open;
            var color = isGreen ? 0x26a69a : 0xef5350;
            var surfacePoint = latLonToVec3(strip.lat, lon, 1.01);
            var normal = surfacePoint.clone().normalize();

            // Compute tangent "up" direction (local north on sphere surface)
            var east = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
            if (east.length() < 0.01) east = new THREE.Vector3(1, 0, 0).cross(normal).normalize();
            var up = normal.clone().cross(east).normalize();

            // Normalize OHLC to 0..1
            var nLow = (c.low - allLow) / range;
            var nHigh = (c.high - allLow) / range;
            var nOpen = (c.open - allLow) / range;
            var nClose = (c.close - allLow) / range;

            // Slightly lift off surface along normal
            var base = surfacePoint.clone().add(normal.clone().multiplyScalar(0.01));

            // Wick: thin 3D box along tangent "up" direction
            var wickH = (nHigh - nLow) * strip.scale;
            if (wickH > 0.001) {
                var wickGeo = new THREE.BoxGeometry(0.004, wickH, 0.004);
                var wickMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8, depthWrite: false });
                var wickMesh = new THREE.Mesh(wickGeo, wickMat);
                var wickCenter = base.clone().add(up.clone().multiplyScalar((nLow + (nHigh - nLow) / 2) * strip.scale));
                wickMesh.position.copy(wickCenter);
                wickMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
                globeGroup.add(wickMesh);
            }

            // Body: box aligned to tangent "up"
            var nBodyBot = Math.min(nOpen, nClose);
            var nBodyTop = Math.max(nOpen, nClose);
            var bodyH = Math.max(0.006, (nBodyTop - nBodyBot) * strip.scale);
            var bodyGeo = new THREE.BoxGeometry(0.018, bodyH, 0.008);
            var bodyMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9, depthWrite: false });
            var bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
            var bodyCenter = base.clone().add(up.clone().multiplyScalar((nBodyBot + (nBodyTop - nBodyBot) / 2) * strip.scale));
            bodyMesh.position.copy(bodyCenter);
            // Align body's Y axis to tangent "up"
            bodyMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
            globeGroup.add(bodyMesh);
        });
    });

    // --- Star particles (varying sizes for depth) ---
    var starCount = isMobile ? 200 : 500;
    var starPos = new Float32Array(starCount * 3);
    var starSizes = new Float32Array(starCount);
    var starPhases = new Float32Array(starCount);
    for (var i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 20;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
        starPos[i * 3 + 2] = -1 - Math.random() * 16;
        starSizes[i] = 0.008 + Math.random() * 0.025;
        starPhases[i] = Math.random() * Math.PI * 2;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.018, transparent: true, opacity: 0.6, sizeAttenuation: true });
    var starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // --- Bright accent stars (fewer, larger, colored) ---
    var accentCount = isMobile ? 15 : 35;
    var accentPos = new Float32Array(accentCount * 3);
    for (var i = 0; i < accentCount; i++) {
        accentPos[i * 3] = (Math.random() - 0.5) * 18;
        accentPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
        accentPos[i * 3 + 2] = -2 - Math.random() * 10;
    }
    var accentGeo = new THREE.BufferGeometry();
    accentGeo.setAttribute('position', new THREE.BufferAttribute(accentPos, 3));
    var accentMat = new THREE.PointsMaterial({ color: 0xa5b4fc, size: 0.04, transparent: true, opacity: 0.4, sizeAttenuation: true });
    var accentStars = new THREE.Points(accentGeo, accentMat);
    scene.add(accentStars);

    // --- Nebula sprites (soft colored clouds in background) ---
    var nebulaCount = isMobile ? 4 : 8;
    var nebulaSprites = [];
    var nebulaColors = [
        { r: 99, g: 102, b: 241 },   // indigo
        { r: 139, g: 92, b: 246 },    // violet
        { r: 59, g: 130, b: 246 },    // blue
        { r: 96, g: 165, b: 250 }     // light blue
    ];
    for (var i = 0; i < nebulaCount; i++) {
        var nc = nebulaColors[i % nebulaColors.length];
        var nebCanvas = document.createElement('canvas');
        nebCanvas.width = 128;
        nebCanvas.height = 128;
        var nebCtx = nebCanvas.getContext('2d');
        var nebGrad = nebCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        nebGrad.addColorStop(0, 'rgba(' + nc.r + ',' + nc.g + ',' + nc.b + ',0.08)');
        nebGrad.addColorStop(0.6, 'rgba(' + nc.r + ',' + nc.g + ',' + nc.b + ',0.02)');
        nebGrad.addColorStop(1, 'rgba(' + nc.r + ',' + nc.g + ',' + nc.b + ',0)');
        nebCtx.fillStyle = nebGrad;
        nebCtx.fillRect(0, 0, 128, 128);
        var nebTex = new THREE.CanvasTexture(nebCanvas);
        var nebMat = new THREE.SpriteMaterial({ map: nebTex, transparent: true, opacity: 0.6 });
        var nebSprite = new THREE.Sprite(nebMat);
        nebSprite.position.set(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 10,
            -4 - Math.random() * 8
        );
        var nebScale = 2 + Math.random() * 4;
        nebSprite.scale.set(nebScale, nebScale, 1);
        scene.add(nebSprite);
        nebulaSprites.push({ sprite: nebSprite, mat: nebMat, phase: Math.random() * Math.PI * 2, baseOp: 0.3 + Math.random() * 0.3 });
    }

    // --- Shooting stars ---
    var shootingStarCount = isMobile ? 2 : 4;
    var shootingStars = [];
    function initShootingStar() {
        var x = (Math.random() - 0.5) * 12;
        var y = 2 + Math.random() * 5;
        var z = -3 - Math.random() * 6;
        var angle = -0.5 - Math.random() * 0.8;
        var speed = 0.06 + Math.random() * 0.08;
        return {
            pos: new THREE.Vector3(x, y, z),
            vel: new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, 0),
            life: 0,
            maxLife: 40 + Math.random() * 60,
            delay: Math.random() * 200
        };
    }
    var shootGroup = new THREE.Group();
    for (var i = 0; i < shootingStarCount; i++) {
        var ss = initShootingStar();
        ss.delay = i * 80 + Math.random() * 100;
        var ssGeo = new THREE.BufferGeometry();
        var ssPositions = new Float32Array(6);
        ssGeo.setAttribute('position', new THREE.BufferAttribute(ssPositions, 3));
        var ssMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        var ssLine = new THREE.Line(ssGeo, ssMat);
        shootGroup.add(ssLine);
        ss.geo = ssGeo;
        ss.mat = ssMat;
        ss.line = ssLine;
        shootingStars.push(ss);
    }
    scene.add(shootGroup);

    // (Saturn rings replace orbit rings)

    // --- Data pulse arcs (light trails between cities) ---
    var arcRoutes = [
        { from: { lat: 35.6, lon: 139.7 }, to: { lat: 40.7, lon: -74 } },      // Tokyo → NY
        { from: { lat: 51.5, lon: -0.1 }, to: { lat: 22.3, lon: 114.2 } },     // London → HK
        { from: { lat: -33.9, lon: 151.2 }, to: { lat: 1.3, lon: 103.8 } },    // Sydney → Singapore
        { from: { lat: 35.6, lon: 139.7 }, to: { lat: 51.5, lon: -0.1 } },     // Tokyo → London
        { from: { lat: 40.7, lon: -74 }, to: { lat: -23.5, lon: -46.6 } }      // NY → Sao Paulo
    ];
    var arcGroup = new THREE.Group();
    var arcPulses = [];

    arcRoutes.forEach(function (route) {
        var start = latLonToVec3(route.from.lat, route.from.lon, 1.01);
        var end = latLonToVec3(route.to.lat, route.to.lon, 1.01);
        var mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.4);

        var curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        var points = curve.getPoints(60);
        var positions = new Float32Array(60 * 3);
        var alphas = new Float32Array(60);
        for (var i = 0; i < 60; i++) {
            positions[i * 3] = points[i].x;
            positions[i * 3 + 1] = points[i].y;
            positions[i * 3 + 2] = points[i].z;
            alphas[i] = 0;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        var mat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.35 });
        var line = new THREE.Line(geo, mat);
        arcGroup.add(line);

        arcPulses.push({
            points: points,
            geo: geo,
            head: Math.random() * 60,
            speed: 0.15 + Math.random() * 0.15,
            color: Math.random() > 0.5 ? 0x34d399 : 0x60a5fa,
            mat: mat
        });
    });
    globeGroup.add(arcGroup);

    // --- Breathing endpoint dots ---
    var dotPositions = [];
    var dotGroup = new THREE.Group();
    var cities = [
        { lat: 35.6, lon: 139.7 }, { lat: 40.7, lon: -74 }, { lat: 51.5, lon: -0.1 },
        { lat: 22.3, lon: 114.2 }, { lat: -33.9, lon: 151.2 }, { lat: 1.3, lon: 103.8 },
        { lat: -23.5, lon: -46.6 }
    ];
    cities.forEach(function (c) {
        var pos = latLonToVec3(c.lat, c.lon, 1.015);
        var dotGeo = new THREE.SphereGeometry(0.012, 8, 8);
        var dotMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.8 });
        var dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pos);
        dotGroup.add(dot);
        dotPositions.push({ mesh: dot, mat: dotMat, phase: Math.random() * Math.PI * 2 });
    });
    globeGroup.add(dotGroup);

    // --- Light source (layered realistic glow, top-right) ---
    var lx = -0.75, ly = 0.75, lz = -0.15;

    function makeGlowTex(size, stops) {
        var c = document.createElement('canvas');
        c.width = size; c.height = size;
        var cx = c.getContext('2d');
        var g = cx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
        cx.fillStyle = g;
        cx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    // Layer 1: tiny hot white core
    var t1 = makeGlowTex(256, [
        [0, 'rgba(255,255,255,1)'],
        [0.02, 'rgba(255,255,255,0.95)'],
        [0.06, 'rgba(240,248,255,0.6)'],
        [0.15, 'rgba(180,220,255,0.12)'],
        [0.3, 'rgba(120,170,255,0)']
    ]);
    var s1 = new THREE.Sprite(new THREE.SpriteMaterial({ map: t1, transparent: true, opacity: 1.0 }));
    s1.scale.set(0.8, 0.8, 1);
    s1.position.set(lx, ly, lz + 0.02);
    scene.add(s1);

    // Layer 2: warm inner glow
    var t2 = makeGlowTex(256, [
        [0, 'rgba(200,230,255,0.7)'],
        [0.1, 'rgba(150,200,255,0.3)'],
        [0.3, 'rgba(100,160,255,0.08)'],
        [0.6, 'rgba(70,120,240,0.01)'],
        [1, 'rgba(60,100,220,0)']
    ]);
    var s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: t2, transparent: true, opacity: 0.9 }));
    s2.scale.set(2.2, 2.2, 1);
    s2.position.set(lx, ly, lz);
    scene.add(s2);

    // Layer 3: wide soft atmospheric spread
    var t3 = makeGlowTex(256, [
        [0, 'rgba(120,170,255,0.2)'],
        [0.2, 'rgba(80,130,240,0.06)'],
        [0.5, 'rgba(60,100,220,0.015)'],
        [1, 'rgba(40,70,180,0)']
    ]);
    var s3 = new THREE.Sprite(new THREE.SpriteMaterial({ map: t3, transparent: true, opacity: 0.7 }));
    s3.scale.set(5, 5, 1);
    s3.position.set(lx, ly, lz - 0.05);
    scene.add(s3);


    // --- Ambient glow sprite (subtle) ---
    var spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 256;
    spriteCanvas.height = 256;
    var ctx = spriteCanvas.getContext('2d');
    var grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(99,102,241,0.18)');
    grad.addColorStop(0.5, 'rgba(99,102,241,0.04)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    var spriteTex = new THREE.CanvasTexture(spriteCanvas);
    var spriteMat = new THREE.SpriteMaterial({ map: spriteTex, transparent: true, opacity: 0.6 });
    var sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 3.2, 1);
    scene.add(sprite);

    // --- Animation ---
    var isVisible = true;
    if (window.IntersectionObserver) {
        var obs = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        obs.observe(canvas);
    }

    var clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
        var elapsed = clock.getElapsedTime();

        globeGroup.rotation.y += 0.0015;

        // Animate arc pulses
        arcPulses.forEach(function (pulse) {
            pulse.head += pulse.speed;
            if (pulse.head >= 60) pulse.head = 0;
            var tailLen = 15;
            var posArr = pulse.geo.attributes.position.array;
            for (var i = 0; i < 60; i++) {
                posArr[i * 3] = pulse.points[i].x;
                posArr[i * 3 + 1] = pulse.points[i].y;
                posArr[i * 3 + 2] = pulse.points[i].z;
            }
            pulse.geo.attributes.position.needsUpdate = true;
            var dist = pulse.head;
            pulse.mat.opacity = 0.08 + 0.25 * Math.abs(Math.sin(dist * 0.1));
        });

        // Animate breathing dots
        dotPositions.forEach(function (d) {
            var breath = 0.5 + 0.5 * Math.sin(elapsed * 1.8 + d.phase);
            d.mat.opacity = 0.3 + breath * 0.6;
            var s = 0.8 + breath * 0.4;
            d.mesh.scale.set(s, s, s);
        });

        // (no orbit ring animation - Saturn rings rotate with globe)

        // Twinkle stars
        starMat.opacity = 0.5 + 0.15 * Math.sin(elapsed * 0.8);
        accentMat.opacity = 0.25 + 0.2 * Math.sin(elapsed * 1.2 + 1.0);

        // Nebula breathing
        nebulaSprites.forEach(function (n) {
            n.mat.opacity = n.baseOp * (0.7 + 0.3 * Math.sin(elapsed * 0.3 + n.phase));
        });

        // Shooting stars
        shootingStars.forEach(function (ss) {
            if (ss.delay > 0) { ss.delay--; return; }
            ss.life++;
            if (ss.life > ss.maxLife) {
                var fresh = initShootingStar();
                ss.pos.copy(fresh.pos);
                ss.vel.copy(fresh.vel);
                ss.life = 0;
                ss.maxLife = fresh.maxLife;
                ss.delay = 60 + Math.random() * 200;
                ss.mat.opacity = 0;
                return;
            }
            ss.pos.add(ss.vel);
            var tail = ss.pos.clone().sub(ss.vel.clone().multiplyScalar(8));
            var arr = ss.geo.attributes.position.array;
            arr[0] = ss.pos.x; arr[1] = ss.pos.y; arr[2] = ss.pos.z;
            arr[3] = tail.x; arr[4] = tail.y; arr[5] = tail.z;
            ss.geo.attributes.position.needsUpdate = true;
            var progress = ss.life / ss.maxLife;
            ss.mat.opacity = progress < 0.2 ? progress * 5 * 0.7 : (1 - progress) * 0.7;
        });

        renderer.render(scene, camera);
    }
    animate();

    // --- Resize ---
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            var w = canvas.clientWidth;
            var h = canvas.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }, 150);
    });
})();
