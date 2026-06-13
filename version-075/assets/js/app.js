(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        start();
    }

    function fillSelect(select, values, fallback) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            if (!value) {
                return;
            }
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
        if (fallback && values.indexOf(fallback) !== -1) {
            select.value = fallback;
        }
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var targetId = form.getAttribute("data-target");
            var target = targetId ? document.getElementById(targetId) : null;
            var queryInput = form.querySelector("[data-filter-query]");
            var yearSelect = form.querySelector('[data-filter-select="year"]');
            var typeSelect = form.querySelector('[data-filter-select="type"]');
            var cards = target ? Array.prototype.slice.call(target.querySelectorAll(".movie-card")) : [];
            var years = [];
            var types = [];

            cards.forEach(function (card) {
                var year = card.getAttribute("data-year") || "";
                var type = card.getAttribute("data-type") || "";
                if (year && years.indexOf(year) === -1) {
                    years.push(year);
                }
                if (type && types.indexOf(type) === -1) {
                    types.push(type);
                }
            });

            years.sort(function (a, b) {
                return Number(b) - Number(a);
            });
            types.sort(function (a, b) {
                return a.localeCompare(b, "zh-Hans-CN");
            });

            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (queryInput && initialQuery) {
                queryInput.value = initialQuery;
            }
            fillSelect(yearSelect, years, params.get("year"));
            fillSelect(typeSelect, types, params.get("type"));

            function applyFilter() {
                if (!cards.length) {
                    return;
                }
                var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";

                cards.forEach(function (card) {
                    var text = card.textContent.toLowerCase() + " " + [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category")
                    ].join(" ").toLowerCase();
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesYear = !year || card.getAttribute("data-year") === year;
                    var matchesType = !type || card.getAttribute("data-type") === type;
                    card.classList.toggle("is-hidden", !(matchesQuery && matchesYear && matchesType));
                });
            }

            if (target) {
                applyFilter();
                [queryInput, yearSelect, typeSelect].forEach(function (control) {
                    if (control) {
                        control.addEventListener("input", applyFilter);
                        control.addEventListener("change", applyFilter);
                    }
                });
            }

            form.addEventListener("submit", function (event) {
                if (target) {
                    event.preventDefault();
                    applyFilter();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
