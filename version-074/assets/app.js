(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function initHorizontalRows() {
    selectAll('[data-horizontal-row]').forEach(function (row) {
      var section = row.closest('.section');
      if (!section) {
        return;
      }
      var left = section.querySelector('[data-scroll-left]');
      var right = section.querySelector('[data-scroll-right]');
      if (left) {
        left.addEventListener('click', function () {
          row.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          row.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function matchesCard(card, query) {
    var title = card.getAttribute('data-title') || '';
    var meta = card.getAttribute('data-meta') || '';
    var text = (title + ' ' + meta + ' ' + card.textContent).toLowerCase();
    return text.indexOf(query) !== -1;
  }

  function initLocalFilters() {
    selectAll('[data-local-filter]').forEach(function (input) {
      var scope = input.closest('main') || document;
      var list = scope.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      var cards = selectAll('[data-card]', list);
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          card.classList.toggle('is-hidden', query && !matchesCard(card, query));
        });
      });
    });
  }

  function initSearchPage() {
    var input = document.querySelector('[data-search-input]');
    var list = document.querySelector('[data-search-list]');
    if (!input || !list) {
      return;
    }
    var cards = selectAll('[data-card]', list);
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function apply() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var match = !query || matchesCard(card, query);
        card.classList.toggle('is-hidden', !match);
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener('input', apply);
    apply();
  }

  window.initPlayer = function (streamUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('[data-play-overlay]');
    var status = document.querySelector('[data-player-status]');
    if (!video || !streamUrl) {
      return;
    }

    var ready = false;
    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function markReady() {
      ready = true;
      setStatus('');
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, markReady);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('视频加载失败，请稍后重试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', markReady, { once: true });
    } else {
      setStatus('当前设备无法加载视频');
    }

    function startPlayback() {
      if (overlay) {
        overlay.hidden = true;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.hidden = false;
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.hidden = true;
      }
      if (!ready) {
        setStatus('正在加载');
      }
    });

    video.addEventListener('canplay', markReady);

    video.addEventListener('error', function () {
      setStatus('视频加载失败，请稍后重试');
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initHorizontalRows();
    initLocalFilters();
    initSearchPage();
  });
}());
