(function () {
    "use strict";

    var hlsLoaderPromise = null;

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoaderPromise) {
            return hlsLoaderPromise;
        }

        hlsLoaderPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error("HLS library loaded but Hls is unavailable."));
                }
            };
            script.onerror = function () {
                reject(new Error("HLS library failed to load."));
            };
            document.head.appendChild(script);
        });

        return hlsLoaderPromise;
    }

    function setStatus(shell, message) {
        var status = shell.querySelector("[data-player-status]");
        if (status) {
            status.textContent = message;
        }
    }

    function attachNative(video, source) {
        video.src = source;
        return Promise.resolve();
    }

    function attachHls(video, source) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            return attachNative(video, source);
        }

        return loadHlsLibrary().then(function (Hls) {
            if (!Hls.isSupported()) {
                return attachNative(video, source);
            }

            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;

            hls.on(Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
        }).catch(function () {
            return attachNative(video, source);
        });
    }

    function initPlayer(shell) {
        var video = shell.querySelector("video");
        var trigger = shell.querySelector("[data-play-trigger]");
        var source = shell.getAttribute("data-source");
        var initialized = false;

        if (!video || !source) {
            setStatus(shell, "播放源不可用");
            return;
        }

        function play() {
            setStatus(shell, "正在初始化播放源...");

            var ready = initialized ? Promise.resolve() : attachHls(video, source).then(function () {
                initialized = true;
            });

            ready.then(function () {
                shell.classList.add("is-playing");
                setStatus(shell, "正在播放");
                return video.play();
            }).catch(function () {
                setStatus(shell, "播放失败，请再次点击或更换浏览器");
                shell.classList.remove("is-playing");
            });
        }

        if (trigger) {
            trigger.addEventListener("click", play);
        }

        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
            setStatus(shell, "正在播放");
        });

        video.addEventListener("pause", function () {
            setStatus(shell, "已暂停");
        });

        video.addEventListener("ended", function () {
            setStatus(shell, "播放结束");
        });

        video.addEventListener("error", function () {
            setStatus(shell, "视频加载失败，请稍后重试");
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
    });

    window.addEventListener("beforeunload", function () {
        Array.prototype.slice.call(document.querySelectorAll("video")).forEach(function (video) {
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
            }
        });
    });
}());
