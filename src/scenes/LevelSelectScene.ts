import { Application, Container, Text, TextStyle, Graphics } from "pixi.js";
import { MenuButton } from "../components/MenuButton";
import { MainMenuScene } from "./MainMenuScene";
import { CharacterScreenScene } from "./CharacterScreenScene";
import { CombatScene } from "./CombatScene";
import { NumberGuessBossScene } from "./NumberGuessBossScene";
import { DiceBossScene } from "./DiceBossScene";
import { Background } from "../components/Background";
import { levelSelectBackground } from "../AssetManager";

export class LevelSelectScene extends Container {
    private app: Application;
    private background!: Background;

    private nodesLayer!: Container;

    constructor(app: Application) {
        super();
        this.app = app;

        this.createBackground();

        this.createNodes();
        this.createUI();
    }

    private createBackground(): void {
        this.background = new Background({
            texture: levelSelectBackground,
            width: this.app.screen.width,
            height: this.app.screen.height,
        });

        this.addChild(this.background);
    }

    private createNodes(): void {
        this.nodesLayer = new Container();
        this.addChild(this.nodesLayer);

        const w = this.app.screen.width;
        const h = this.app.screen.height;

        const levels = [
            { id: 1, x: w * 0.44, y: h * 0.7, unlocked: true },
            { id: 2, x: w * 0.56, y: h * 0.51, unlocked: true },
            { id: 3, x: w * 0.44, y: h * 0.35, unlocked: true },
            { id: 4, x: w * 0.51, y: h * 0.17, unlocked: true },
        ];

        levels.forEach((level) => {
            this.createLevelNode(level.id, level.x, level.y, level.unlocked);
        });
    }

    private createLevelNode(
        id: number,
        x: number,
        y: number,
        unlocked: boolean,
    ): void {
        const node = new Container();
        node.position.set(x, y);

        // Button Body
        const btn = new Graphics();
        const radius = 40; // Define radius for shadow calculation
        btn.circle(0, 0, radius);
        btn.fill({ color: unlocked ? 0x22c55e : 0x555555 });
        btn.stroke({ width: 4, color: 0xffffff });

        // Set opacity to 50% (User requested 0.7, applied to bg only)
        btn.alpha = 0.7;

        const shadow = new Graphics();
        shadow.ellipse(0, radius + 5, radius * 0.8, 10);
        shadow.fill({ color: 0x000000, alpha: 0.3 });
        node.addChild(shadow);
        node.addChild(btn);

        // Number
        const textStyle = new TextStyle({
            fontFamily: "Arial",
            fontSize: 32,
            fontWeight: "bold",
            fill: "#ffffff",
        });
        const text = new Text({ text: id.toString(), style: textStyle });
        text.anchor.set(0.5);
        node.addChild(text);

        // Interaction
        node.eventMode = "static";
        node.cursor = "pointer";

        node.on("pointerover", () => {
            node.scale.set(1.1);
        });
        node.on("pointerout", () => {
            node.scale.set(1.0);
        });
        node.on("pointerdown", () => {
            node.scale.set(0.9);
            setTimeout(() => {
                this.app.stage.removeChild(this);
                this.destroy();
                if (id === 1) {
                    this.app.stage.addChild(new CombatScene(this.app));
                } else if (id === 2) {
                    this.app.stage.addChild(new DiceBossScene(this.app));
                } else if (id === 3) {
                    this.app.stage.addChild(new NumberGuessBossScene(this.app));
                } else {
                    this.app.stage.addChild(new CharacterScreenScene(this.app));
                }
            }, 100);
        });

        this.nodesLayer.addChild(node);
    }

    private createUI(): void {
        // Back Button
        const backBtn = new MenuButton({
            label: "BACK",
            width: 120,
            height: 50,
            onClick: () => {
                this.app.stage.removeChild(this);
                this.destroy();
                this.app.stage.addChild(new MainMenuScene(this.app));
            },
        });
        backBtn.position.set(20, 20);
        this.addChild(backBtn);
    }
}
