import { Application, Container, Text, TextStyle } from "pixi.js";
import { SlotMachine } from "../components/SlotMachine";
import { ImageButton } from "../components/ImageButton";
import { reroll_button, reroll_button_hover } from "../AssetManager";

export interface SlotMachineSceneOptions {
  app: Application;
  maxRerolls?: number;
  stats?: Array<{ key: string; label: string; initialValue?: number }>;
  onNext?: () => void;
  onRoll?: () => void;
}

/**
 * Reusable scene for displaying and managing multiple slot machines
 */
export class SlotMachineScene extends Container {
  private app: Application;
  private slotMachine: SlotMachine;
  private rerollsRemaining: number;
  private maxRerolls: number;
  private rerollText!: Text;
  private nextButton!: ImageButton;
  private onNext?: () => void;
  private onRoll?: () => void;

  constructor(options: SlotMachineSceneOptions) {
    super();

    this.app = options.app;
    this.maxRerolls = options.maxRerolls ?? 3;
    this.rerollsRemaining = this.maxRerolls;
    this.onNext = options.onNext;
    this.onRoll = options.onRoll;

    // Create single slot machine with click handler
    this.slotMachine = new SlotMachine({
      onRollComplete: (value) => {
        console.log(`Slot machine rolled: ${value}`);
        if (this.onRoll) {
          this.onRoll();
        }
      },
      onClick: () => this.rollStats(),
    });

    this.scale = 2;
    this.position.set(this.app.screen.width / 2, -500);

    const slotMachineWidth = this.slotMachine.width;
    this.slotMachine.position.set(-slotMachineWidth / 2, 0); // Position relative to container center
    this.addChild(this.slotMachine);

    // Create rerolls remaining text
    const rerollStyle = new TextStyle({
      fontFamily: "Arial, sans-serif",
      fontSize: 18,
      fontWeight: "bold",
      fill: 0xffd700,
      stroke: { color: 0x000000, width: 2 },
    });

    this.rerollText = new Text({
      text: `Rerolls: ${this.rerollsRemaining}/${this.maxRerolls}`,
      style: rerollStyle,
    });

    this.rerollText.anchor.set(0.5, 0); // Anchor at top center of text

    // Position at top center of the slot machine
    // this.rerollText.position.set(32, -10); // Centered, slightly above
    this.addChild(this.rerollText);

    this.createNextButton();

    // Start update loop
    this.app.ticker.add(this.update, this);
  }

  private createNextButton(): void {
    const buttonY = 175;

    // Next Button - centered
    this.nextButton = new ImageButton({
      texture: reroll_button,
      hoverTexture: reroll_button_hover,
      width: 200,
      height: 60,
      onClick: () => {
        if (this.onNext) {
          this.onNext();
        }
      },
    });

    this.nextButton.position.set(-100, buttonY); // Centered
    this.addChild(this.nextButton);

    // Add "NEXT" label
    const nextLabel = new Text({
      text: "NEXT →",
      style: new TextStyle({
        fontFamily: "Arial, sans-serif",
        fontSize: 24,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 2 },
      }),
    });

    nextLabel.anchor.set(0.5);
    nextLabel.position.set(0, buttonY + 30); // Centered
    this.addChild(nextLabel);
  }

  /**
   * Manually trigger a roll
   */
  public rollStats(): void {
    if (this.rerollsRemaining <= 0) {
      console.log("No rerolls remaining!");
      return;
    }

    if (this.slotMachine.getRolling()) {
      return;
    }

    this.rerollsRemaining--;
    this.rerollText.text = `Rerolls: ${this.rerollsRemaining}/${this.maxRerolls}`;

    // Pass target frame: 4 (5th sprite) if no rerolls left, 0 otherwise
    const targetFrame = this.rerollsRemaining === 0 ? 4 : 0;
    this.slotMachine.roll(targetFrame);
  }

  /**
   * Perform initial roll (doesn't count against reroll limit)
   */
  public performInitialRoll(): void {
    this.slotMachine.roll();
  }

  /**
   * Get current rerolls remaining
   */
  public getRerollsRemaining(): number {
    return this.rerollsRemaining;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private update(time: any): void {
    this.slotMachine.update(time.deltaTime);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  destroy(options?: any): void {
    this.app.ticker.remove(this.update, this);
    super.destroy(options);
  }
}
