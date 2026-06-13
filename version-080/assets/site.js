(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function move(step) {
                show(index + step);
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    move(1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    move(-1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    move(1);
                    start();
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector("[data-filter-box]");
            var yearSelect = panel.querySelector("[data-year-select]");
            var genreSelect = panel.querySelector("[data-genre-select]");
            var typeSelect = panel.querySelector("[data-type-select]");
            var empty = panel.querySelector("[data-empty]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

            function matches(card) {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var genre = genreSelect ? genreSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-type") || ""
                ].join(" ").toLowerCase();

                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    return false;
                }
                if (genre && (card.getAttribute("data-genre") || "").indexOf(genre) === -1) {
                    return false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    return false;
                }
                return true;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, yearSelect, genreSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    });

    window.initMoviePlayer = function (videoId, overlayId, sourceUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls = null;
        var prepared = false;

        if (!video) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function start() {
            prepare();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
