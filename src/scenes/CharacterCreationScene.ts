import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { MenuButton } from "../components/MenuButton";
import { Character } from "../CharacterUtils";
import { SlotMachineScene } from "./SlotMachineScene";

/**
 * Enhanced character creation scene with slot machines
 */
export class CharacterCreationScene extends Container {
  private app: Application;
  private character: Character;
  private slotMachineScene!: SlotMachineScene;
  private onComplete?: (character: Character) => void;
  private onBack?: () => void;

  constructor(
    app: Application,
    onComplete?: (character: Character) => void,
    onBack?: () => void,
  ) {
    super();
    this.app = app;
    this.onComplete = onComplete;
    this.onBack = onBack;

    // Initialize character with default stats
    this.character = {
      stats: {
        attack: { label: "Attack", value: 10 },
        defense: { label: "Defense", value: 10 },
        hitPoints: { label: "Hit Points", value: 10 },
      },
    };

    this.createBackground();
    this.createTitle();
    this.createSlotMachineScene();
    this.createButtons();
    this.createInstructions();

    // Automatically start rolling on load
    setTimeout(() => {
      this.slotMachineScene.performInitialRoll();
    }, 500);
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.fill({
      color: 0x0a0e27,
    });
    this.addChild(bg);

    // Add decorative elements
    const decoration = new Graphics();
    decoration.circle(100, 100, 150);
    decoration.fill({
      color: 0x1a1a3e,
      alpha: 0.3,
    });
    this.addChild(decoration);

    const decoration2 = new Graphics();
    decoration2.circle(
      this.app.screen.width - 100,
      this.app.screen.height - 100,
      200,
    );
    decoration2.fill({
      color: 0x1a1a3e,
      alpha: 0.2,
    });
    this.addChild(decoration2);
  }

  private createTitle(): void {
    const titleStyle = new TextStyle({
      fontFamily: "Arial, sans-serif",
      fontSize: 48,
      fontWeight: "bold",
      fill: 0xffffff,
      stroke: { color: 0x1a1a3e, width: 4 },
    });

    const title = new Text({
      text: "CHARACTER CREATION",
      style: titleStyle,
    });
    title.anchor.set(0.5);
    title.position.set(this.app.screen.width / 2, 80);
    this.addChild(title);
  }

  private createSlotMachineScene(): void {
    this.slotMachineScene = new SlotMachineScene({
      app: this.app,
      maxRerolls: 3,
      stats: [
        { key: "attack", label: "Attack", initialValue: 10 },
        { key: "defense", label: "Defense", initialValue: 10 },
        { key: "hitPoints", label: "Hit Points", initialValue: 10 },
      ],
    });

    // Position the slot machine scene
    const startX = this.app.screen.width / 2 - 140;
    const startY = 180;
    this.slotMachineScene.position.set(startX, startY);

    this.addChild(this.slotMachineScene);
  }

  private createButtons(): void {
    const centerX = this.app.screen.width / 2;
    const bottomY = this.app.screen.height - 150;

    // Accept Button
    const acceptButton = new MenuButton({
      label: "✓ ACCEPT",
      width: 180,
      onClick: () => {
        console.log("Character accepted:", this.character);
        if (this.onComplete) {
          this.onComplete(this.character);
        }
      },
    });
    acceptButton.position.set(centerX - 90, bottomY);
    this.addChild(acceptButton);

    // Back Button
    const backButton = new MenuButton({
      label: "← BACK",
      width: 150,
      onClick: () => {
        if (this.onBack) {
          this.onBack();
        }
      },
    });
    backButton.position.set(centerX + 100, bottomY);
    this.addChild(backButton);
  }

  private createInstructions(): void {
    const instructionStyle = new TextStyle({
      fontFamily: "Arial, sans-serif",
      fontSize: 16,
      fill: 0xaaaaaa,
      align: "center",
    });

    const instructions = new Text({
      text: "Each stat is rolled using 4d6 drop lowest\nYou have 3 rerolls to get the stats you want!",
      style: instructionStyle,
    });
    instructions.anchor.set(0.5);
    instructions.position.set(
      this.app.screen.width / 2,
      this.app.screen.height - 80,
    );
    this.addChild(instructions);
  }
}
