import { Application } from "pixi.js";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { SlotMachineScene } from "./scenes/SlotMachineScene";
import { CharacterScreenScene } from "./scenes/CharacterScreenScene";
import UserData from "./data/UsersCharacter";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    background: "#0a0e27",
    resizeTo: window,
    antialias: true,
  });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Store current stats
  let currentStats: Record<string, number> = {
    attack: 10,
    defense: 10,
    hitPoints: 10,
  };

  // Scene navigation functions
  function showMainMenu() {
    // Clear current scene
    app.stage.removeChildren();

    // Create and add main menu
    const mainMenu = new MainMenuScene(app, showSlotMachineScene);
    app.stage.addChild(mainMenu);
  }

  function showSlotMachineScene() {
    // Clear current scene
    app.stage.removeChildren();

    // Create slot machine scene
    const slotScene = new SlotMachineScene({
      app: app,
      maxRerolls: 3,
      stats: [
        { key: 'attack', label: 'Attack', initialValue: 10 },
        { key: 'defense', label: 'Defense', initialValue: 10 },
        { key: 'hitPoints', label: 'Hit Points', initialValue: 10 },
      ],
      onStatsUpdate: (stats) => {
        currentStats = stats;
        console.log('Stats updated:', stats);
      },
      onNext: () => {
        showCharacterScreen();
      },
    });

    // Position in center
    slotScene.position.set(
      app.screen.width / 2 - 140,
      app.screen.height / 2 - 200
    );

    app.stage.addChild(slotScene);

    // Auto-start rolling
    setTimeout(() => {
      slotScene.performInitialRoll();
    }, 500);
  }

  function showCharacterScreen() {
    // Clear current scene
    app.stage.removeChildren();

    // Update UserData with current stats
    UserData.setAttack(currentStats.attack);
    UserData.setDefense(currentStats.defense);
    UserData.setHitPoints(currentStats.hitPoints);

    // Create character screen scene
    const characterScreen = new CharacterScreenScene(app);
    app.stage.addChild(characterScreen);
  }

  // Start with main menu
  showMainMenu();
})();

