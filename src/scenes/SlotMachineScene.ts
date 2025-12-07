import { Application, Container, Text, TextStyle } from "pixi.js";
import { SlotMachine } from "../components/SlotMachine";
import { ImageButton } from "../components/ImageButton";
import { reroll_button_off, reroll_button_on } from "../AssetManager";

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
  private instructionText!: Text;
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
    const slotMachineHeight = this.slotMachine.height;
    this.slotMachine.position.set(
      -slotMachineWidth / 2,
      -slotMachineHeight / 2,
    ); // Position relative to container center
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
      text: `Przerzuty: ${this.rerollsRemaining}/${this.maxRerolls}`,
      style: rerollStyle,
    });

    this.rerollText.anchor.set(0.5, 1); // Anchor at bottom center of text
    this.rerollText.position.set(0, -slotMachineHeight / 2 - 10); // Above the machine
    this.addChild(this.rerollText);

    // Instruction Text
    const instructionStyle = new TextStyle({
      fontFamily: "Arial, sans-serif",
      fontSize: 16,
      fontWeight: "bold",
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 2 },
      wordWrap: true,
      wordWrapWidth: 400,
      align: "center",
    });

    this.instructionText = new Text({
      text: "Pociągnij za dźwignię, aby wylosować statystyki",
      style: instructionStyle,
    });
    this.instructionText.anchor.set(0.5, 1);
    this.instructionText.position.set(0, -slotMachineHeight / 2 - 40); // Above reroll text
    this.addChild(this.instructionText);

    this.createNextButton();

    // Start update loop
    this.app.ticker.add(this.update, this);
  }

  private createNextButton(): void {
    const slotMachineHeight = this.slotMachine.height;
    const buttonY = slotMachineHeight / 2; // Below the machine

    // Next Button - centered
    this.nextButton = new ImageButton({
      texture: reroll_button_off,
      activeTexture: reroll_button_on,
      width: 192,
      height: 60,
      onClick: () => {
        if (this.onNext) {
          this.onNext();
        }
      },
      hoverScale: false,
    });

    this.nextButton.position.set(0, buttonY - 30); // Centered horizontally
    this.addChild(this.nextButton);
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
    this.rerollText.text = `Przerzuty: ${this.rerollsRemaining}/${this.maxRerolls}`;

    // Hide instruction text on first roll
    if (this.instructionText.visible) {
      this.instructionText.visible = false;
    }

    // Pass target frame: 4 (5th sprite) if no rerolls left, 0 otherwise
    const targetFrame = this.rerollsRemaining === 0 ? 4 : 0;
    this.slotMachine.roll(targetFrame);
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
