let scrollAccumulator = 0;
let lastTouchY = null;

function applyScrollDelta(deltaY) {
    scrollAccumulator += deltaY;
    const shouldBeScrolled = scrollAccumulator > 100;
    const currentlyScrolled = document.body.classList.contains("scrolled");

    if (shouldBeScrolled !== currentlyScrolled) {
        document.body.classList.toggle("scrolled", shouldBeScrolled);
    }

    if (scrollAccumulator < 0) scrollAccumulator = 0;
    if (scrollAccumulator > 200) scrollAccumulator = 200;
}

window.addEventListener("wheel", (event) => {
    event.preventDefault();
    applyScrollDelta(event.deltaY);
}, { passive: false });

window.addEventListener("touchstart", (event) => {
    lastTouchY = event.touches[0]?.clientY ?? null;
}, { passive: true });

window.addEventListener("touchmove", (event) => {
    event.preventDefault();
    const currentTouchY = event.touches[0]?.clientY;
    if (lastTouchY === null || currentTouchY === undefined) return;

    applyScrollDelta(lastTouchY - currentTouchY);
    lastTouchY = currentTouchY;
}, { passive: false });

window.addEventListener("touchend", () => {
    lastTouchY = null;
}, { passive: true });

window.addEventListener("touchcancel", () => {
    lastTouchY = null;
}, { passive: true });

function setupAudio() {
    const music = document.getElementById("background-music");
    const muteButton = document.querySelector(".audio-toggle");
    if (!music || !muteButton) return;

    const musicStartSeconds = 14;
    const fadeInMilliseconds = 1000;
    let fadeFrame = 0;
    let hasSetStartTime = false;
    let hasFadedIn = false;

    function syncMuteState() {
        muteButton.classList.toggle("is-muted", music.muted);
        muteButton.setAttribute("aria-pressed", String(music.muted));
        muteButton.setAttribute("aria-label", music.muted ? "Unmute music" : "Mute music");
    }

    function setMusicStartTime() {
        if (hasSetStartTime) return;
        if (Number.isFinite(music.duration) && music.duration > musicStartSeconds) {
            music.currentTime = musicStartSeconds;
        }
        hasSetStartTime = true;
    }

    function fadeMusicIn() {
        if (hasFadedIn) return;
        hasFadedIn = true;
        music.volume = 0;
        const startedAt = performance.now();

        function step(now) {
            const progress = Math.min((now - startedAt) / fadeInMilliseconds, 1);
            music.volume = progress;
            if (progress < 1) fadeFrame = requestAnimationFrame(step);
        }

        cancelAnimationFrame(fadeFrame);
        fadeFrame = requestAnimationFrame(step);
    }

    function playMusic() {
        setMusicStartTime();
        const playAttempt = music.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.then(fadeMusicIn).catch(() => {});
        } else {
            fadeMusicIn();
        }
    }

    music.volume = 0;
    music.addEventListener("loadedmetadata", setMusicStartTime, { once: true });
    music.addEventListener("play", fadeMusicIn, { once: true });
    muteButton.addEventListener("click", () => {
        music.muted = !music.muted;
        syncMuteState();
        playMusic();
    });

    ["click", "keydown", "pointerdown", "wheel", "touchstart"].forEach((eventName) => {
        window.addEventListener(eventName, playMusic, { once: true, passive: true });
    });

    syncMuteState();
    playMusic();
}

function setupLogoFlip() {
    const logoStage = document.querySelector("[data-logo-flip]");
    if (!logoStage) return;

    const logoFront = logoStage.querySelector(".logo-front");
    const logoBack = logoStage.querySelector(".logo-back");
    if (!logoFront || !logoBack) return;

    const logoLinks = Array.from(logoBack.querySelectorAll("a"));
    function setLogoFlipped(isFlipped) {
        logoStage.classList.toggle("is-flipped", isFlipped);
        logoFront.setAttribute("aria-expanded", String(isFlipped));
        logoBack.setAttribute("aria-hidden", String(!isFlipped));
        logoLinks.forEach((link) => {
            link.setAttribute("tabindex", isFlipped ? "0" : "-1");
        });
    }

    logoFront.addEventListener("click", (event) => {
        setLogoFlipped(true);
        if (event.detail === 0 && logoLinks[0]) logoLinks[0].focus();
    });

    logoBack.addEventListener("click", (event) => {
        if (!event.target.closest("a")) setLogoFlipped(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setLogoFlipped(false);
    });

    setLogoFlipped(false);
}

window.addEventListener("DOMContentLoaded", () => {
    setupAudio();
    setupLogoFlip();
});
