const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

canvas.width = 1024 * dpr;
canvas.height = 576 * dpr;

// Sound declarations
const jumpSound = new Audio("./sounds/jump.mp3");
const coinSound = new Audio("./sounds/coin.mp3");
const gameOverSound = new Audio("./sounds/game-over.mp3");
const gameWonSound = new Audio("./sounds/game-won.mp3");
const playerHitSound = new Audio("./sounds/player-hit.mp3");
const popSound = new Audio("./sounds/pop.mp3");
const backgroundMusic = new Audio("./sounds/background-music.ogg");

// Menu
let gameState = "menu"; // "menu", "playing", "won", or "lost"

// Global visibility detection
let isGamePaused = false;

// Menu text
const menuText =
    "Objective: Collect all 42 gems without dying. Jump on enemies to defeat them. Press Enter to continue...";

// Submenu text
const submenuText =
    "Controls: Use arrow keys to move character or ESC for main menu. Press Enter to START!";

const oceanLayerData = {
    l_New_Layer_1: l_New_Layer_1,
};

const brambleLayerData = {
    l_New_Layer_2: l_New_Layer_2,
};

const layersData = {
    l_New_Layer_8: l_New_Layer_8,
    l_Back_Tiles: l_Back_Tiles,
    l_Decorations: l_Decorations,
    l_Front_Tiles: l_Front_Tiles,
    l_Shrooms: l_Shrooms,
    l_Collisions: l_Collisions,
    l_Grass: l_Grass,
    l_Tress: l_Trees,
};

const tilesets = {
    l_New_Layer_1: { imageUrl: "./images/decorations.png", tileSize: 16 },
    l_New_Layer_2: { imageUrl: "./images/decorations.png", tileSize: 16 },
    l_New_Layer_8: { imageUrl: "./images/tileset.png", tileSize: 16 },
    l_Back_Tiles: { imageUrl: "./images/tileset.png", tileSize: 16 },
    l_Decorations: { imageUrl: "./images/decorations.png", tileSize: 16 },
    l_Front_Tiles: { imageUrl: "./images/tileset.png", tileSize: 16 },
    l_Shrooms: { imageUrl: "./images/decorations.png", tileSize: 16 },
    l_Collisions: { imageUrl: "./images/decorations.png", tileSize: 16 },
    l_Grass: { imageUrl: "./images/tileset.png", tileSize: 16 },
    l_Trees: { imageUrl: "./images/decorations.png", tileSize: 16 },
};

// Tile setup
const collisionBlocks = [];
const platforms = [];
const blockSize = 16;

collisions.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 1) {
            collisionBlocks.push(
                new CollisionBlock({
                    x: x * blockSize,
                    y: y * blockSize,
                    size: blockSize,
                })
            );
        } else if (symbol === 2) {
            platforms.push(
                new Platform({
                    x: x * blockSize,
                    y: y * blockSize + blockSize,
                    width: 16,
                    height: 4,
                })
            );
        }
    });
});

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
    tilesData.forEach((row, y) => {
        row.forEach((symbol, x) => {
            if (symbol !== 0) {
                const srcX =
                    ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize;
                const srcY =
                    Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) *
                    tileSize;

                context.drawImage(
                    tilesetImage,
                    srcX,
                    srcY,
                    tileSize,
                    tileSize,
                    x * 16,
                    y * 16,
                    16,
                    16
                );
            }
        });
    });
};

const renderStaticLayers = async (layersData) => {
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenContext = offscreenCanvas.getContext("2d");

    for (const [layerName, tilesData] of Object.entries(layersData)) {
        const tilesetInfo = tilesets[layerName];
        if (tilesetInfo) {
            try {
                const tilesetImage = await loadImage(tilesetInfo.imageUrl);
                renderLayer(
                    tilesData,
                    tilesetImage,
                    tilesetInfo.tileSize,
                    offscreenContext
                );
            } catch (error) {
                console.error(
                    `Failed to load image for layer ${layerName}:`,
                    error
                );
            }
        }
    }

    return offscreenCanvas;
};
// END - Tile setup

