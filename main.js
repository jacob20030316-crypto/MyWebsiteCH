// 中文主页的交互：深浅色切换、照片弹窗、首屏背景网络动画
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // ---- 深色 / 浅色切换（选择会被记住） ----
  document.querySelector('.theme-btn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('dw-cn-theme', next); } catch (e) {}
  });

  // ---- 照片弹窗 ----
  var box = document.querySelector('.lightbox');
  var photos = box.querySelector('.lightbox-photos');
  var noteText = box.querySelector('.lightbox-note p');
  function close() {
    box.classList.remove('open');
    root.style.overflow = '';
  }
  box.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
  document.querySelectorAll('.hobby').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var note = btn.getAttribute('data-note');
      box.classList.toggle('has-note', !!note);
      photos.innerHTML = '';
      if (note) {
        noteText.textContent = note;
      } else {
        btn.getAttribute('data-photos').split(',').forEach(function (src) {
          var img = document.createElement('img');
          img.src = src;
          img.alt = btn.querySelector('b').textContent;
          photos.appendChild(img);
        });
      }
      box.classList.add('open');
      root.style.overflow = 'hidden';
    });
  });

  // ---- 首屏背景：缓慢漂移的节点网络 ----
  var canvas = document.querySelector('.hero-net');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var nodes = [], w = 0, h = 0, raf = null, visible = true, LINK = 110;
  function color(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = [];
    var n = Math.round(Math.min(34, (w * h) / 16000));
    for (var i = 0; i < n; i++) {
      nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.14, vy: (Math.random() - 0.5) * 0.14, r: Math.random() < 0.15 ? 2 : 1.3 });
    }
  }
  function draw() {
    var c1 = color('--net'), c2 = color('--net2');
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = 'rgba(' + c1 + ',' + (0.11 * (1 - d / LINK)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(' + (i % 3 ? c1 : c2) + ',0.3)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  function step() {
    nodes.forEach(function (n) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
      if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
    });
    draw();
    raf = visible ? requestAnimationFrame(step) : null;
  }
  resize();
  if (reduceMotion) draw(); else raf = requestAnimationFrame(step);
  window.addEventListener('resize', function () { resize(); if (reduceMotion) draw(); });
  if (!reduceMotion && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(step);
    }).observe(canvas);
  }
})();
