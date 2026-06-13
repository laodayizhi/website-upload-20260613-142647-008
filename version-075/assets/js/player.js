(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.querySelector(".movie-video");
        var button = document.querySelector(".play-overlay");
        var meta = document.querySelector('meta[name="stream-url"]');
        if (!video || !button || !meta) {
            return;
        }

        var streamUrl = meta.getAttribute("content") || "";
        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached || !streamUrl) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            attached = true;
        }

        function startPlayback(event) {
            if (event) {
                event.preventDefault();
            }
            attachStream();
            video.controls = true;
            button.classList.add("is-hidden");
            var playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === "function") {
                playAttempt.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