// Change xy coordinates to move player's default position
let player = new Player({
    x: 20,
    y: 225,
    size: 32,
    velocity: { x: 0, y: 0 },
});

let oposums = [
    new Oposum({
        x: 650,
        y: 220,
        width: 36,
        height: 28,
    }),
    new Oposum({
        x: 425,
        y: 250,
        width: 36,
        height: 28,
    }),
    new Oposum({
        x: 600,
        y: 220,
        width: 36,
        height: 28,
    }),
    new Oposum({
        x: 325,
        y: 250,
        width: 36,
        height: 28,
    }),
    new Oposum({
        x: 1080,
        y: 280,
        width: 36,
        height: 28,
    }),
    new Oposum({
        x: 1600,
        y: 220,
        width: 36,
        height: 28,
    }),
    new Oposum({
        x: 900,
        y: 540,
        width: 36,
        height: 28,
    }),
    new Oposum({
        x: 1150,
        y: 540,
        width: 36,
        height: 28,
    }),
];

let sprites = [];

let hearts = [
    new Heart({
        x: 10,
        y: 10,
        width: 21,
        height: 18,
        imageSrc: "./images/hearts.png",
        spriteCropbox: {
            x: 0,
            y: 0,
            width: 21,
            height: 18,
            frames: 6,
        },
    }),
    new Heart({
        x: 33,
        y: 10,
        width: 21,
        height: 18,
        imageSrc: "./images/hearts.png",
        spriteCropbox: {
            x: 0,
            y: 0,
            width: 21,
            height: 18,
            frames: 6,
        },
    }),
    new Heart({
        x: 56,
        y: 10,
        width: 21,
        height: 18,
        imageSrc: "./images/hearts.png",
        spriteCropbox: {
            x: 0,
            y: 0,
            width: 21,
            height: 18,
            frames: 6,
        },
    }),
];

const keys = {
    left: {
        pressed: false,
    },
    right: {
        pressed: false,
    },
    up: {
        pressed: false,
    },
};

let lastTime = performance.now();
let camera = {
    x: 0,
    y: 0,
};

const SCROLL_POST_RIGHT = 330;
const SCROLL_POST_TOP = 100;
const SCROLL_POST_BOTTOM = 240;
let oceanBackgroundCanvas = null;
let brambleBackgroundCanvas = null;
let gems = [];
let gemUI = new Sprite({
    x: 12,
    y: 36,
    width: 15,
    height: 13,
    imageSrc: "./images/gem.png",
    spriteCropbox: {
        x: 0,
        y: 0,
        width: 15,
        height: 13,
        frames: 5,
    },
});

let gemCount = 0;

