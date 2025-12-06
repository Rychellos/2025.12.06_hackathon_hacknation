import {
  Application,
  Container,
  Text,
  TextStyle,
  Graphics,
  Sprite,
} from "pixi.js";
import { MenuButton } from "../components/MenuButton";

import { UnitDisplay } from "../components/UnitDisplay";
import { SlotMachineScene } from "./SlotMachineScene";
import { bossbackground, casino_table_panel } from "../AssetManager";
import { LevelSelectScene } from "./LevelSelectScene";
import { Background } from "../components/Background";

export class NumberGuessBossScene extends Container {
  private app: Application;
  private bossDisplay!: UnitDisplay;
  private playerDisplay!: UnitDisplay;
  private resultText!: Text;
  private choiceText!: Text;
  private background!: Background;

  constructor(app: Application) {
    super();
    this.app = app;

    this.createBackground();
    this.createUI();
    this.showSlotMachine();
  }

  private createBackground(): void {
    this.background = new Background({
      texture: bossbackground,
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.addChild(this.background);

    // Add a "floor" or visual separation for the battle arena style
    const floor = new Graphics();
    floor.ellipse(
      this.app.screen.width * 0.75,
      this.app.screen.height * 0.4,
      300,
      100,
    );
    floor.fill({ color: 0x000000, alpha: 0.3 });
    this.addChild(floor);
  }

  private createUI(): void {
    // --- BOSS AREA (Top Right) ---
    this.bossDisplay = new UnitDisplay({
      name: "NUMBER BOSS",
      maxHp: 100,
      currentHp: 100,
      maxShield: 50,
      currentShield: 50,
    });

    // Position top-right
    const bossX = this.app.screen.width * 0.75;
    const bossY = this.app.screen.height * 0.3;
    this.bossDisplay.position.set(bossX, bossY);
    this.addChild(this.bossDisplay);

    // --- CASINO TABLE (Bottom) ---
    const table = new Sprite(casino_table_panel);
    table.anchor.set(0.5, 1); // Anchor bottom center
    table.width = 1020;
    table.height = 300; // Adjust height to fit controls
    table.position.set(this.app.screen.width / 2, this.app.screen.height);
    this.addChild(table);

    // --- PLAYER AREA (Bottom Right of Table) ---
    this.playerDisplay = new UnitDisplay({
      name: "PLAYER",
      maxHp: 100,
      currentHp: 100,
      maxShield: 20,
      currentShield: 20,
      showVisual: false,
      nameColor: "#4ade80",
    });

    // Position on the right side of the table
    const playerX = this.app.screen.width * 0.75;
    const playerY = this.app.screen.height - 80;
    this.playerDisplay.position.set(playerX, playerY);
    this.addChild(this.playerDisplay);

    // --- PLAYER ACTION AREA (Bottom Left of Table) ---
    const actionPanelY = this.app.screen.height - 180;
    const actionPanelX = this.app.screen.width * 0.35; // Left Area

    // Container for action buttons
    const actionContainer = new Container();
    actionContainer.position.set(actionPanelX, actionPanelY);
    this.addChild(actionContainer);

    // Create 10 Lotto Spheres (1-10)
    for (let i = 1; i <= 10; i++) {
      const sphereContainer = new Container();

      // Visuals
      const radius = 30; // Radius of the sphere
      const ball = new Graphics();

      // Shadow (offset)
      ball.circle(2, 4, radius);
      ball.fill({ color: 0x000000, alpha: 0.3 });

      // Main Sphere (Yellow)
      ball.circle(0, 0, radius);
      ball.fill({ color: 0xffd700 }); // Gold/Yellow
      ball.stroke({ width: 2, color: 0xb8860b }); // Dark Golden Rod border

      // Shine (White highlight to make it look spherical)
      ball.ellipse(-radius * 0.3, -radius * 0.3, radius * 0.4, radius * 0.25);
      ball.fill({ color: 0xffffff, alpha: 0.6 });

      sphereContainer.addChild(ball);

      // Number Text
      const numStyle = new TextStyle({
        fontFamily: "Arial",
        fontSize: 28,
        fontWeight: "bold",
        fill: "#000000", // Black text
        align: "center",
      });
      const numText = new Text({ text: i.toString(), style: numStyle });
      numText.anchor.set(0.5);
      sphereContainer.addChild(numText);

      // Interaction
      sphereContainer.eventMode = "static";
      sphereContainer.cursor = "pointer";

      sphereContainer.on("pointerover", () => {
        sphereContainer.scale.set(1.1);
      });
      sphereContainer.on("pointerout", () => {
        sphereContainer.scale.set(1.0);
      });
      sphereContainer.on("pointerdown", () => {
        sphereContainer.scale.set(0.9);
        setTimeout(() => {
          sphereContainer.scale.set(1.0);
          this.play(i);
        }, 100);
      });

      // Positioning
      // 2 rows of 5
      const row = i <= 5 ? 0 : 1;
      const col = i <= 5 ? i - 1 : i - 6;

      const spacingX = 80;
      const spacingY = 80;

      // Centering logic
      // Total width of row = 4 * spacingX
      const totalRowWidth = 4 * spacingX;
      const startX = -totalRowWidth / 2;

      const x = startX + col * spacingX;
      // Adjust Y to center the group vertically in the available space
      const y = row * spacingY;

      sphereContainer.position.set(x, y);
      actionContainer.addChild(sphereContainer);
    }

    // --- INFO TEXTS ---

    // Title
    const titleStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: "bold",
      fill: "#8888aa",
    });
    const title = new Text({ text: "GUESS BOSS (1-10)", style: titleStyle });
    title.position.set(20, 80); // Below back button
    this.addChild(title);

    // Result Text (Center Screen, large overlay effect)
    const resultStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 64,
      fontWeight: "bold",
      fill: "#ffd700",
      stroke: { color: "#000000", width: 4 },
      dropShadow: {
        color: "#000000",
        blur: 4,
        angle: Math.PI / 6,
        distance: 6,
      },
      align: "center",
    });

    this.resultText = new Text({ text: "", style: resultStyle });
    this.resultText.anchor.set(0.5);
    this.resultText.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2 - 50,
    );
    this.addChild(this.resultText);

    // Choice Text (Message Log style above buttons)
    const choiceStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#ffffff",
      align: "center",
      fontStyle: "italic",
      dropShadow: {
        color: "#000000",
        blur: 2,
        distance: 2,
      },
    });

    this.choiceText = new Text({
      text: "Pick a number between 1 and 10...",
      style: choiceStyle,
    });
    this.choiceText.anchor.set(0.5, 1);
    this.choiceText.position.set(actionPanelX, actionPanelY - 20);
    this.addChild(this.choiceText);

    // Back Button
    const backBtn = new MenuButton({
      label: "← FLEE",
      width: 100,
      height: 40,
      onClick: () => {
        this.destroy();
        this.app.stage.addChild(new LevelSelectScene(this.app));
      },
    });
    backBtn.position.set(20, 20);
    this.addChild(backBtn);
  }

  private play(playerChoice: number): void {
    const bossChoice = Math.floor(Math.random() * 10) + 1; // 1-10

    this.choiceText.text = `You picked ${playerChoice}. Boss picked ${bossChoice}.`;

    const dmg = 10;

    if (playerChoice === bossChoice) {
      this.resultText.text = "CORRECT!";
      this.resultText.style.fill = "#4ade80"; // Green

      // Deal damage to BOSS
      const currentHp = this.bossDisplay.hp - dmg;
      this.bossDisplay.updateHealth(Math.max(0, currentHp));
    } else {
      this.resultText.text = "WRONG!";
      this.resultText.style.fill = "#ef4444"; // Red

      // Deal damage to PLAYER
      const currentHp = this.playerDisplay.hp - dmg;
      this.playerDisplay.updateHealth(Math.max(0, currentHp));
    }

    // Clear result text after delay
    setTimeout(() => {
      if (!this.destroyed) {
        this.resultText.text = "";
      }
    }, 1500);
  }

  private showSlotMachine(): void {
    // Create a semi-transparent overlay background for the slot machine
    const overlay = new Graphics();
    overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.fill({ color: 0x000000, alpha: 0.7 });
    this.addChild(overlay);

    const slotMachineScene = new SlotMachineScene({
      app: this.app,
      onNext: () => {
        this.removeChild(overlay);
        this.removeChild(slotMachineScene);
      },
    });

    // Center the slot machine scene
    slotMachineScene.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2 - 100, // Slightly offset up
    );

    this.addChild(slotMachineScene);

    // Initial auto-roll
    slotMachineScene.performInitialRoll();
  }
}
