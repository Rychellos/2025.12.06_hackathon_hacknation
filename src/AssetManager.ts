import { Assets, Texture } from "pixi.js";

export const button_test: Texture = await Assets.load((await import("./assets/button_test.png")).default);