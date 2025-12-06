import { Application } from "pixi.js";
import { MainMenuScene } from "./MainMenuScene";

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

  // Create and add the main menu scene
  const mainMenu = new MainMenuScene(app);
  app.stage.addChild(mainMenu);
})();
