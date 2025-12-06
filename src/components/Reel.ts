import { Container, Graphics, Text, TextStyle } from "pixi.js";

export interface ReelOptions {
  width: number;
  height: number;
  values?: number[]; // [1, 2, 3, 4, 5, 6]
}

export class Reel extends Container {
  private strip: Container;
  private _mask: Graphics;
  private symbolHeight: number;
  private isSpinning: boolean = false;
  private speed: number = 0;
  private targetValue: number | null = null;
  private values: number[];
  private stopping: boolean = false;

  constructor(options: ReelOptions) {
    super();

    this.values = options.values || [1, 2, 3, 4, 5, 6];
    this.symbolHeight = options.height;

    // Create mask
    this._mask = new Graphics();
    this._mask.rect(0, 0, options.width, options.height);
    this._mask.fill({ color: 0xffffff });
    this.addChild(this._mask);
    this.mask = this._mask;

    // Create strip
    this.strip = new Container();
    this.addChild(this.strip);

    this.createSymbols(options.width);
  }

  private createSymbols(width: number): void {
    const style = new TextStyle({
      fontFamily: "Arial, sans-serif",
      fontSize: 32,
      fontWeight: "bold",
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 2 },
      align: "center",
    });

    // Create 3 sets of numbers to allow seamless looping
    // Top buffer, Visible area, Bottom buffer
    const fullList = [...this.values, ...this.values, ...this.values];

    fullList.forEach((value, i) => {
      const text = new Text({ text: value.toString(), style });
      text.anchor.set(0.5);
      text.position.set(
        width / 2,
        i * this.symbolHeight + this.symbolHeight / 2,
      );
      this.strip.addChild(text);
    });

    // Start position (middle set)
    this.strip.y = -this.values.length * this.symbolHeight;
  }

  public spin(): void {
    this.isSpinning = true;
    this.stopping = false;
    this.targetValue = null;
    this.speed = 30 + Math.random() * 10; // Fast spin
  }

  public stop(value: number): void {
    this.targetValue = value;
    this.stopping = true;
  }

  public update(deltaTime: number): void {
    if (!this.isSpinning && !this.stopping) return;

    // Move strip
    this.strip.y += this.speed * deltaTime;

    const singleSetHeight = this.values.length * this.symbolHeight;

    // Loop logic
    if (this.strip.y > 0) {
      this.strip.y -= singleSetHeight;
    }

    if (this.stopping && this.targetValue !== null) {
      // Target Y position in the range [-singleSetHeight, 0]
      const valueIndex = this.values.indexOf(this.targetValue);
      const targetY = -1 * valueIndex * this.symbolHeight;

      // Calculate distance to target
      const dist = targetY - this.strip.y;

      // We only care if we are "just before" the target.
      // i.e. strip.y is slightly less than targetY

      if (dist > 0 && dist < 100) {
        // Slow down
        this.speed = Math.max(2, this.speed * 0.9);

        if (dist < 5) {
          this.strip.y = targetY;
          this.isSpinning = false;
          this.stopping = false;
          this.speed = 0;
        }
      } else {
        // Maintain speed if not close
        if (this.speed < 20) this.speed = 20;
      }
    }
  }

  public get spinning(): boolean {
    return this.isSpinning;
  }

  public setValue(value: number): void {
    // Force set the value without animation
    this.targetValue = value;
    const valueIndex = this.values.indexOf(value);
    const targetStripY =
      -1 * (this.values.length + valueIndex) * this.symbolHeight;
    this.strip.y = targetStripY;
    this.isSpinning = false;
    this.stopping = false;
    this.speed = 0;
  }
}
