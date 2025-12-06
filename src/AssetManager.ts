import { Assets, Texture } from "pixi.js";

export const button_test: Texture = await Assets.load((await import("./assets/button_test.png")).default);

// Slot machine and reroll button textures
export const brown_slot_box: Texture = await Assets.load("/assets/brown_slot_box.png");
export const reroll_button: Texture = await Assets.load("/assets/reroll_button.png");
export const reroll_button_hover: Texture = await Assets.load("/assets/reroll_button_hover.png");