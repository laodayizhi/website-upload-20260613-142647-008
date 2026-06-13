(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      document.body.classList.toggle('no-scroll', mobilePanel.classList.contains('is-open'));
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      }
    });
  });

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var startTimer = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    var resetTimer = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        resetTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('[data-scroll-row]').forEach(function (wrap) {
    var row = wrap.querySelector('[data-scroll-list]');
    var left = wrap.querySelector('[data-scroll-left]');
    var right = wrap.querySelector('[data-scroll-right]');
    var move = function (direction) {
      if (!row) {
        return;
      }
      row.scrollBy({ left: direction * 420, behavior: 'smooth' });
    };
    if (left) {
      left.addEventListener('click', function () { move(-1); });
    }
    if (right) {
      right.addEventListener('click', function () { move(1); });
    }
  });

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var queryInput = filterForm.querySelector('[name="q"]');
    var typeSelect = filterForm.querySelector('[name="type"]');
    var regionSelect = filterForm.querySelector('[name="region"]');
    var yearSelect = filterForm.querySelector('[name="year"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    var applyFilter = function () {
      var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (type && cardType !== type) {
          ok = false;
        }
        if (region && cardRegion !== region) {
          ok = false;
        }
        if (year && cardYear !== year) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    filterForm.addEventListener('input', applyFilter);
    filterForm.addEventListener('change', applyFilter);
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    applyFilter();
  }
})();

function startPlayer(streamUrl) {
  var video = document.getElementById('player-video');
  var button = document.getElementById('player-button');
  var status = document.getElementById('player-status');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !streamUrl) {
    return;
  }

  var setStatus = function (message) {
    if (status) {
      status.textContent = message || '';
    }
  };

  var attachStream = function () {
    if (loaded) {
      return;
    }
    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放暂不可用');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      setStatus('播放暂不可用');
    }
  };

  var begin = function () {
    attachStream();
    if (button) {
      button.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  };

  if (button) {
    button.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      begin();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 && button) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