function init() {
    gems = [];
    gemCount = 0;
    gemUI = new Sprite({
        x: 12,
        y: 36,
        width: 15,
        height: 13,
        imageSrc: "./images/gem.png",
        spriteCropbox: {
            x: 0,
            y: 0,
            width: 15,
            height: 13,
            frames: 5,
        },
    });

    l_Gems.forEach((row, y) => {
        row.forEach((symbol, x) => {
            if (symbol === 18) {
                gems.push(
                    new Sprite({
                        x: x * 16,
                        y: y * 16,
                        width: 15,
                        height: 13,
                        imageSrc: "./images/gem.png",
                        spriteCropbox: {
                            x: 0,
                            y: 0,
                            width: 15,
                            height: 13,
                            frames: 5,
                        },
                        hitbox: {
                            x: x * 16,
                            y: y * 16,
                            width: 15,
                            height: 13,
                        },
                    })
                );
            }
        });
    });

    player = new Player({
        x: 20,
        y: 225,
        size: 32,
        velocity: { x: 0, y: 0 },
    });

    oposums = [
        new Oposum({
            x: 650,
            y: 220,
            width: 36,
            height: 28,
        }),
        new Oposum({
            x: 425,
            y: 250,
            width: 36,
            height: 28,
        }),
        new Oposum({
            x: 600,
            y: 220,
            width: 36,
            height: 28,
        }),
        new Oposum({
            x: 325,
            y: 250,
            width: 36,
            height: 28,
        }),
        new Oposum({
            x: 1080,
            y: 280,
            width: 36,
            height: 28,
        }),
        new Oposum({
            x: 1600,
            y: 220,
            width: 36,
            height: 28,
        }),
        new Oposum({
            x: 900,
            y: 540,
            width: 36,
            height: 28,
        }),
        new Oposum({
            x: 1150,
            y: 540,
            width: 36,
            height: 28,
        }),
    ];

    sprites = [];

    hearts = [
        new Heart({
            x: 10,
            y: 10,
            width: 21,
            height: 18,
            imageSrc: "./images/hearts.png",
            spriteCropbox: {
                x: 0,
                y: 0,
                width: 21,
                height: 18,
                frames: 6,
            },
        }),
        new Heart({
            x: 33,
            y: 10,
            width: 21,
            height: 18,
            imageSrc: "./images/hearts.png",
            spriteCropbox: {
                x: 0,
                y: 0,
                width: 21,
                height: 18,
                frames: 6,
            },
        }),
        new Heart({
            x: 56,
            y: 10,
            width: 21,
            height: 18,
            imageSrc: "./images/hearts.png",
            spriteCropbox: {
                x: 0,
                y: 0,
                width: 21,
                height: 18,
                frames: 6,
            },
        }),
    ];
    camera = {
        x: 0,
        y: 0,
    };

    backgroundMusic.currentTime = 0;
    backgroundMusic.volume = 0.1;
    backgroundMusic.play();
}

