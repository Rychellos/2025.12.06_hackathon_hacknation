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
import {
  bossBackground,
  casino_table_panel,
  fleeButton,
  bossIdleTexture,
  bossAttackTexture,
} from "../AssetManager";
import { LevelSelectScene } from "./LevelSelectScene";
import { Background } from "../components/Background";
import { GlobalConfig } from "../data/GlobalConfig";
import { CombatUtils } from "../utils/CombatUtils";
import UsersCharacter from "../data/UsersCharacter";
import { ImageButton } from "../components/ImageButton";
import { SlashEffect } from "../components/SlashEffect";
import { slashTexture } from "../AssetManager";

type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

interface DieState {
  id: number;
  value: DieValue;
  // State flow:
  // 1. Rolled (Active, !held, !banked)
  // 2. Held (Selected to score, !banked)
  // 3. Banked (Scored in previous sub-turn, locked)
  held: boolean;
  banked: boolean;
}

export class DiceBossScene extends Container {
  private app: Application;
  private bossDisplay!: UnitDisplay;
  private playerDisplay!: UnitDisplay;
  private resultText!: Text;
  private turnScoreText!: Text; // Shows accumulated pot
  private selectionScoreText!: Text; // Shows score of current selection
  private instructionsText!: Text;
  private background!: Background;

  private diceContainer!: Container;
  private actionContainer!: Container;

  private dice: DieState[] = [];

  // Game State
  private turnAccumulatedScore = 0; // Points in "Pot"
  private isPlayerTurn = true;
  private isAnimating = false;
  private bossStartY = 0; // For levitation
  private slotMachineScene?: SlotMachineScene; // Track for cleanup if needed

  constructor(app: Application) {
    super();
    this.app = app;

    this.createBackground();
    this.createUI();
    this.showSlotMachine();
    this.initializeGame();
    this.showTransition();
  }

  private showTransition(): void {
    const overlay = new Graphics();
    overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.fill({ color: 0x000000, alpha: 1 });
    this.addChild(overlay);

    let alpha = 1;
    const animate = () => {
      alpha -= 0.02; // Fade out speed
      overlay.alpha = alpha;
      if (alpha <= 0) {
        this.app.ticker.remove(animate);
        overlay.removeFromParent();
      }
    };
    this.app.ticker.add(animate);
  }

  // --- SETUP ---

