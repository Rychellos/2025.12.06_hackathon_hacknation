import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { TextInput } from "../components/TextInput";
import { MenuButton } from "../components/MenuButton";
import { AuthManager } from "../utils/AuthManager";
import { LoginScene } from "./LoginScene.ts";

export class RegisterScene extends Container {
    private app: Application;
    private auth: AuthManager;
    private usernameInput!: TextInput;
    private passwordInput!: TextInput;
    private confirmInput!: TextInput;
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
    private registerBtn!: MenuButton;
    private backBtn!: MenuButton;

    private onResize = (): void => {
        const w = this.app.screen.width;
        const h = this.app.screen.height;

        // Update Background
        this.bg.clear();
        this.bg.rect(0, 0, w, h);
        this.bg.fill({ color: 0x111111 });

        // Update UI Positions
        this.title.position.set(w / 2, 80);
        this.usernameInput.position.set(w / 2 - 150, h / 2 - 120);
        this.passwordInput.position.set(w / 2 - 150, h / 2 - 30);
        this.confirmInput.position.set(w / 2 - 150, h / 2 + 60);
        this.registerBtn.position.set(w / 2, h / 2 + 160);
        this.backBtn.position.set(20, 20);
        this.statusText.position.set(w / 2, h / 2 + 220);
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
        this.title = new Text({ text: "REGISTER", style: titleStyle });
        this.title.anchor.set(0.5);
        this.title.position.set(w / 2, 80);
        this.addChild(this.title);

        // Inputs
        this.usernameInput = new TextInput({
            label: "Username",
            placeholder: "Choose username...",
            width: 300,
        });
        this.usernameInput.position.set(w / 2 - 150, h / 2 - 120);
        this.addChild(this.usernameInput);

        this.passwordInput = new TextInput({
            label: "Password",
            placeholder: "Choose password...",
            isPassword: true,
            width: 300,
        });
        this.passwordInput.position.set(w / 2 - 150, h / 2 - 30);
        this.addChild(this.passwordInput);

        this.confirmInput = new TextInput({
            label: "Confirm Password",
            placeholder: "Repeat password...",
            isPassword: true,
            width: 300,
        });
        this.confirmInput.position.set(w / 2 - 150, h / 2 + 60);
        this.addChild(this.confirmInput);


        // Buttons
        this.registerBtn = new MenuButton({
            label: "CREATE ACCOUNT",
            width: 250,
            onClick: () => this.handleRegister(),
        });
        this.registerBtn.pivot.set(125, 30); // Center the button
        this.registerBtn.position.set(w / 2, h / 2 + 160);
        this.addChild(this.registerBtn);


        this.backBtn = new MenuButton({
            label: "← BACK",
            width: 100,
            height: 40,
            onClick: () => {
                this.app.stage.removeChild(this);
                this.destroy();
                this.app.stage.addChild(new LoginScene(this.app));
            },
        });
        this.backBtn.position.set(20, 20);
        this.addChild(this.backBtn);

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
    }

    private handleRegister(): void {
        const username = this.usernameInput.getValue();
        const password = this.passwordInput.getValue();
        const confirm = this.confirmInput.getValue();

        if (password !== confirm) {
            this.statusText.text = "Passwords do not match!";
            this.statusText.style.fill = "#ef4444";
            return;
        }

        const result = this.auth.register(username, password);

        this.statusText.text = result.message;
        this.statusText.style.fill = result.success ? "#4ade80" : "#ef4444";

        if (result.success) {
            setTimeout(() => {
                this.app.stage.removeChild(this);
                this.destroy();
                this.app.stage.addChild(new LoginScene(this.app));
            }, 1500);
        }
    }
}
