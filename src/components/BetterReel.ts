import { Container, Text, TextStyle, BlurFilter, Graphics } from "pixi.js";

export interface ReelOptions {
  width: number;
  height: number;
  symbolHeight?: number;
  values?: number[];
}

export class BetterReel extends Container {
  private symbols: Text[] = [];
  private reelPosition: number = 0;
  private previousPosition: number = 0;
  private blur: BlurFilter;
  private symbolHeight: number;
  private values: number[];
  private tween: {
    active: boolean;
    start: number;
    time: number;
    propertyBeginValue: number;
    target: number;
    easing: (t: number) => number;
  } | null = null;

  constructor(options: ReelOptions) {
    super();

    this.symbolHeight = options.symbolHeight || 32;
    this.values = options.values || [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Clip mask
    const mask = new Graphics();
    mask.rect(0, 0, options.width, options.height);
    mask.fill({ color: 0xffffff });
    this.addChild(mask);
    this.mask = mask;

    // Blur filter
    this.blur = new BlurFilter();
    this.blur.blurX = 0;
    this.blur.blurY = 0;
    this.filters = [this.blur];

    this.createSymbols(options.width, options.height);
  }

  private createSymbols(width: number, height: number): void {
    const style = new TextStyle({
      fontFamily: "Arial, sans-serif",
      fontSize: 32,
      fontWeight: "bold",
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 2 },
      align: "center",
    });

    // How many symbols fit? + buffer
    const numSymbols = Math.ceil(height / this.symbolHeight) + 1;

    for (let i = 0; i < numSymbols; i++) {
      // Initial values
      const val = this.values[i % this.values.length];
      const text = new Text({ text: val.toString(), style });
      text.anchor.set(0.5);
      text.x = width / 2;
      this.symbols.push(text);
      this.addChild(text);
    }
  }

  public spin(targetValue?: number): void {
    if (this.tween && this.tween.active) return;

    const extraSpins = 5 + Math.floor(Math.random() * 3); // Spin at least 5 times full circle
    const totalValues = this.values.length;

    // Current "index" roughly
    const currentPos = Math.floor(this.reelPosition);

    // Calculate desired position to land targetValue in the middle (Slot 1)
    // Formula: (1 - targetPos) % totalValues == targetIndex
    // => targetPos == 1 - targetIndex
    let desiredRemainder = 0;
    if (targetValue !== undefined) {
      const targetIndex = this.values.indexOf(targetValue);
      if (targetIndex !== -1) {
        desiredRemainder = (1 - targetIndex) % totalValues;
        if (desiredRemainder < 0) desiredRemainder += totalValues;
      }
    } else {
      desiredRemainder = Math.floor(Math.random() * totalValues);
    }

    // Calculate target position
    // We want targetPos % totalValues == desiredRemainder
    const currentRemainder = currentPos % totalValues;
    let diff = desiredRemainder - currentRemainder;
    if (diff < 0) diff += totalValues;

    const targetPos = currentPos + diff + extraSpins * totalValues;

    const time = 2000 + Math.random() * 500;

    this.tween = {
      active: true,
      start: Date.now(),
      time: time,
      propertyBeginValue: this.reelPosition,
      target: targetPos,
      easing: this.backout(0.5),
    };
  }

  public update(deltaTime: number): void {
    // Handle Tween
    if (this.tween && this.tween.active) {
      const now = Date.now();
      const phase = Math.min(1, (now - this.tween.start) / this.tween.time);

      this.reelPosition = this.lerp(
        this.tween.propertyBeginValue,
        this.tween.target,
        this.tween.easing(phase),
      );

      if (phase === 1) {
        this.tween.active = false;
      }
    }

    void deltaTime;

    // Update Blur
    this.blur.blurY = (this.reelPosition - this.previousPosition) * 8;
    this.previousPosition = this.reelPosition;

    // Update Symbols
    const symbolSize = this.symbolHeight;
    const totalSymbols = this.symbols.length;
    const totalValues = this.values.length;

    for (let j = 0; j < totalSymbols; j++) {
      const s = this.symbols[j];
      const prevy = s.y;

      s.y =
        ((this.reelPosition + j) % totalSymbols) * symbolSize - symbolSize + 24;

      // Detect wrapping
      if (s.y < 0 && prevy > symbolSize) {
        // Symbol wrapped around to top
        // Set text deterministically based on reel position
        // The symbol entering at Top (Slot 0) should have value:
        // index = ( -floor(pos) ) % totalValues
        const currentPos = Math.floor(this.reelPosition);
        let valIndex = -currentPos % totalValues;
        if (valIndex < 0) valIndex += totalValues;

        s.text = this.values[valIndex].toString();
      }
    }
  }

  private lerp(a1: number, a2: number, t: number): number {
    return a1 * (1 - t) + a2 * t;
  }

  private backout(amount: number): (t: number) => number {
    return (t) => --t * t * ((amount + 1) * t + amount) + 1;
  }

  public get spinning(): boolean {
    return this.tween ? this.tween.active : false;
  }

  public setValue(value: number): void {
    // Find index of value
    const index = this.values.indexOf(value);
    if (index !== -1) {
      // Set position to show this value
      // Formula: s.y = ((this.reelPosition + j) % totalSymbols) * symbolSize - symbolSize;
      // We want the symbol at 'index' to be at y = height/2 (roughly)
      // Actually, let's just set reelPosition such that the target is at the "current" slot.
      // In update: s.y = ...
      // If reelPosition = -index, then (reelPosition + index) = 0.
      // 0 * size - size = -size (above view).
      // We want it visible.
      // Let's just set it to a value that aligns.
      // If we want it in the middle (say j=1 is middle for 3 visible items),
      // we want (pos + index) % total = 1.
      // pos = 1 - index.
      // Let's just try setting it to -index + 1 (assuming 3 visible items and we want middle).

      // Simpler: just set it to 0 for now or implement proper alignment later if needed.
      // For now, let's just set reelPosition.
      this.reelPosition = -index + 1;
      this.previousPosition = this.reelPosition;

      // Force update to place symbols
      this.update(0);
    }
  }
}
