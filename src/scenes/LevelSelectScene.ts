import { Application, Container, Text, TextStyle, Graphics } from "pixi.js";
import { MenuButton } from "../components/MenuButton";
import { MainMenuScene } from "./MainMenuScene";
import { CharacterScreenScene } from "./CharacterScreenScene";
import { CombatScene } from "./CombatScene";
import { Background } from "../components/Background";
import { levelSelectBackground } from "../AssetManager";

export class LevelSelectScene extends Container {
  private app: Application;
  private background!: Background;
  private pathLayer!: Graphics;
  private nodesLayer!: Container;

  constructor(app: Application) {
    super();
    this.app = app;

    this.createBackground();
    this.createPath();
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

  private createPath(): void {
    this.pathLayer = new Graphics();
    this.addChild(this.pathLayer);

    const w = this.app.screen.width;
    const h = this.app.screen.height;

    // Define node positions
    const p1 = { x: w * 0.44, y: h * 0.7 };
    const p2 = { x: w * 0.56, y: h * 0.51 };
    const p3 = { x: w * 0.44, y: h * 0.35 };
    const p4 = { x: w * 0.51, y: h * 0.17 };

    // Draw path
    this.pathLayer.moveTo(p1.x, p1.y);

    // Curve to p2
    this.pathLayer.bezierCurveTo(
      p1.x + 100,
      p1.y - 50,
      p2.x - 50,
      p2.y + 50,
      p2.x,
      p2.y,
    );

    // Curve to p3
    this.pathLayer.bezierCurveTo(
      p2.x + 50,
      p2.y - 100,
      p3.x + 50,
      p3.y + 50,
      p3.x,
      p3.y,
    );

    // Curve to p4
    this.pathLayer.bezierCurveTo(
      p3.x + 50,
      p3.y - 100,
      p4.x + 50,
      p4.y + 50,
      p4.x,
      p4.y,
    );

    this.pathLayer.stroke({
      width: 20,
      color: 0x34495e,
      cap: "round",
      join: "round",
    });

    // Draw dashed center line
    const dash = new Graphics();
    dash.moveTo(p1.x, p1.y);
    dash.bezierCurveTo(p1.x + 100, p1.y - 50, p2.x - 50, p2.y + 50, p2.x, p2.y);
    dash.bezierCurveTo(p2.x + 50, p2.y - 100, p3.x + 50, p3.y + 50, p3.x, p3.y);
    dash.bezierCurveTo(p3.x + 50, p3.y - 100, p4.x + 50, p4.y + 50, p4.x, p4.y);
    dash.stroke({ width: 4, color: 0xecf0f1, alpha: 0.5 }); // Pixi doesn't support native dashed lines easily in v8 without plugins, keeping solid for now or using texture
    this.addChild(dash);
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

    // Circle background
    const circle = new Graphics();
    const radius = 40;

    circle.circle(0, 0, radius);
    circle.fill({ color: unlocked ? 0xe67e22 : 0x95a5a6 }); // Orange if unlocked, Grey if locked
    circle.stroke({ width: 4, color: 0xffffff });

    // Shadow
    const shadow = new Graphics();
    shadow.ellipse(0, radius + 5, radius * 0.8, 10);
    shadow.fill({ color: 0x000000, alpha: 0.3 });
    node.addChild(shadow);
    node.addChild(circle);

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
        this.destroy();
        if (id === 1) {
          this.app.stage.addChild(new CombatScene(this.app));
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
        this.destroy();
        this.app.stage.addChild(new MainMenuScene(this.app));
      },
    });
    backBtn.position.set(20, 20);
    this.addChild(backBtn);
  }
}