  private createBackground(): void {
    this.background = new Background({
      texture: bossBackground,
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.addChild(this.background);

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
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    // --- UNITS ---
    this.bossDisplay = new UnitDisplay({
      name: "MISTRZ KOŚCI",
      maxHp: 300, // Higher HP for score based game
      currentHp: 300,
      maxShield: 0,
      currentShield: 0,
      visualTexture: bossIdleTexture,
      pixelated: true,
      visualScaleX: -3, // Flip horizontally to face left
    });
    this.bossDisplay.position.set(w * 0.75, h * 0.3);
    this.bossStartY = this.bossDisplay.position.y;
    this.addChild(this.bossDisplay);

    // Start Update Loop
    this.app.ticker.add(this.update, this);

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
    const playerX = this.app.screen.width * 0.20;
    const playerY = this.app.screen.height - 80;
    this.playerDisplay.position.set(playerX, playerY);
    this.addChild(this.playerDisplay);

    this.diceContainer = new Container();
    this.diceContainer.position.set(w * 0.40, h - 140);
    this.addChild(this.diceContainer);

    this.actionContainer = new Container();
    this.actionContainer.position.set(w * 0.75, h - 80);
    this.addChild(this.actionContainer);

    // Buttons
    const rollBtn = new MenuButton({
      label: "ROLL MORE",
      width: 120,
      height: 50,
      onClick: () => this.actionRoll(),
    });
    rollBtn.position.set(-70, 0);

    const passBtn = new MenuButton({
      label: "PASS & SCORE",
      width: 140,
      height: 50,
      onClick: () => this.actionPass(),
    });
    passBtn.position.set(80, 0);

    this.actionContainer.addChild(rollBtn, passBtn);

    // --- TEXT UI ---
    // Pot Score (Accumulated this turn)
    const potStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fontWeight: "bold",
      fill: "#ffd700",
      stroke: { color: "#000000", width: 3 },
    });
    this.turnScoreText = new Text({ text: "Pot: 0", style: potStyle });
    this.turnScoreText.anchor.set(0.5);
    this.turnScoreText.position.set(w * 0.6, h - 50);
    this.addChild(this.turnScoreText);

    // Selection Score (Current Selection)
    const selStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#4ade80",
      stroke: { color: "#000000", width: 2 },
    });
    this.selectionScoreText = new Text({
      text: "(Selected: 0)",
      style: selStyle,
    });
    this.selectionScoreText.anchor.set(0.5);
    this.selectionScoreText.position.set(w * 0.40, h - 110);
    this.addChild(this.selectionScoreText);

    // Instructions
    const instrStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 16,
      fill: "#cccccc",
      align: "center",
      fontStyle: "italic",
    });
    this.instructionsText = new Text({
      text: "Wybierz kości do punktacji. Rzuć więcej, ryzykując przegraną. Przekaż do banku.",
      style: instrStyle,
    });
    this.instructionsText.anchor.set(0.5);
    this.instructionsText.position.set(w * 0.6, h - 130);
    this.addChild(this.instructionsText);

    // Message Overlay
    const resultStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 64,
      fontWeight: "bold",
      fill: "#ffffff",
      stroke: { color: "#000000", width: 4 },
      dropShadow: { color: "#000000", blur: 4, distance: 6 },
    });
    this.resultText = new Text({ text: "", style: resultStyle });
    this.resultText.anchor.set(0.5);
    this.resultText.position.set(w / 2, h / 2 - 50);
    this.addChild(this.resultText);

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

  private initializeGame(): void {
    for (let i = 0; i < 6; i++) {
      this.dice.push({ id: i, value: 1, held: false, banked: false });
    }
    this.startPlayerTurn();
  }

  // --- TURN LOGIC ---

  private startPlayerTurn(): void {
    this.isPlayerTurn = true;
    this.turnAccumulatedScore = 0;

    // Reset all dice
    this.dice.forEach((d) => {
      d.held = false;
      d.banked = false;
      d.value = 1;
    });

    this.updateUI();
    this.diceContainer.removeChildren(); // Hide dice
    this.actionContainer.visible = true;
    this.showMessage("YOUR TURN");

    // Auto-roll start?
    // Usually KCD requires initial roll action?
    // Let's make user click Roll (or we can simulate initial roll)
    // To permit "Roll More" button to serve as "Start Roll", we need to check state.
    // Simplifying: Auto-roll first throw to speed up flow.
    setTimeout(() => this.rollDice(), 1000);
  }

  // CORE ROLL LOGIC
  private async rollDice(): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Identify dice to roll: All !Banked and !Held?
    // Wait, if we are "rolling more", we must have just banked the Held ones.
    // So this method is usually called *after* banking logic handles state.
    // But for Initial Roll, no dice are banked or held.

    const toRoll = this.dice.filter((d) => !d.banked && !d.held);

    // Safety: If 0 dice to roll? (Should be handled by Hot Hand logic before calling)
    if (toRoll.length === 0) {
      // Hot Hand logic usually handles this, but safety fallback:
      this.dice.forEach((d) => {
        d.banked = false;
        d.held = false;
      });
    }

    // Check Hot Hand "Before" rolling? No, handled in Action.

    // Animate (Visual Roll)
    const duration = 600;
    const startTime = Date.now();

    while (Date.now() - startTime < duration) {
      toRoll.forEach((d) => {
        d.value = (Math.floor(Math.random() * 6) + 1) as DieValue;
      });
      this.renderDice();
      await this.delay(80); // 80ms per frame update
    }

    // Final Roll Result
    toRoll.forEach((d) => {
      d.value = (Math.floor(Math.random() * 6) + 1) as DieValue;
    });

    this.renderDice();

    // CHECK BUST
    // Must check if the *newly rolled* dice have any scoring potential.
    const freshDice = this.dice.filter((d) => !d.banked && !d.held); // These are the ones we just rolled
    const maxScore = this.calculatePossibleScore(freshDice.map((d) => d.value));

    if (maxScore === 0) {
      await this.delay(500);
      this.showMessage("BUST!", "#ef4444");
      // Lose Pot
      this.turnAccumulatedScore = 0;
      this.updateUI();
      await this.delay(1000);
      this.endTurn(0);
    }

    this.isAnimating = false;
  }

  // ACTION: ROLL MORE
  private actionRoll(): void {
    if (!this.isPlayerTurn || this.isAnimating) return;

    // 1. Validate Selection
    const selectedDice = this.dice.filter((d) => d.held);
    if (selectedDice.length === 0) {
      this.showMessage("Select dice to score first!");
      return;
    }

    const score = this.calculateStrictScore(selectedDice.map((d) => d.value));
    if (score === 0) {
      this.showMessage("Selection yields 0 points!");
      return;
    }

    // 2. Bank Selection (Add to Pot, Mark Banked)
    this.turnAccumulatedScore += score;
    selectedDice.forEach((d) => {
      d.banked = true;
      d.held = false;
    });

    // 3. Check Hot Hand (If all dice are strictly banked)
    const allBanked = this.dice.every((d) => d.banked);
    if (allBanked) {
      this.showMessage("HOT HAND!", "#ffd700");
      this.dice.forEach((d) => {
        d.banked = false;
        d.held = false;
      });
    }

    this.updateUI();

    // 4. Roll Remaining
    this.rollDice();
  }

  // ACTION: PASS & SCORE
  private actionPass(): void {
    if (!this.isPlayerTurn || this.isAnimating) return;

    // 1. Validate Selection (If any held dice exist)
    // Player might have banked some, then rolled, then decided to pass?
    // KCD: You must select scoring dice from the *last* roll to pass.
    // You can't roll, get 1, 2, 3, 4, 6 (1 is score), ignore it, and pass.
    // You must select at least one scorer.

    // Logic:
    // If we just rolled, we have unbanked dice.
    // We must select at least one scorer from them to add to pot before passing.
    // OR, if we already have a pot (e.g. from previous sub-turns), can we stop without taking from current roll?
    // KCD Rule: "If you bust... you lose all". Implies you HAVE to find a scorer.
    // So if you roll, you MUST select a scorer. If you can't, it's a Bust.
    // So effectively, you can never Pass empty-handed from a fresh roll.

    const selectedDice = this.dice.filter((d) => d.held);

    // Condition: Do we have unbanked dice that are NOT held?
    // If yes, we are leaving them on the table.
    // If we have selected dice, we calculate their score.

    let finalAddScore = 0;
    if (selectedDice.length > 0) {
      finalAddScore = this.calculateStrictScore(
        selectedDice.map((d) => d.value),
      );
      if (finalAddScore === 0) {
        this.showMessage("Invalid selection!");
        return;
      }
    } else {
      // No dice held.
      // If all other dice are banked, we can pass (we just rolled Hot Hand? No, Hot Hand forces roll).
      // If we just rolled, we MUST select something.
      // Check if there are "Active" dice (unbanked, unheld).
      const active = this.dice.filter((d) => !d.banked);
      if (active.length > 0) {
        this.showMessage("Must select scoring dice!");
        return;
      }
    }

    const totalScore = this.turnAccumulatedScore + finalAddScore;
    this.endTurn(totalScore);
  }

  private endTurn(score: number): void {
    this.isPlayerTurn = false;
    this.actionContainer.visible = false;

    if (score > 0) {
      const damage = Math.ceil(score / 10);
      this.showMessage(`ATTACK! ${damage} DMG`, "#4ade80");

      const result = CombatUtils.applyDamage(
        this.bossDisplay.hp,
        this.bossDisplay.shield,
        damage,
      );
      this.bossDisplay.updateHealth(result.hp);
      this.bossDisplay.updateShield(result.shield);

      // Slash Animation
      // Play slash animation
      SlashEffect.playOn(this.bossDisplay, slashTexture);

      if (this.bossDisplay.hp <= 0) {
        this.showMessage("VICTORY!", "#ffd700");
        return;
      }
    }

    setTimeout(() => this.bossTurn(), 2000);
  }

  // --- BOSS AI --- (Simplified Logic)
  private async bossTurn(): Promise<void> {
    this.showMessage("BOSS TURN...");
    await this.delay(1500);

    // Simple AI: Roll once, take all points, pass.
    const roll = Array.from(
      { length: 6 },
      () => Math.floor(Math.random() * 6) + 1,
    );
    const score = this.calculatePossibleScore(roll as DieValue[]);

    if (score === 0) {
      this.showMessage("BOSS BUSTED!", "#4ade80");
    } else {
      const damage = Math.ceil(score / 10);
      this.showMessage(`BOSS HITS! ${damage} DMG`, "#ef4444");

      // Boss Attack Animation
      this.bossDisplay.playAnimation(bossAttackTexture);

      const result = CombatUtils.applyDamage(
        this.playerDisplay.hp,
        this.playerDisplay.shield,
        damage,
      );
      this.playerDisplay.updateHealth(result.hp);
      this.playerDisplay.updateShield(result.shield);

      if (this.playerDisplay.hp <= 0) {
        this.showMessage("DEFEAT...", "#880000");
        return;
      }
    }

    await this.delay(2000);
    this.startPlayerTurn();
  }

  // --- INTERACTION ---

  private toggleDie(id: number): void {
    if (!this.isPlayerTurn || this.isAnimating) return;

    const die = this.dice.find((d) => d.id === id);
    if (!die || die.banked) return; // Cannot toggle locked dice

    die.held = !die.held;
    this.renderDice();
    this.updateUI();
  }

  private updateUI(): void {
    this.turnScoreText.text = `Pot: ${this.turnAccumulatedScore}`;

    // Calc current selection score
    const selected = this.dice.filter((d) => d.held);
    const selScore = this.calculateStrictScore(selected.map((d) => d.value));
    this.selectionScoreText.text = `(Selected: ${selScore})`;

    // Visual feedback?
    if (selScore === 0 && selected.length > 0) {
      this.selectionScoreText.style.fill = "#ef4444"; // Warning red
    } else {
      this.selectionScoreText.style.fill = "#4ade80";
    }
  }

  // --- RENDERING ---

  private renderDice(): void {
    this.diceContainer.removeChildren();

    // Partition: Banked vs Available (Held+Unheld)
    // Visuals: Banked on Top. Available on Bottom.

    const banked = this.dice
      .filter((d) => d.banked)
      .sort((a, b) => a.id - b.id);
    const active = this.dice
      .filter((d) => !d.banked)
      .sort((a, b) => a.id - b.id);

    banked.forEach((d, i) =>
      this.createDieVisual(d, i, banked.length, -60, true),
    );
    active.forEach((d, i) =>
      this.createDieVisual(d, i, active.length, 60, false),
    );
  }

  private createDieVisual(
    die: DieState,
    index: number,
    total: number,
    y: number,
    isBanked: boolean,
  ): void {
    const dieSize = 60;
    const gap = 15;
    const totalWidth = total * dieSize + (total - 1) * gap;
    const startX = -totalWidth / 2 + dieSize / 2;
    const x = startX + index * (dieSize + gap);

    const dieGfx = new Graphics();

    if (die.held) {
      dieGfx.roundRect(-5, -5, dieSize + 10, dieSize + 10, 15);
      dieGfx.fill({ color: 0x3b82f6, alpha: 0.6 }); // Blue for better contrast
    }
    // Highlight Banked (Distinctive)
    if (isBanked) {
      dieGfx.roundRect(-5, -5, dieSize + 10, dieSize + 10, 15);
      dieGfx.fill({ color: 0xffd700, alpha: 0.3 }); // Gold inactive glow
    }

    dieGfx.roundRect(0, 0, dieSize, dieSize, 10);
    dieGfx.fill({ color: 0xfff8e7 });
    dieGfx.stroke({ width: 2, color: 0x5c4033 });

    this.drawPips(dieGfx, die.value, dieSize);

    const wrapper = new Container();
    wrapper.addChild(dieGfx);

    if (!isBanked) {
      wrapper.eventMode = "static";
      wrapper.cursor = "pointer";
      wrapper.on("pointerdown", (e) => {
        e.stopPropagation();
        this.toggleDie(die.id);
      });
    }

    wrapper.position.set(x, y);
    this.diceContainer.addChild(wrapper);
  }

  private drawPips(g: Graphics, value: number, size: number): void {
    g.context.fillStyle = "rgba(0,0,0,0.8)";
    const c = size / 2;
    const q = size / 4;

    const dot = (x: number, y: number) => {
      g.circle(x, y, 4);
      g.fill({ color: 0x000000 });
    };

    if (value % 2 === 1) dot(c, c);
    if (value > 1) {
      dot(q, q);
      dot(size - q, size - q);
    }
    if (value > 3) {
      dot(size - q, q);
      dot(q, size - q);
    }
    if (value === 6) {
      dot(q, c);
      dot(size - q, c);
    }
  }

  // --- STRICT SCORING LOGIC ---

  // Calculates score for a SPECIFIC subset matches strict combinations
  // IMPORTANT: Combinations must be exact.
  private calculateStrictScore(values: number[]): number {
    if (values.length === 0) return 0;

    // Algorithm: Detect best combo?
    // Or just check if valid combo exists?
    // Since players select dice, we just need to validate if the SELECTION forms valid combos.
    // But players might pick [1, 5, 2]. 1,5 are scores. 2 is junk.
    // In strict mode, "Selection must be valid".
    // So [1, 5, 2] -> 2 is invalid. Score = 0/Invalid?
    // Or we filter out junk?
    // "Select at least one scoring value".
    // So invalid dice should probably not add to score?

    // Let's implement greedy scoring for the selection.
    // If a die is not used in a combo, it's 0.

    const counts = [0, 0, 0, 0, 0, 0, 0];
    values.forEach((v) => counts[v]++);

    let score = 0;

    // 1. Straights (Must use all dice? No, subset straights)
    // Straights 1-6
    if (
      counts[1] &&
      counts[2] &&
      counts[3] &&
      counts[4] &&
      counts[5] &&
      counts[6]
    ) {
      return 1500; // Full straight uses 6 dice
    }
    // Straights 1-5 (500)
    if (counts[1] && counts[2] && counts[3] && counts[4] && counts[5]) {
      // Check if this straight is "Primary"?
      // If we have 1-5, we score 500.
      // Remaining dice might score else.
      // But implementing optimal subset Partitioning is complex.
      // Assumption: Player selects exact combo.
      // If player selects 1,2,3,4,5,6 -> 1500.
      // If player selects 1,2,3,4,5 -> 500.
      if (values.length === 5) return 500;
    }
    // Straights 2-6 (750)
    if (counts[2] && counts[3] && counts[4] && counts[5] && counts[6]) {
      if (values.length === 5) return 750;
    }

    // 2. Multiples (Triples+)
    for (let i = 1; i <= 6; i++) {
      if (counts[i] >= 3) {
        const base = i === 1 ? 1000 : i * 100;
        // Multiplier: 3x=1, 4x=2, 5x=4, 6x=8
        const count = counts[i];
        const multiplier = Math.pow(2, count - 3);
        score += base * multiplier;
      }
    }

    // 3. Singles (1s and 5s)
    // Only count singular 1s/5s if they weren't used in Triples
    // But my loop above consumes ALL counts[i] if >=3.
    // So if I have four 1s.
    // Above logic takes all four as "Four of a kind".
    // Correct.
    // What if I have five 1s, but select only three? `counts` will be 3.
    // Logic holds.

    // Check for leftover 1s and 5s (count < 3)
    if (counts[1] < 3) score += counts[1] * 100;
    if (counts[5] < 3) score += counts[5] * 50;

    // Validation: Any selected die NOT used?
    // e.g. Select '2'. Count[2]=1. Not triple, not straight. Score += 0.
    // This function returns points. If returns 0, selection is invalid.
    // If returns > 0, it ignores junk.
    return score;
  }

  // Helper to check if ANY score is possible for "Bust" check (from ALL available dice)
  private calculatePossibleScore(values: number[]): number {
    // Just need to find ONE valid score.
    const counts = [0, 0, 0, 0, 0, 0, 0];
    values.forEach((v) => counts[v]++);

    if (counts[1] > 0 || counts[5] > 0) return 50; // At least one 5
    if (counts.some((c) => c >= 3)) return 200; // At least a triple

    // Straights?
    // If we have 1,2,3,4,5 or 2,3,4,5,6
    let streak = 0;
    for (let i = 1; i <= 6; i++) {
      if (counts[i] > 0) streak++;
      else streak = 0;
      if (streak >= 5) return 500;
    }

    return 0;
  }

  private showMessage(text: string, color = "#ffffff"): void {
    this.resultText.text = text;
    this.resultText.style.fill = color;

    setTimeout(() => {
      if (this.resultText.text === text) {
        this.resultText.text = "";
      }
    }, 2000);
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

    // Initial auto-roll
    slotMachineScene.performInitialRoll();

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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // --- UPDATE LOOP ---
  private update(_ticker: any): void {
    if (this.bossDisplay && this.bossStartY !== 0) {
      const time = Date.now();
      // Float up and down: Amplitude 10px, Speed factor
      const offset = Math.sin(time * 0.002) * 10;
      // Animate ONLY the visual part, not the whole container (HP bar etc)
      this.bossDisplay.visualContainer.position.y = offset;
      // Note: visualContainer is at 0,0 locally. We just offset it.
    }

    if (this.slotMachineScene) {
      // If we had a ref to slot machine scene update, but it handles its own update via ticker normally.
      // SlotMachineScene constructor adds itself to ticker.
    }
  }

  public override destroy(options?: any): void {
    this.app.ticker.remove(this.update, this);
    super.destroy(options);
  }
}
