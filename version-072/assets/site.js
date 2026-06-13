(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function setupPageFilter() {
        var input = document.querySelector(".page-filter");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".category-movie-grid .movie-card"));
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-keywords") || "")).toLowerCase();
                card.classList.toggle("hidden-card", query && text.indexOf(query) === -1);
            });
        });
    }

    function movieCard(movie) {
        var tags = [movie.region, movie.type, movie.year].filter(Boolean).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\" data-title=\"" + escapeHtml(movie.title) + "\" data-keywords=\"" + escapeHtml(movie.keywords) + "\">",
            "<figure class=\"poster-frame\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><figcaption>" + escapeHtml(movie.type) + "</figcaption></figure>",
            "<div class=\"movie-card-body\"><h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.oneLine) + "</p><div class=\"meta-row\">" + tags + "</div></div>",
            "</a>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupSearchPage() {
        var root = document.getElementById("search-page");
        var form = document.getElementById("site-search-form");
        var input = document.getElementById("site-search-input");
        var results = document.getElementById("search-results");
        var title = document.getElementById("search-title");
        var note = document.getElementById("search-note");
        if (!root || !form || !input || !results || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        input.value = initialQuery;

        function render(query) {
            var normalized = query.trim().toLowerCase();
            var list = window.SITE_MOVIES.filter(function (movie) {
                var text = (movie.title + " " + movie.keywords + " " + movie.oneLine).toLowerCase();
                return !normalized || text.indexOf(normalized) !== -1;
            }).slice(0, 72);
            if (normalized) {
                title.textContent = "搜索结果";
                note.textContent = list.length ? "已匹配相关影视内容。" : "暂未匹配到相关影视内容。";
            } else {
                title.textContent = "推荐浏览";
                note.textContent = "可通过搜索框继续筛选更多影视内容。";
            }
            results.innerHTML = list.map(movieCard).join("");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render(input.value);
            var query = input.value.trim();
            if (query) {
                var nextUrl = window.location.pathname + "?q=" + encodeURIComponent(query);
                window.history.replaceState(null, "", nextUrl);
            }
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
        if (initialQuery) {
            render(initialQuery);
        }
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupPageFilter();
        setupSearchPage();
    });
})();
