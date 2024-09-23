window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
            player.jump();
            keys.up.pressed = true;
            break;
        case "ArrowLeft":
            keys.left.pressed = true;
            break;
        case "ArrowRight":
            keys.right.pressed = true;
            break;
    }
});

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            keys.left.pressed = false;
            break;
        case "ArrowRight":
            keys.right.pressed = false;
            break;
    }
});

// On return to game's tab, ensure delta time is reset
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        lastTime = performance.now();
    }
});
