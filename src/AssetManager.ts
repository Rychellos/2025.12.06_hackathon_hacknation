import { Assets, Texture } from "pixi.js";

export const button_test: Texture = await Assets.load((await import("./assets/button_test.png")).default);

export const playButton: Texture = await Assets.load((await import("./assets/graj.png")).default);
export const settingsButton: Texture = await Assets.load((await import("./assets/ustaw.png")).default);
export const rankingButton: Texture = await Assets.load((await import("./assets/rank.png")).default);
export const background: Texture = await Assets.load((await import("./assets/bg.png")).default);

// Slot machine and reroll button textures
export const brown_slot_box: Texture = await Assets.load("/assets/brown_slot_box.png");
export const reroll_button: Texture = await Assets.load("/assets/reroll_button.png");
export const reroll_button_hover: Texture = await Assets.load("/assets/reroll_button_hover.png");
export const casino_table_panel: Texture = await Assets.load("/assets/casino_table_panel.png");