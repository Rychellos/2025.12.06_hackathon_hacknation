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

  public spin(targetIndex?: number): void {
    if (this.tween && this.tween.active) return;

    const extraSpins = 5 + Math.floor(Math.random() * 3); // Spin at least 5 times full circle
    const totalSymbols = this.values.length;

    // Current "index" roughly
    const currentIdx = Math.floor(this.reelPosition);

    // Calculate target position
    // We want to land such that (targetPos % totalSymbols) corresponds to targetIndex.
    // But wait, the display logic is:
    // s.y = ((this.reelPosition + j) % totalSymbols) * symbolSize - symbolSize;
    // We want the symbol at `targetIndex` to be at a specific y (e.g. middle).
    // Let's say we want it at j=1 (middle of 3 visible).
    // ((targetPos + 1) % totalSymbols) == targetIndex.
    // targetPos + 1 = k * totalSymbols + targetIndex
    // targetPos = k * totalSymbols + targetIndex - 1.

    // Let's find the next multiple of totalSymbols that is far enough away.
    let targetPos = currentIdx + extraSpins * totalSymbols;

    if (targetIndex !== undefined) {
      // Align to targetIndex
      // We want targetPos % totalSymbols == targetIndex - 1 (to center it at j=1)
      // Note: targetIndex is 0-based index of the value in `values`.

      // Current targetPos might not be aligned.
      // Let's adjust it.
      const desiredRemainder = (targetIndex - 1 + totalSymbols) % totalSymbols;
      const currentRemainder = targetPos % totalSymbols;

      let diff = desiredRemainder - currentRemainder;
      if (diff < 0) diff += totalSymbols;

      targetPos += diff;
    } else {
      targetPos += Math.floor(Math.random() * totalSymbols);
    }

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
    } else {
      // Use deltaTime to avoid unused var error if no tween (or just ignore it)
      // Actually, we don't need deltaTime for the tween logic as it uses Date.now()
      // But we might want to use it for something else later.
      // For now, let's just log it or ignore it properly.
      // Or better, just remove the parameter if not needed, but update signature usually requires it.
      // Let's just use it in a dummy way or disable the rule for the line.
      // Or better:
      // this.velocity += deltaTime * 0;
    }

    // Use deltaTime for something or remove it?
    // The snippet uses app.ticker.add(() => ...) which doesn't use delta.
    // But our update method signature has it.
    // Let's just suppress the lint error for now or remove the arg if possible.
    // But SlotMachine calls it with delta.
    // Let's just use `void deltaTime;`
    void deltaTime;

    // Update Blur
    this.blur.blurY = (this.reelPosition - this.previousPosition) * 8;
    this.previousPosition = this.reelPosition;

    // Update Symbols
    const symbolSize = this.symbolHeight;
    const totalSymbols = this.symbols.length;

    for (let j = 0; j < totalSymbols; j++) {
      const s = this.symbols[j];
      const prevy = s.y;

      // Position formula from snippet
      // s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
      // Note: snippet has `r.position` increasing.
      // (pos + j) % count -> 0..count-1
      // times size -> 0..totalHeight
      // minus size -> shift up one slot (so one is above view)

      s.y =
        ((this.reelPosition + j) % totalSymbols) * symbolSize - symbolSize + 24;

      // Detect wrapping
      if (s.y < 0 && prevy > symbolSize) {
        // Symbol wrapped around to top
        // Here we can swap the value!
        // Pick a random value from our list
        const randomVal =
          this.values[Math.floor(Math.random() * this.values.length)];
        s.text = randomVal.toString();
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
