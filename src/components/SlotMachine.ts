import { Container, Sprite, Texture } from "pixi.js";
import { slotySheet } from "../AssetManager";
import { BetterReel } from "./BetterReel";
import UsersCharacter from "../data/UsersCharacter";

export interface SlotMachineOptions {
  onRollComplete?: (value: number) => void;
  onClick?: () => void;
}

/**
 * Slot machine component that displays 3 rolling numbers over a spritesheet background
 */
export class SlotMachine extends Container {
  private background: Sprite;
  private reels: BetterReel[] = [];
  private rolls: number[] = [1, 1, 1];
  private isRolling = false;
  private targetRolls: number[] = [1, 1, 1];
  private options: SlotMachineOptions;
  private availableFrames: Texture[] = [];
  private currentFrameIndex = 0;
  private backgroundAnimationTimer = 0; // New timer for background animation

  constructor(options: SlotMachineOptions) {
    super();
    this.options = options;

    // Get all available frames from the spritesheet
    this.availableFrames = Object.values(slotySheet.textures);

    // Use first frame from spritesheet as background
    this.background = new Sprite(this.availableFrames[0]);

    // Disable smoothing for crisp pixel art
    this.background.texture.source.scaleMode = "nearest";

    // Scale only the background by 3x
    this.background.scale.set(3);

    this.addChild(this.background);

    // Create rolling number displays
    // Position text over the 3 number slots in the spritesheet
    // Based on previous code:
    // yPos = this.background.height / 2 + 15;
    // startX = this.background.width / 5 - 4;
    // spacing = this.background.width / 5 - 2;

    const reelWidth = 40;
    const reelHeight = 40; // Visible area
    const yPos = this.background.height / 2 + 15 - reelHeight / 2; // Top-left of reel
    const startX = this.background.width / 5 - 4 - reelWidth / 2;
    const spacing = this.background.width / 5 - 2;

    for (let i = 0; i < 3; i++) {
      const reel = new BetterReel({
        width: reelWidth,
        height: reelHeight,
        values: [1, 2, 3, 4, 5, 6],
        symbolHeight: 40, // Match visible height for single symbol view
      });
      reel.position.set(startX + spacing * i, yPos);
      this.addChild(reel);
      this.reels.push(reel);
    }

    // Make clickable
    this.eventMode = "static";
    this.cursor = "pointer";
    this.on("pointerdown", () => {
      // Cooldown - only allow clicks when not rolling
      if (!this.isRolling && this.options.onClick) {
        this.options.onClick();
      }
    });
  }

  /**
   * Start rolling animation
   */
  roll(targetFrame: number = 0): void {
    if (this.isRolling) return;

    this.isRolling = true;
    this.backgroundAnimationTimer = 0; // Reset background animation timer

    // Store target frame (0 for normal, 4 for no rerolls)
    this.currentFrameIndex = targetFrame;

    // Change cursor to indicate cooldown
    this.cursor = "not-allowed";

    // Generate target values (simulating dice rolls)
    this.targetRolls = this.generateRolls();

    // Start spinning all reels
    this.reels.forEach((reel, index) => {
      const val = this.targetRolls[index];
      const valIndex = val - 1;

      reel.spin(valIndex);
    });
  }

  /**
   * Generate 3 random dice rolls
   */
  private generateRolls(): number[] {
    const rolls = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];

    UsersCharacter.setAttack(rolls[0]);
    UsersCharacter.setHitPoints(rolls[1]);
    UsersCharacter.setDefense(rolls[2]);

    return rolls
  }

  /**
   * Update rolling animation
   */
  update(deltaTime: number): void {
    // Update reels
    this.reels.forEach((reel) => {
      reel.update(deltaTime);
    });

    if (!this.isRolling) return;

    this.backgroundAnimationTimer += deltaTime;

    // Update background animation
    const totalFrames = this.availableFrames.length;
    const animationDuration = 120; // Total duration for background cycle
    const framesPerCycle = Math.floor(animationDuration / totalFrames);

    // Calculate which frame to show based on time
    let frameIndex = Math.floor(this.backgroundAnimationTimer / framesPerCycle);

    // If target frame is not 0 (e.g., 4), cap the animation at that frame
    if (this.currentFrameIndex > 0) {
      frameIndex = Math.min(frameIndex, this.currentFrameIndex);
    } else {
      // Normal cycle - wrap around
      frameIndex = frameIndex % totalFrames;
    }

    // Update background texture
    this.background.texture = this.availableFrames[frameIndex];

    // Check if all reels are stopped
    const allStopped = this.reels.every((reel) => !reel.spinning);

    if (allStopped) {
      // Stop rolling and show final values
      this.rolls = [...this.targetRolls];
      this.isRolling = false;

      // Set to target frame (0 normally, 4 when out of rerolls)
      this.background.texture = this.availableFrames[this.currentFrameIndex];

      // Re-enable cursor
      this.cursor = "pointer";

      // Calculate final stat value
      const finalValue = this.rolls.reduce((sum, roll) => sum + roll, 0);

      // Notify callback
      if (this.options.onRollComplete) {
        this.options.onRollComplete(finalValue);
      }
    }
  }

  /**
   * Set stat value directly (for initialization)
   */
  setValue(value: number): void {
    // Distribute value across 3 dice as evenly as possible
    const avg = Math.floor(value / 3);
    const remainder = value % 3;

    this.rolls = [avg, avg, avg];
    for (let i = 0; i < remainder; i++) {
      this.rolls[i]++;
    }

    // Update reels to show these values immediately
    this.reels.forEach((reel, index) => {
      reel.setValue(this.rolls[index]);
    });
  }

  /**
   * Check if currently rolling
   */
  getRolling(): boolean {
    return this.isRolling;
  }
}
