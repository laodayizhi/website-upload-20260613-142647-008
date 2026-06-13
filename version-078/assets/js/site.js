(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var index = 0;
    var timer;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('.inline-filter');
      var year = scope.querySelector('.year-filter');
      var holder = scope.nextElementSibling;
      if (!holder) {
        return;
      }
      var cards = Array.prototype.slice.call(holder.querySelectorAll('.movie-card'));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var matchedQuery = !query || text.indexOf(query) !== -1;
          var matchedYear = true;
          if (selectedYear === '2022') {
            matchedYear = !/(2023|2024|2025|2026)/.test(text);
          } else if (selectedYear) {
            matchedYear = text.indexOf(selectedYear) !== -1;
          }
          card.classList.toggle('is-hidden', !(matchedQuery && matchedYear));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }

      var params = new URLSearchParams(window.location.search);
      var keyword = params.get('q');
      if (keyword && input) {
        input.value = keyword;
        apply();
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-box[data-stream]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.play-overlay');
      var source = player.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;

      if (!video || !overlay || !source) {
        return;
      }

      function playVideo() {
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      }

      function loadAndPlay() {
        overlay.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              overlay.classList.remove('is-hidden');
              overlay.querySelector('strong').textContent = '重新播放';
            }
          });
          return;
        }
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
      }

      overlay.addEventListener('click', loadAndPlay);
      video.addEventListener('click', function () {
        if (!loaded) {
          loadAndPlay();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupFilters();
    setupPlayers();
  });
})();
