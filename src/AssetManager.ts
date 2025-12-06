import { Assets, Texture, Spritesheet } from "pixi.js";

export const button_test: Texture = await Assets.load((await import("./assets/button_test.png")).default);

export const playButton: Texture = await Assets.load((await import("./assets/graj.png")).default);
export const settingsButton: Texture = await Assets.load((await import("./assets/ustaw.png")).default);
export const rankingButton: Texture = await Assets.load((await import("./assets/rank.png")).default);
export const background: Texture = await Assets.load((await import("./assets/bg.png")).default);

// Load the sprite sheet texture
const slotySheetTexture: Texture = await Assets.load((await import("./assets/sloty-Sheet.png")).default);

// Create spritesheet with 64x64px frames
const slotySheetData = {
    frames: {} as Record<string, {
        frame: { x: number; y: number; w: number; h: number };
        sourceSize: { w: number; h: number };
        spriteSourceSize: { x: number; y: number; w: number; h: number };
    }>,
    meta: {
        scale: "1",
    },
};

// Calculate number of frames based on texture size
const frameWidth = 64;
const frameHeight = 64;
const cols = Math.floor(slotySheetTexture.width / frameWidth);
const rows = Math.floor(slotySheetTexture.height / frameHeight);

// Generate frame data for each 64x64 cell
let frameIndex = 0;
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const frameName = `frame_${frameIndex}`;
        slotySheetData.frames[frameName] = {
            frame: {
                x: col * frameWidth,
                y: row * frameHeight,
                w: frameWidth,
                h: frameHeight,
            },
            sourceSize: { w: frameWidth, h: frameHeight },
            spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
        };
        frameIndex++;
    }
}

// Create and parse the spritesheet
export const slotySheet = new Spritesheet(slotySheetTexture, slotySheetData);
await slotySheet.parse();

// Slot machine and reroll button textures
export const brown_slot_box: Texture = await Assets.load("/assets/brown_slot_box.png");
export const reroll_button: Texture = await Assets.load("/assets/reroll_button.png");
export const reroll_button_hover: Texture = await Assets.load("/assets/reroll_button_hover.png");
export const casino_table_panel: Texture = await Assets.load("/assets/casino_table_panel.png");
export const logo: Texture = await Assets.load("/assets/logo.png");