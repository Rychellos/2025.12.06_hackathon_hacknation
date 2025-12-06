import { Application } from "pixi.js";
import { MainMenuScene } from "./scenes/MainMenuScene";

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

  // Scene navigation functions
  function showMainMenu() {
    // Clear current scene
    app.stage.removeChildren();

    // Create and add main menu
    const mainMenu = new MainMenuScene(app);
    app.stage.addChild(mainMenu);
  }

  // Start with main menu
  showMainMenu();
})();
