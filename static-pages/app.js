/* 静态演示交互：音频播放 / 视角切换 / 出题判分 / 词库筛选 / Toast */
(function () {
  var audio = null;
  var playingBtn = null;

  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  function stopAudio() {
    if (audio) { audio.pause(); }
    if (playingBtn) { playingBtn.classList.remove('playing'); playingBtn = null; }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-audio]');
    if (!btn) return;
    e.preventDefault();

    var isGuest = document.body.classList.contains('guest');
    var needsVip = btn.getAttribute('data-vip') === '1';
    if (isGuest && needsVip) {
      toast('会员专享：解锁 20 个换词发音与下载');
      return;
    }

    if (playingBtn === btn) { stopAudio(); return; }
    stopAudio();
    var a = new Audio(btn.getAttribute('data-audio'));
    audio = a;
    playingBtn = btn;
    btn.classList.add('playing');
    a.play().catch(function () {
      btn.classList.remove('playing');
      toast('音频加载失败（演示环境）');
    });
    a.onended = stopAudio;
    a.onerror = stopAudio;
  });

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-toast]');
    if (!el) return;
    e.preventDefault();
    if (document.body.classList.contains('guest') && el.getAttribute('data-vip') === '1') {
      toast('会员专享：解锁 20 个换词发音与下载');
      return;
    }
    toast(el.getAttribute('data-toast'));
  });

  var vs = document.getElementById('viewswitch');
  if (vs) {
    vs.addEventListener('click', function (e) {
      var seg = e.target.closest('span[data-view]');
      if (!seg) return;
      var view = seg.getAttribute('data-view');
      vs.querySelectorAll('span').forEach(function (s) {
        s.classList.toggle('on', s === seg);
      });
      document.body.classList.toggle('guest', view === 'guest');
      document.body.classList.toggle('member', view === 'member');
      toast(view === 'guest'
        ? '已切换到游客视角：换词表音频与下载被锁'
        : '已切换到会员视角：全部解锁');
    });
  }

  document.querySelectorAll('[data-quiz]').forEach(function (item) {
    var input = item.querySelector('.quiz-input');
    var btn = item.querySelector('.quiz-check');
    var answer = item.getAttribute('data-quiz').toLowerCase()
      .replace(/[?.,!]/g, '').replace(/\s+/g, ' ').trim();
    function check() {
      var given = (input.value || '').toLowerCase()
        .replace(/[?.,!]/g, '').replace(/\s+/g, ' ').trim();
      if (!given) { toast('先输入你的答案，再检查'); return; }
      item.classList.add('done');
      item.classList.remove('right', 'wrong');
      item.classList.add(given === answer ? 'right' : 'wrong');
      var mark = item.querySelector('.quiz-mark');
      if (mark) mark.textContent = given === answer ? '✓ 回答正确' : '✗ 再听一遍原句';
    }
    if (btn) btn.addEventListener('click', check);
    if (input) input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') check();
    });
  });

  var search = document.getElementById('wordSearch');
  if (search) {
    var rows = document.querySelectorAll('[data-word]');
    var count = document.getElementById('wordCount');
    function filter() {
      var q = search.value.trim().toLowerCase();
      var n = 0;
      rows.forEach(function (r) {
        var hit = !q || r.getAttribute('data-word').indexOf(q) > -1
          || r.getAttribute('data-zh').indexOf(q) > -1;
        r.style.display = hit ? '' : 'none';
        if (hit) n++;
      });
      if (count) count.textContent = '共 ' + n + ' 个词 · 来自 1 个已上线单集';
    }
    search.addEventListener('input', filter);
    filter();
  }

  document.querySelectorAll('.ep-card:not(.is-soon)').forEach(function (c) {
    c.addEventListener('click', function () {
      if (c.classList.contains('locked')) {
        toast('该集为会员内容，登录会员后可学习');
      }
    });
  });
})();
