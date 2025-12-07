import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { TextInput } from "../components/TextInput";
import { MenuButton } from "../components/MenuButton";
import { AuthManager } from "../utils/AuthManager";
import { MainMenuScene } from "./MainMenuScene";
import { RegisterScene } from "./RegisterScene.ts";
import UsersCharacter from "../data/UsersCharacter.ts";

export class LoginScene extends Container {
  private app: Application;
  private auth: AuthManager;
  private usernameInput!: TextInput;
  private passwordInput!: TextInput;
  private statusText!: Text;

  constructor(app: Application) {
    super();
    this.app = app;
    this.auth = AuthManager.getInstance();

    this.createBackground();
    this.createUI();

    this.app.renderer.on("resize", this.onResize);
  }

  private bg!: Graphics;
  private title!: Text;
  private registerText!: Text;
  private loginBtn!: MenuButton;
  private backBtn!: MenuButton;

  private onResize = (): void => {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    // Update Background
    this.bg.clear();
    this.bg.rect(0, 0, w, h);
    this.bg.fill({ color: 0x111111 });

    // Update UI Positions
    this.title.position.set(w / 2, 100);
    this.usernameInput.position.set(w / 2 - 150, h / 2 - 80);
    this.passwordInput.position.set(w / 2 - 150, h / 2 + 20);
    this.loginBtn.position.set(w / 2, h / 2 + 120);
    this.registerText.position.set(w / 2, h / 2 + 180);
    this.statusText.position.set(w / 2, h / 2 + 220);
    this.backBtn.position.set(20, 20);
  };

  public destroy(): void {
    this.app.renderer.off("resize", this.onResize);
    super.destroy({ children: true });
  }

  private createBackground(): void {
    this.bg = new Graphics();
    this.bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.bg.fill({ color: 0x111111 });
    this.addChild(this.bg);
  }

  private createUI(): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    // Title
    const titleStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 48,
      fontWeight: "bold",
      fill: "#ffffff",
    });
    this.title = new Text({ text: "LOGIN", style: titleStyle });
    this.title.anchor.set(0.5);
    this.title.position.set(w / 2, 100);
    this.addChild(this.title);

    // Inputs
    this.usernameInput = new TextInput({
      label: "Username",
      placeholder: "Enter username...",
      width: 300,
    });
    this.usernameInput.position.set(w / 2 - 150, h / 2 - 80);
    this.addChild(this.usernameInput);

    this.passwordInput = new TextInput({
      label: "Password",
      placeholder: "Enter password...",
      isPassword: true,
      width: 300,
    });
    this.passwordInput.position.set(w / 2 - 150, h / 2 + 20);
    this.addChild(this.passwordInput);

    // Login Button
    this.loginBtn = new MenuButton({
      label: "LOGIN",
      width: 250,
      onClick: () => this.handleLogin(),
    });
    this.loginBtn.pivot.set(125, 30); // Center the button anchor
    this.loginBtn.position.set(w / 2, h / 2 + 120);
    this.addChild(this.loginBtn);

    // Register Hyperlink
    const registerStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 16,
      fill: "#3b82f6", // Blue color like a link
      fontStyle: "italic",
    });

    this.registerText = new Text({
      text: "Don't have an account? Register here",
      style: registerStyle,
    });
    this.registerText.anchor.set(0.5);
    this.registerText.position.set(w / 2, h / 2 + 180);
    this.registerText.eventMode = "static";
    this.registerText.cursor = "pointer";

    // Add hover effect
    this.registerText.on("pointerover", () => {
      this.registerText.style.fill = "#60a5fa"; // Lighter blue on hover
    });
    this.registerText.on("pointerout", () => {
      this.registerText.style.fill = "#3b82f6";
    });

    this.registerText.on("pointerdown", () => {
      this.app.stage.removeChild(this);
      this.destroy(); // Destroy current scene
      this.app.stage.addChild(new RegisterScene(this.app));
    });

    this.addChild(this.registerText);

    // Status Text
    const statusStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 16,
      fill: "#ef4444",
    });
    this.statusText = new Text({ text: "", style: statusStyle });
    this.statusText.anchor.set(0.5);
    this.statusText.position.set(w / 2, h / 2 + 220);
    this.addChild(this.statusText);

    // Back Button
    this.backBtn = new MenuButton({
      label: "← BACK",
      width: 100,
      height: 40,
      onClick: () => {
        this.app.stage.removeChild(this);
        this.destroy();
        this.app.stage.addChild(new MainMenuScene(this.app));
      },
    });
    this.backBtn.position.set(20, 20);
    this.addChild(this.backBtn);
  }

  private handleLogin(): void {
    const username = this.usernameInput.getValue();
    const password = this.passwordInput.getValue();

    const result = this.auth.login(username, password);

    this.statusText.text = result.message;
    this.statusText.style.fill = result.success ? "#4ade80" : "#ef4444";

    if (result.success) {
      setTimeout(() => {
        this.app.stage.removeChild(this);
        this.destroy();
        UsersCharacter.getData().name = username;
        this.app.stage.addChild(new MainMenuScene(this.app));
      }, 1000);
    }
  }
}
