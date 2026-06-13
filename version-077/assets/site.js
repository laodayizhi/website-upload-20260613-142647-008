(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-card-search]');
    const select = scope.querySelector('[data-year-filter]');
    const list = scope.parentElement.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('[data-search-card]'));
    const years = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-year');
    }).filter(Boolean))).sort(function (a, b) {
      return Number(b) - Number(a);
    });

    if (select) {
      years.forEach(function (year) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      });
    }

    function apply() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const year = select ? select.value : '';

      cards.forEach(function (card) {
        const text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        const yearMatch = !year || card.getAttribute('data-year') === year;
        const textMatch = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = yearMatch && textMatch ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.play-layer');
    const stream = player.getAttribute('data-stream');
    let prepared = false;
    let hls = null;

    function prepare() {
      if (!video || !stream || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 28,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function play() {
      prepare();
      if (button) {
        button.classList.add('is-hidden');
      }
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
