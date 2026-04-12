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

    const playRetryEvents = [
        "click",
        "keydown",
        "mousedown",
        "mousemove",
        "pointerdown",
        "pointermove",
        "scroll",
        "touchmove",
        "touchstart",
        "wheel",
    ];

    function syncMuteState() {
        muteButton.classList.toggle("is-muted", music.muted);
        muteButton.setAttribute("aria-pressed", String(music.muted));
        muteButton.setAttribute("aria-label", music.muted ? "Unmute music" : "Mute music");
    }

    function playMusic() {
        const playAttempt = music.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt
                .then(() => {
                    playRetryEvents.forEach((eventName) => {
                        window.removeEventListener(eventName, playMusic);
                    });
                })
                .catch(() => {});
        }
    }

    music.volume = 1;
    muteButton.addEventListener("click", () => {
        music.muted = !music.muted;
        syncMuteState();
        playMusic();
    });

    playRetryEvents.forEach((eventName) => {
        window.addEventListener(eventName, playMusic, { passive: true });
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
