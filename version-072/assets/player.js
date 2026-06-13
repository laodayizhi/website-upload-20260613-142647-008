(function () {
    function attach(video, sourceUrl) {
        if (video.getAttribute("data-ready") === "true") {
            return;
        }
        video.setAttribute("data-ready", "true");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            return;
        }
        video.src = sourceUrl;
    }

    window.initializeMoviePlayer = function (id, sourceUrl) {
        var root = document.getElementById(id);
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var overlay = root.querySelector(".player-overlay");
        if (!video || !overlay) {
            return;
        }

        function play() {
            attach(video, sourceUrl);
            overlay.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
    };
})();
