(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    var next = function () {
      show(current + 1);
    };
    var prev = function () {
      show(current - 1);
    };
    var nextButton = slider.querySelector('[data-hero-next]');
    var prevButton = slider.querySelector('[data-hero-prev]');
    if (nextButton) {
      nextButton.addEventListener('click', next);
    }
    if (prevButton) {
      prevButton.addEventListener('click', prev);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(next, 5600);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var scope = panel.parentElement;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-filter-card'));
    var input = panel.querySelector('[data-filter-input]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var count = panel.querySelector('[data-filter-count]');
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');
    if (input && preset) {
      input.value = preset;
    }
    var norm = function (value) {
      return String(value || '').toLowerCase().trim();
    };
    var apply = function () {
      var q = norm(input && input.value);
      var t = norm(type && type.value);
      var y = norm(year && year.value);
      var r = norm(region && region.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = norm(card.getAttribute('data-search'));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (t && norm(card.getAttribute('data-type')).indexOf(t) === -1) {
          ok = false;
        }
        if (y && norm(card.getAttribute('data-year')) !== y) {
          ok = false;
        }
        if (r && norm(card.getAttribute('data-region')).indexOf(r) === -1) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + ' 部影片';
      }
    };
    [input, type, year, region].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });
    apply();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-start');
    var stream = box.getAttribute('data-stream');
    var ready = false;
    var hls = null;
    var start = function () {
      if (!video || !stream) {
        return;
      }
      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        ready = true;
      }
      box.classList.add('is-playing');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove('is-playing');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