// Game loop
function animate(backgroundCanvas) {
    // Exit the loop when the game is paused
    if (isGamePaused) {
        requestAnimationFrame(() => animate(backgroundCanvas));
        return;
    }

    // Calculate delta time
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    c.clearRect(0, 0, canvas.width, canvas.height);

    // Menu
    if (gameState === "menu") {
        // Menu text style
        const menuTextStyle = {
            font: "40px Arial",
            color: "white",
            textAlign: "center",
            textBaseline: "middle",
        };

        // Draw background fox image
        canvas.classList.add("menu-background");

        // Draw the menu background
        c.fillStyle = "rgba(0, 0, 0, 0.7)";
        c.fillRect(0, 0, canvas.width, canvas.height);

        // Set the background color for the menu text
        c.fillStyle = "#333"; // Background color for the text
        const textWidth = c.measureText(menuText).width; // Measure text width
        const textHeight = 40; // Approximate height of the text
        const textX = canvas.width / 2;
        const textY = canvas.height - 40;

        // Draw the rectangle behind the text
        c.fillRect(
            textX - textWidth / 2 - 10,
            textY - textHeight / 2 - 10,
            textWidth + 20,
            textHeight + 20
        );

        // Set the text color and other styles
        c.fillStyle = menuTextStyle.color; // Set text color to white
        c.font = menuTextStyle.font;
        c.textAlign = menuTextStyle.textAlign;
        c.textBaseline = menuTextStyle.textBaseline;

        // Optional stroke for better visibility
        c.strokeStyle = "black";
        c.lineWidth = 2;
        c.strokeText(menuText, textX, textY);
        c.fillText(menuText, textX, textY);
    } else if (gameState === "submenu") {
        // Menu text style
        const submenuTextStyle = {
            font: "40px Arial",
            color: "white",
            textAlign: "center",
            textBaseline: "middle",
        };

        // Draw background fox image
        canvas.classList.add("menu-background");

        // Draw the menu background
        c.fillStyle = "rgba(0, 0, 0, 0.7)";
        c.fillRect(0, 0, canvas.width, canvas.height);

        // Set the background color for the menu text
        c.fillStyle = "#333"; // Background color for the text
        const textWidth = c.measureText(submenuText).width; // Measure text width
        const textHeight = 40; // Approximate height of the text
        const textX = canvas.width / 2;
        const textY = canvas.height - 40;

        // Draw the rectangle behind the text
        c.fillRect(
            textX - textWidth / 2 - 10,
            textY - textHeight / 2 - 10,
            textWidth + 20,
            textHeight + 20
        );

        // Set the text color and other styles
        c.fillStyle = submenuTextStyle.color; // Set text color to white
        c.font = submenuTextStyle.font;
        c.textAlign = submenuTextStyle.textAlign;
        c.textBaseline = submenuTextStyle.textBaseline;

        // Optional stroke for better visibility
        c.strokeStyle = "black";
        c.lineWidth = 2;
        c.strokeText(submenuText, textX, textY);
        c.fillText(submenuText, textX, textY);
    } else if (gameState === "playing") {
        // Reset to default text style
        c.fillStyle = "black";
        c.font = "12px Arial";
        c.textBaseline = "alphabetic";

        // Update player position
        player.handleInput(keys);
        player.update(deltaTime, collisionBlocks);

        // Update oposums
        for (let i = oposums.length - 1; i >= 0; --i) {
            const oposum = oposums[i];
            oposum.update(deltaTime, collisionBlocks);

            // Jump on enemy
            const collisionDirection = checkCollisions(player, oposum);
            if (collisionDirection) {
                if (collisionDirection === "bottom" && !player.isOnGround) {
                    player.velocity.y = -200;
                    sprites.push(
                        new Sprite({
                            x: oposum.x,
                            y: oposum.y,
                            width: 32,
                            height: 32,
                            imageSrc: "./images/enemy-death.png",
                            spriteCropbox: {
                                x: 0,
                                y: 0,
                                width: 40,
                                height: 41,
                                frames: 6,
                            },
                        })
                    );
                    oposums.splice(i, 1);
                    popSound.volume = 0.15;
                    popSound.play();
                } else if (
                    collisionDirection === "left" ||
                    collisionDirection === "right"
                ) {
                    const fullHearts = hearts.filter((heart) => {
                        return !heart.depleted;
                    });
                    if (!player.isInvincible && fullHearts.length > 0) {
                        fullHearts[fullHearts.length - 1].depleted = true;
                        playerHitSound.volume = 0.5;
                        player.setIsInvincible();
                        playerHitSound.play();
                    } else if (fullHearts.length === 0) {
                        backgroundMusic.pause();
                        backgroundMusic.currentTime = 0;
                        gameOverSound.volume = 0.25;
                        gameOverSound.play();
                        gameState = "lost";
                    }
                }
            }
        }

        // Update sprites
        for (let i = sprites.length - 1; i >= 0; --i) {
            const sprite = sprites[i];
            sprite.update(deltaTime);

            if (sprite.iteration === 1) {
                sprites.splice(i, 1);
            }
        }

        // Update gems
        for (let i = gems.length - 1; i >= 0; --i) {
            const gem = gems[i];
            gem.update(deltaTime);

            // This is where we are collecting gems
            const collisionDirection = checkCollisions(player, gem);
            if (collisionDirection) {
                // create an item feedback animation
                sprites.push(
                    new Sprite({
                        x: gem.x - 8,
                        y: gem.y - 8,
                        width: 32,
                        height: 32,
                        imageSrc: "./images/item-feedback.png",
                        spriteCropbox: {
                            x: 0,
                            y: 0,
                            width: 32,
                            height: 32,
                            frames: 5,
                        },
                    })
                );
                // remove a gem from game on collision
                gems.splice(i, 1);
                ++gemCount;
                coinSound.currentTime = 0;
                coinSound.volume = 0.25;
                coinSound.play();

                // Winning condition - acquire all gems
                if (gems.length === 0) {
                    backgroundMusic.pause();
                    gameWonSound.volume = 0.25;
                    gameWonSound.play();
                    gameState = "won";
                }
            }
        }

        // Track scroll post distance
        if (player.x > SCROLL_POST_RIGHT && player.x < 1680) {
            const scrollPostDistance = player.x - SCROLL_POST_RIGHT;
            camera.x = scrollPostDistance;
        }
        if (player.y < SCROLL_POST_TOP && camera.y > 0) {
            const scrollPostDistance = SCROLL_POST_TOP - player.y;
            camera.y = scrollPostDistance;
        }
        if (player.y > SCROLL_POST_BOTTOM) {
            const scrollPostDistance = player.y - SCROLL_POST_BOTTOM;
            camera.y = -scrollPostDistance;
        }

        // Render scene
        c.save();
        c.scale(dpr + 1, dpr + 1);
        c.translate(-camera.x, camera.y);
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.drawImage(oceanBackgroundCanvas, camera.x * 0.32, 0);
        c.drawImage(brambleBackgroundCanvas, camera.x * 0.16, 0);
        c.drawImage(backgroundCanvas, 0, 0);
        player.draw(c);
        for (let i = oposums.length - 1; i >= 0; --i) {
            const oposum = oposums[i];
            oposum.draw(c);
        }
        for (let i = sprites.length - 1; i >= 0; --i) {
            const sprite = sprites[i];
            sprite.draw(c);
        }
        for (let i = gems.length - 1; i >= 0; --i) {
            const gem = gems[i];
            gem.draw(c);
        }
        c.restore();

        // UI save and restore
        c.save();
        c.scale(dpr + 1, dpr + 1);
        for (let i = hearts.length - 1; i >= 0; --i) {
            const heart = hearts[i];
            heart.draw(c);
        }
        gemUI.draw(c);
        c.fillText(gemCount, 33, 46);
        c.restore();
    } else if (gameState === "won") {
        // Draw win message
        c.fillStyle = "rgba(0, 0, 0, 0.7)";
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.fillStyle = "white";
        c.font = "40px Arial";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(
            "Congratulations, you beat the demo!",
            canvas.width / 2,
            canvas.height / 2
        );
        c.font = "24px Arial";
        c.fillText(
            "Press Enter to return to the menu",
            canvas.width / 2,
            canvas.height / 2 + 40
        );
    } else if (gameState === "lost") {
        // Draw lost message
        c.fillStyle = "rgba(0, 0, 0, 0.7)";
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.fillStyle = "white";
        c.font = "40px Arial";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(
            "You ran out of lives! Better luck next time.",
            canvas.width / 2,
            canvas.height / 2
        );
        c.font = "24px Arial";
        c.fillText(
            "Press Enter to return to the menu",
            canvas.width / 2,
            canvas.height / 2 + 40
        );
    }

    requestAnimationFrame(() => animate(backgroundCanvas));
}

