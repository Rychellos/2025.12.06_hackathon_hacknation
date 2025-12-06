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
import { bossBackground, casino_table_panel, paper, rock, scissors } from "../AssetManager";
import { LevelSelectScene } from "./LevelSelectScene";
import { Background } from "../components/Background";
import { ImageButton } from "../components/ImageButton";
import UsersCharacter from "../data/UsersCharacter";

type Choice = "rock" | "paper" | "scissors";

const MULTIPLIER = 10;

export class CombatScene extends Container {
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
      height: this.app.screen.height,
      width: this.app.screen.width,
      texture: bossBackground,
    });
    // this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
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
      name: "EVIL BOSS",
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
      name: UsersCharacter.getData().name || "Gracz",
      maxHp: MULTIPLIER * UsersCharacter.getData().stats.hitPoints.value,
      currentHp: MULTIPLIER * UsersCharacter.getData().stats.hitPoints.value,
      maxShield: MULTIPLIER * UsersCharacter.getData().stats.defense.value,
      currentShield: MULTIPLIER * UsersCharacter.getData().stats.defense.value,
      showVisual: false,
      nameColor: "#4ade80",
    });

    // Position on the right side of the table
    const playerX = this.app.screen.width * 0.75;
    const playerY = this.app.screen.height - 80;
    this.playerDisplay.position.set(playerX, playerY);
    this.addChild(this.playerDisplay);

    // --- PLAYER ACTION AREA (Bottom Left of Table) ---
    const actionPanelY = this.app.screen.height - 130;
    const actionPanelX = this.app.screen.width * 0.5; // Left Area

    // Container for action buttons
    const actionContainer = new Container();
    actionContainer.position.set(actionPanelX, actionPanelY);
    this.addChild(actionContainer);

    const btnWidth = 120;
    const btnSpacing = 140;

    const rockBtn = new ImageButton({
      texture: rock,
      width: btnWidth,
      height: 50,
      onClick: () => this.play("rock"),
    });
    rockBtn.position.set(-btnSpacing, 0);

    const paperBtn = new ImageButton({
      texture: paper,
      width: btnWidth,
      height: 50,
      onClick: () => this.play("paper"),
    });
    paperBtn.position.set(0, 0);

    const scissorsBtn = new ImageButton({
      texture: scissors,
      width: btnWidth,
      height: 50,
      onClick: () => this.play("scissors"),
    });
    scissorsBtn.position.set(btnSpacing, 0);

    actionContainer.addChild(rockBtn, paperBtn, scissorsBtn);

    // --- INFO TEXTS ---

    // Title
    const titleStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: "bold",
      fill: "#8888aa",
    });
    const title = new Text({ text: "BATTLE START", style: titleStyle });
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
      align: "left",
      fontStyle: "italic",
      dropShadow: {
        color: "#000000",
        blur: 2,
        distance: 2,
      },
    });

    this.choiceText = new Text({
      text: "Wybierz swój ruch...",
      style: choiceStyle,
    });
    this.choiceText.anchor.set(0.5, 1);
    this.choiceText.position.set(actionPanelX, actionPanelY - 30);
    this.addChild(this.choiceText);

    // Back Button
    const backBtn = new MenuButton({
      label: "Ucieknij",
      width: 128,
      height: 48,
      onClick: () => {
        this.destroy();
        this.app.stage.addChild(new LevelSelectScene(this.app));
      },
    });
    backBtn.position.set(20, 20);
    this.addChild(backBtn);
  }

  private play(playerChoice: Choice): void {
    const choices: Choice[] = ["rock", "paper", "scissors"];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    this.choiceText.text = `Wybrałeś ${playerChoice.toUpperCase()}! Przeciwnik wybrał ${computerChoice.toUpperCase()}!`;

    let dmg = 10 - Math.min(Math.floor(Math.random() * 5), UsersCharacter.getData().stats.defense.value);

    if (playerChoice === computerChoice) {
      this.resultText.text = "REMIS!";
      this.resultText.style.fill = "#ffffff";
    } else if (
      (playerChoice === "rock" && computerChoice === "scissors") ||
      (playerChoice === "paper" && computerChoice === "rock") ||
      (playerChoice === "scissors" && computerChoice === "paper")
    ) {
      this.resultText.text = "Wygrałeś!";
      this.resultText.style.fill = "#4ade80"; // Green

      // Deal damage to BOSS
      const currentHp = this.bossDisplay.hp - dmg;
      this.bossDisplay.updateHealth(Math.max(0, currentHp));
    } else {
      this.resultText.text = "Przegrałeś!";
      this.resultText.style.fill = "#ef4444"; // Red

      dmg -= UsersCharacter.getData().stats.defense.value * 0.5;
      UsersCharacter.setDefense(UsersCharacter.getData().stats.defense.value - Math.min(dmg, UsersCharacter.getData().stats.defense.value * 0.5));

      // Deal damage to PLAYER
      const currentHp = this.playerDisplay.hp - dmg;
      this.playerDisplay.updateHealth(Math.max(0, currentHp));
      this.playerDisplay.updateShield(UsersCharacter.getData().stats.defense.value);
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
      onRoll: () => {
        const userData = UsersCharacter.getData();
        this.playerDisplay.updateHealth(MULTIPLIER * userData.stats.hitPoints.value, MULTIPLIER * userData.stats.hitPoints.value);
        this.playerDisplay.updateShield(MULTIPLIER * userData.stats.defense.value, MULTIPLIER * userData.stats.defense.value);
      }
    });

    // Center the slot machine scene
    slotMachineScene.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2, // Slightly offset up
    );

    this.addChild(slotMachineScene);

    // Initial auto-roll
    slotMachineScene.performInitialRoll();

    const userData = UsersCharacter.getData();
    this.playerDisplay.updateHealth(MULTIPLIER * userData.stats.hitPoints.value, MULTIPLIER * userData.stats.hitPoints.value);
    this.playerDisplay.updateShield(MULTIPLIER * userData.stats.defense.value, MULTIPLIER * userData.stats.defense.value);
  }
}
