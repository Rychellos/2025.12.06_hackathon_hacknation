import {
  Application,
  Container,
  Text,
  TextStyle,
  Graphics,
  Sprite,
  AnimatedSprite,
  Texture,
  Rectangle,
} from "pixi.js";
import { ImageButton } from "../components/ImageButton";

import { UnitDisplay } from "../components/UnitDisplay";
import { SlotMachineScene } from "./SlotMachineScene";
import {
  bossBackground,
  casino_table_panel,
  fleeButton,
  lotekBossTexture,
  lottoTexture,
  musicPoKrulefsku,
  slashTexture,
  sfxSlash,
} from "../AssetManager";
import { LevelSelectScene } from "./LevelSelectScene";
import { Background } from "../components/Background";
import { GlobalConfig } from "../data/GlobalConfig";
import { CombatUtils } from "../utils/CombatUtils";
import UsersCharacter from "../data/UsersCharacter";
import { SlashEffect } from "../components/SlashEffect";
import { SoundManager } from "../utils/SoundManager";
import { GameProgress } from "../data/GameProgress";

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
    this.showTransition();

    // Start Update Loop
    this.app.ticker.add(this.update, this);

    // Play Music
    SoundManager.getInstance().playMusic(musicPoKrulefsku);
  }

  private showTransition(): void {
    const overlay = new Graphics();
    overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.fill({ color: 0x000000, alpha: 1 });
    this.addChild(overlay);

    let alpha = 1;
    const animate = () => {
      alpha -= 0.02;
      overlay.alpha = alpha;
      if (alpha <= 0) {
        this.app.ticker.remove(animate);
        overlay.removeFromParent();
      }
    };
    this.app.ticker.add(animate);
  }

  private createBackground(): void {
    this.background = new Background({
      texture: bossBackground,
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
      name: "KRÓL LOTEK",
      maxHp: 100,
      currentHp: 100,
      maxShield: 50,
      currentShield: 50,
      visualTexture: lotekBossTexture,
      pixelated: true,
      visualScaleX: 3, // Assuming regular facing right for now, or check need for flip
      visualScaleY: 3,
    });

    // Position top-right
    const bossX = this.app.screen.width * 0.75;
    const bossY = this.app.screen.height * 0.3;
    this.bossDisplay.position.set(bossX, bossY);
    this.addChild(this.bossDisplay);

    // --- CASINO TABLE (Bottom) ---
    const table = new Sprite(casino_table_panel);
    table.anchor.set(0.5, 1); // Anchor bottom center
    table.width = 256 * 8;
    table.height = 64 * 8; // Adjust height to fit controls
    table.texture.source.scaleMode = "nearest";
    table.position.set(this.app.screen.width / 2, this.app.screen.height);
    this.addChild(table);

    // --- PLAYER AREA (Bottom Right of Table) ---
    this.playerDisplay = new UnitDisplay({
      name: UsersCharacter.getData().name || "Gracz",
      maxHp:
        GlobalConfig.SCALING_MULTIPLIER *
        UsersCharacter.getData().stats.hitPoints.value,
      currentHp:
        GlobalConfig.SCALING_MULTIPLIER *
        UsersCharacter.getData().stats.hitPoints.value,
      maxShield:
        GlobalConfig.SCALING_MULTIPLIER *
        UsersCharacter.getData().stats.defense.value,
      currentShield:
        GlobalConfig.SCALING_MULTIPLIER *
        UsersCharacter.getData().stats.defense.value,
      showVisual: false,
      nameColor: "#4ade80",
    });

    // Position on the right side of the table
    const playerX = this.app.screen.width * 0.2;
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

      sphereContainer.position.set(x + 128, y + 40);
      actionContainer.addChild(sphereContainer);
    }

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
      text: "Wybierz liczbę pomiędzy 1 a 10...",
      style: choiceStyle,
    });
    this.choiceText.anchor.set(0.5, 1);
    this.choiceText.position.set(actionPanelX, actionPanelY - 20);
    this.addChild(this.choiceText);

    // Back Button
    const backBtn = new ImageButton({
      texture: fleeButton,
      width: 256,
      height: 64,
      onClick: () => {
        this.destroy();
        this.app.stage.addChild(new LevelSelectScene(this.app));
      },
    });
    backBtn.position.set(148, 48);
    this.addChild(backBtn);
  }

  private isProcessing: boolean = false;

  private play(playerChoice: number): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Choose boss number
    const bossChoice = Math.floor(Math.random() * 10) + 1; // 1-10

    this.playLottoDraw(bossChoice, () => {
      this.isProcessing = false;

      this.choiceText.text = `Wybrałeś ${playerChoice}. Król Lotek wybrał ${bossChoice}.`;

      if (playerChoice === bossChoice) {
        this.resultText.text = "Prawidłowo!";
        this.resultText.style.fill = "#4ade80"; // Green

        // Deal damage to BOSS
        const playerStats = UsersCharacter.getData().stats;
        const damage = CombatUtils.rollAttackDamage(
          playerStats.attack.value,
          GlobalConfig.SCALING_MULTIPLIER,
        );

        const result = CombatUtils.applyDamage(
          this.bossDisplay.hp,
          this.bossDisplay.shield,
          damage,
        );
        this.bossDisplay.updateHealth(result.hp);
        this.bossDisplay.updateShield(result.shield);

        // Slash Animation
        SlashEffect.playOn(this.bossDisplay, slashTexture);
        SoundManager.getInstance().playSfx(sfxSlash);

        if (this.bossDisplay.hp <= 0) {
          this.handleWin();
          return;
        }
      } else {
        this.resultText.text = "Źle!";
        this.resultText.style.fill = "#ef4444"; // Red

        // Deal damage to PLAYER
        const bossBaseDamage = 1;
        const damage = CombatUtils.rollAttackDamage(
          bossBaseDamage,
          GlobalConfig.SCALING_MULTIPLIER,
        );

        const result = CombatUtils.applyDamage(
          this.playerDisplay.hp,
          this.playerDisplay.shield,
          damage,
        );
        this.playerDisplay.updateHealth(result.hp);
        this.playerDisplay.updateShield(result.shield);

        // Slash Animation
        SlashEffect.playOn(this.playerDisplay, slashTexture);
        SoundManager.getInstance().playSfx(sfxSlash);

        if (this.playerDisplay.hp <= 0) {
          this.handleLoss();
          return;
        }
      }

      // Clear result text after delay
      setTimeout(() => {
        if (!this.destroyed) {
          this.resultText.text = "";
        }
      }, 1500);
    });
  }

  private createAnimatedSprite(
    texture: Texture,
    frameWidth: number,
    frameHeight: number,
    animationSpeed: number = 0.1,
  ): AnimatedSprite {
    texture.source.scaleMode = "nearest";
    const frames: Texture[] = [];
    const cols = Math.floor(texture.width / frameWidth);
    const rows = Math.floor(texture.height / frameHeight);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const frame = new Texture({
          source: texture.source,
          frame: new Rectangle(
            x * frameWidth,
            y * frameHeight,
            frameWidth,
            frameHeight,
          ),
        });
        frames.push(frame);
      }
    }

    const anim = new AnimatedSprite(frames);
    anim.animationSpeed = animationSpeed;
    anim.loop = false;
    anim.anchor.set(0.5);
    return anim;
  }

  private playLottoDraw(resultNumber: number, onComplete: () => void): void {
    // Create overlay
    const overlay = new Container();
    overlay.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    this.addChild(overlay);

    // Create Animation
    // Assuming 64x64 frames based on file size/usual assets
    const anim = this.createAnimatedSprite(lottoTexture, 64, 64, 0.2);
    anim.scale.set(4); // Make it big
    anim.play();
    overlay.addChild(anim);

    // Number Text (Hidden initially)
    const numStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 48,
      fontWeight: "bold",
      fill: "#ffffff",
      stroke: { color: "#000000", width: 4 },
      align: "center",
    });
    const numText = new Text({
      text: resultNumber.toString(),
      style: numStyle,
    });
    numText.anchor.set(0.5);
    numText.position.set(0, 80); // Bottom of sprite (64*4/2 = 128, so 80 is good)
    numText.visible = false;
    overlay.addChild(numText);

    anim.onComplete = () => {
      // Show number
      numText.visible = true;

      // Wait a bit then finish
      setTimeout(() => {
        overlay.destroy();
        onComplete();
      }, 1500); // 1.5s to see the result
    };
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
        this.playerDisplay.updateHealth(
          GlobalConfig.SCALING_MULTIPLIER * userData.stats.hitPoints.value,
          GlobalConfig.SCALING_MULTIPLIER * userData.stats.hitPoints.value,
        );
        this.playerDisplay.updateShield(
          GlobalConfig.SCALING_MULTIPLIER * userData.stats.defense.value,
          GlobalConfig.SCALING_MULTIPLIER * userData.stats.defense.value,
        );
      },
    });

    // Center the slot machine scene
    slotMachineScene.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2, // Centered
    );

    this.addChild(slotMachineScene);

    const userData = UsersCharacter.getData();
    this.playerDisplay.updateHealth(
      GlobalConfig.SCALING_MULTIPLIER * userData.stats.hitPoints.value,
      GlobalConfig.SCALING_MULTIPLIER * userData.stats.hitPoints.value,
    );
    this.playerDisplay.updateShield(
      GlobalConfig.SCALING_MULTIPLIER * userData.stats.defense.value,
      GlobalConfig.SCALING_MULTIPLIER * userData.stats.defense.value,
    );
  }
  // --- UPDATE LOOP ---
  private update(): void {
    if (this.bossDisplay && this.bossDisplay.visualContainer) {
      const time = Date.now();
      // Breathing/Squash effect
      const scaleOffset = Math.sin(time * 0.003) * 0.05;
      this.bossDisplay.visualContainer.scale.y = 1 + scaleOffset;
    }
  }

  private handleWin(): void {
    this.resultText.text = "ZWYCIĘSTWO!";
    this.resultText.style.fill = "#ffd700"; // Gold

    // Mark Boss 3 as beaten
    GameProgress.markBossAsBeaten(3);

    setTimeout(() => {
      this.destroy();
      this.app.stage.addChild(new LevelSelectScene(this.app));
    }, 2000);
  }

  private handleLoss(): void {
    this.resultText.text = "PORAŻKA...";
    this.resultText.style.fill = "#880000"; // Dark Red

    setTimeout(() => {
      this.destroy();
      this.app.stage.addChild(new LevelSelectScene(this.app));
    }, 2000);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override destroy(options?: any): void {
    this.app.ticker.remove(this.update, this);
    super.destroy(options);
  }
}
