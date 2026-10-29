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
    if (event.target.closest(".logo-links")) return;
    event.preventDefault();
    applyScrollDelta(event.deltaY);
}, { passive: false });

window.addEventListener("touchstart", (event) => {
    lastTouchY = event.touches[0]?.clientY ?? null;
}, { passive: true });

window.addEventListener("touchmove", (event) => {
    if (event.target.closest(".logo-links")) return;
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

    // Only the straight middle grows: the two angled ends retain the logo's geometry.
    const backShape = logoBack.querySelector(".logo-back-shape");
    const backOutline = logoBack.querySelector(".logo-back-outline");
    const backGradient = logoBack.querySelector("#logo-back-gradient");
    new ResizeObserver(() => {
        const height = logoBack.offsetHeight * 410 / logoBack.offsetWidth;
        backShape.setAttribute("viewBox", `0 0 410 ${height}`);
        backOutline.setAttribute("d", `M5 70.5V28.58L101 5H373L405 12.86V${height - 28.58}L309 ${height - 5}H37L5 ${height - 12.86}Z`);
        backGradient.setAttribute("y2", String(height));
    }).observe(logoBack);

    const linksPanel = logoBack.querySelector(".logo-links");
    function sizeExpandedPanel() {
        const style = getComputedStyle(logoBack);
        const height = linksPanel.scrollHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        logoStage.style.setProperty("--expanded-height", `${Math.ceil(height)}px`);
    }
    const panelObserver = new ResizeObserver(sizeExpandedPanel);
    panelObserver.observe(logoStage);
    panelObserver.observe(linksPanel);
    sizeExpandedPanel();

    const logoLinks = Array.from(logoBack.querySelectorAll("a"));
    let focusLinksAfterOpening = false;
    function setLogoFlipped(isFlipped) {
        if (!isFlipped) focusLinksAfterOpening = false;
        logoStage.classList.remove("is-expanded");
        linksPanel.scrollTop = 0;
        logoStage.classList.toggle("is-flipped", isFlipped);
        if (isFlipped && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            logoStage.classList.add("is-expanded");
        }
        logoFront.setAttribute("aria-expanded", String(isFlipped));
        logoBack.setAttribute("aria-hidden", String(!isFlipped));
        logoFront.tabIndex = isFlipped ? -1 : 0;
        logoLinks.forEach((link) => {
            link.setAttribute("tabindex", isFlipped ? "0" : "-1");
        });
    }

    logoFront.addEventListener("click", (event) => {
        setLogoFlipped(true);
        focusLinksAfterOpening = event.detail === 0;
        if (focusLinksAfterOpening && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            logoLinks[0]?.focus();
            focusLinksAfterOpening = false;
        }
    });

    logoBack.addEventListener("transitionend", (event) => {
        if (event.target !== logoBack || event.propertyName !== "height") return;
        logoStage.classList.toggle("is-expanded", logoStage.classList.contains("is-flipped"));
        if (focusLinksAfterOpening) {
            logoLinks[0]?.focus();
            focusLinksAfterOpening = false;
        }
    });

    logoBack.addEventListener("click", (event) => {
        if (!event.target.closest("a")) setLogoFlipped(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && logoStage.classList.contains("is-flipped")) {
            setLogoFlipped(false);
            logoFront.focus();
        }
    });

    setLogoFlipped(false);
}

window.addEventListener("DOMContentLoaded", () => {
    setupAudio();
    setupLogoFlip();
});
