(function () {
  "use strict";

  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function go(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initCardFilter() {
    var input = document.querySelector("[data-filter-cards]");
    var cards = selectAll("[data-title][data-tags]");

    if (!input || !cards.length) {
      return;
    }

    input.addEventListener("input", function () {
      var term = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region")
        ].join(" "));
        var matched = !term || text.indexOf(term) !== -1;

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      var counter = document.querySelector("[data-filter-count]");

      if (counter) {
        counter.textContent = String(visible);
      }
    });
  }

  function movieCard(movie) {
    return [
      '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '" data-tags="' + escapeHtml(movie.tags) + '" data-region="' + escapeHtml(movie.region) + '">',
      '  <span class="poster-frame">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <em>' + escapeHtml(movie.oneLine) + '</em>',
      '  </span>',
      '</a>'
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var count = document.querySelector("[data-search-count]");
    var data = window.MOVIE_SEARCH_DATA || [];

    if (!input || !results || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    input.value = initialQuery;

    function render() {
      var query = normalize(input.value);
      var matched = data.filter(function (movie) {
        if (!query) {
          return true;
        }

        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" ")).indexOf(query) !== -1;
      }).slice(0, 240);

      if (count) {
        count.textContent = String(matched.length);
      }

      if (!matched.length) {
        results.className = "search-empty";
        results.innerHTML = "没有找到匹配影片";
        return;
      }

      results.className = "grid movie-grid";
      results.innerHTML = matched.map(movieCard).join("\n");
    }

    input.addEventListener("input", render);
    render();
  }

  function initPlayers() {
    selectAll("[data-video-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var src = shell.getAttribute("data-src");
      var playButtons = selectAll("[data-player-play]", shell);
      var muteButtons = selectAll("[data-player-mute]", shell);
      var fullButtons = selectAll("[data-player-fullscreen]", shell);
      var status = shell.querySelector("[data-player-status]");
      var hls = null;
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function initialize() {
        if (initialized || !video || !src) {
          return;
        }

        initialized = true;
        setStatus("正在加载播放源");

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
          });

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("视频加载失败，请稍后重试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.addEventListener("loadedmetadata", function () {
            setStatus("播放源已就绪");
          }, { once: true });
        } else {
          setStatus("当前浏览器不支持 HLS 播放");
        }
      }

      function togglePlay(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        initialize();

        if (!video) {
          return;
        }

        if (video.paused) {
          var playPromise = video.play();

          if (playPromise && typeof playPromise.then === "function") {
            playPromise
              .then(function () {
                shell.classList.add("is-playing");
                setStatus("正在播放");
              })
              .catch(function () {
                setStatus("点击播放按钮开始播放");
              });
          }
        } else {
          video.pause();
        }
      }

      playButtons.forEach(function (button) {
        button.addEventListener("click", togglePlay);
      });

      muteButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();

          if (!video) {
            return;
          }

          video.muted = !video.muted;
          button.textContent = video.muted ? "🔇" : "🔊";
        });
      });

      fullButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();

          if (!shell.requestFullscreen) {
            return;
          }

          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            shell.requestFullscreen();
          }
        });
      });

      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
          setStatus("正在播放");
        });

        video.addEventListener("pause", function () {
          shell.classList.remove("is-playing");
          setStatus("已暂停");
        });
      }

      shell.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          togglePlay(event);
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initCardFilter();
    initSearchPage();
    initPlayers();
  });
})();
