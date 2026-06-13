(function () {
    "use strict";

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(index + 1);
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
                showSlide(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initCategoryFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-filter-grid]");

        if (!panel || !grid) {
            return;
        }

        var search = panel.querySelector("[data-filter-search]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var region = panel.querySelector("[data-filter-region]");
        var reset = panel.querySelector("[data-filter-reset]");
        var count = panel.querySelector("[data-filter-count]");
        var empty = document.querySelector("[data-filter-empty]");
        var cards = selectAll("[data-movie-card]", grid);

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(search && search.value);
            var selectedYear = year ? year.value : "";
            var selectedType = type ? type.value : "";
            var selectedRegion = region ? region.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                var matchesType = !selectedType || card.getAttribute("data-type") === selectedType;
                var matchesRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
                var isVisible = matchesQuery && matchesYear && matchesType && matchesRegion;

                card.hidden = !isVisible;
                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, year, type, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (reset) {
            reset.addEventListener("click", function () {
                if (search) {
                    search.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (region) {
                    region.value = "";
                }
                applyFilters();
            });
        }

        applyFilters();
    }

    function getSearchParams() {
        var params = new URLSearchParams(window.location.search);
        return {
            query: params.get("q") || "",
            category: params.get("category") || "",
            year: params.get("year") || ""
        };
    }

    function movieResultTemplate(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return escapeHtml(tag);
        }).join(" ");

        return [
            '<article class="movie-card" data-movie-card>',
            '    <a class="movie-poster" href="movie/' + movie.id + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
            '        <span class="poster-shade"></span>',
            '        <span class="poster-play">▶</span>',
            '        <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
            '        <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="movie-card-meta">',
            '            <a href="category/' + movie.categorySlug + '.html">' + escapeHtml(movie.categoryName) + '</a>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '        </div>',
            '        <div class="movie-card-tags">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join("");
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
        var root = document.querySelector("[data-search-page]");

        if (!root || !window.MOVIE_DATA) {
            return;
        }

        var input = root.querySelector("[data-search-input]");
        var category = root.querySelector("[data-search-category]");
        var year = root.querySelector("[data-search-year]");
        var reset = root.querySelector("[data-search-reset]");
        var results = root.querySelector("[data-search-results]");
        var count = root.querySelector("[data-search-count]");
        var empty = root.querySelector("[data-search-empty]");
        var defaultSection = document.querySelector("[data-search-default]");
        var params = getSearchParams();

        if (input) {
            input.value = params.query;
        }
        if (category) {
            category.value = params.category;
        }
        if (year) {
            year.value = params.year;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applySearch() {
            var query = normalize(input && input.value);
            var selectedCategory = category ? category.value : "";
            var selectedYear = year ? year.value : "";
            var items = window.MOVIE_DATA.filter(function (movie) {
                var haystack = normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.categoryName + " " + movie.tags.join(" ") + " " + movie.oneLine);
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesCategory = !selectedCategory || movie.categorySlug === selectedCategory;
                var matchesYear = !selectedYear || movie.year === selectedYear;

                return matchesQuery && matchesCategory && matchesYear;
            }).slice(0, 160);

            if (results) {
                results.innerHTML = items.map(movieResultTemplate).join("");
            }
            if (count) {
                count.textContent = String(items.length);
            }
            if (empty) {
                empty.hidden = items.length !== 0;
            }
            if (defaultSection) {
                defaultSection.hidden = Boolean(query || selectedCategory || selectedYear);
            }
        }

        [input, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applySearch);
                control.addEventListener("change", applySearch);
            }
        });

        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (category) {
                    category.value = "";
                }
                if (year) {
                    year.value = "";
                }
                applySearch();
            });
        }

        applySearch();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initCategoryFilters();
        initSearchPage();
    });
}());