const startRendering = async () => {
    try {
        oceanBackgroundCanvas = await renderStaticLayers(oceanLayerData);
        brambleBackgroundCanvas = await renderStaticLayers(brambleLayerData);
        const backgroundCanvas = await renderStaticLayers(layersData);
        if (!backgroundCanvas) {
            console.error("Failed to create the background canvas");
            return;
        }

        animate(backgroundCanvas);
    } catch (error) {
        console.error("Error during rendering:", error);
    }
};

const handleKeyPress = (event) => {
    if (event.key === "Escape" && gameState === "playing") {
        // Stop the game and return to menu
        gameState = "menu";
        backgroundMusic.pause(); // Pause music if needed
        backgroundMusic.currentTime = 0; // Reset music if needed
        canvas.classList.add("menu-background"); // Return to menu background

        // Optionally reset game variables or call any cleanup functions
        resetGame();
    }

    if (event.key === "Enter") {
        if (gameState === "menu") {
            gameState = "submenu";
        } else if (gameState === "submenu") {
            gameState = "playing";
            init();
            canvas.classList.remove("menu-background");
        } else if (gameState === "won" || gameState === "lost") {
            gameState = "menu";
        }
    }
};

function resetGame() {
    // Reset player, enemies, gems, or any other game elements if needed
    oposums = []; // Reset enemy array
    gems = []; // Reset gems array
    gemCount = 0; // Reset gem counter
}

document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        isGamePaused = true;
        backgroundMusic.pause();
    } else {
        isGamePaused = false;
        if (gameState === "playing") {
            backgroundMusic.volume = 0.1;
            backgroundMusic.play();
        }
    }
});

// Event listener for key press
document.addEventListener("keydown", handleKeyPress);

startRendering();
