import { Assets, Texture, Spritesheet } from "pixi.js";

export const button_test: Texture = await Assets.load(
  (await import("./assets/button_test.png")).default,
);

export const playButton: Texture = await Assets.load(
  (await import("./assets/graj.png")).default,
);
export const settingsButton: Texture = await Assets.load(
  (await import("./assets/ustaw.png")).default,
);
export const rankingButton: Texture = await Assets.load(
  (await import("./assets/rank.png")).default,
);
export const background: Texture = await Assets.load(
  (await import("./assets/bg.png")).default,
);
export const levelSelectBackground: Texture = await Assets.load(
  (await import("./assets/mapBG.png")).default,
);
export const bossBackground: Texture = await Assets.load(
  (await import("./assets/casinoBG.png")).default,
);

export const logo: Texture = await Assets.load(
  (await import("./assets/logo.png")).default,
);

export const bossbackground: Texture = await Assets.load(
  (await import("./assets/casinoBG.png")).default,
);

export const rock: Texture = await Assets.load(
  (await import("./assets/kamien.png")).default,
);

export const paper: Texture = await Assets.load(
  (await import("./assets/papier.png")).default,
);

export const scissors: Texture = await Assets.load(
  (await import("./assets/nozyce.png")).default,
);

// Load the sprite sheet texture
const slotySheetTexture: Texture = await Assets.load(
  (await import("./assets/sloty-Sheet.png")).default,
);

export const fleeButton: Texture = await Assets.load(
  (await import("./assets/flee.png")).default,
);

// Create spritesheet with 64x64px frames
const slotySheetData = {
  frames: {} as Record<
    string,
    {
      frame: { x: number; y: number; w: number; h: number };
      sourceSize: { w: number; h: number };
      spriteSourceSize: { x: number; y: number; w: number; h: number };
    }
  >,
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
export const reroll_button_off: Texture = await Assets.load(
  (await import("./assets/button_off.png")).default,
);

export const reroll_button_on: Texture = await Assets.load(
  (await import("./assets/button_on.png")).default,
);

export const casino_table_panel: Texture = await Assets.load(
  (await import("./assets/table.png")).default,
);

export const slashTexture: Texture = await Assets.load(
  (await import("./assets/slash-sprite.png")).default,
);
// --- DUCK BOSS ASSETS ---
export const duckIdle: Texture = await Assets.load(
  (await import("./assets/sheets/duckiduckduck.png")).default,
);

export const duckRock: Texture = await Assets.load(
  (await import("./assets/sheets/duck-rock.png")).default,
);

export const duckPaper: Texture = await Assets.load(
  (await import("./assets/sheets/duck-paper.png")).default,
);

export const duckScissors: Texture = await Assets.load(
  (await import("./assets/sheets/duck-scissors.png")).default,
);
