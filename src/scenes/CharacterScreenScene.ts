import { Application, Container, Graphics } from "pixi.js";
import UserData from "../data/UsersCharacter";
import { StatDisplay } from "../components/StatDisplay";

export class CharacterScreenScene extends Container {
  private app: Application;

  constructor(app: Application) {
    super();
    this.app = app;

    // Start animation loop
    this.app.ticker.add(this.update.bind(this));

    this.createLabels();
    this.showTransition();
  }

  private showTransition(): void {
    const overlay = new Graphics(); // Need to import Graphics
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

  private createLabels() {
    const { stats } = UserData.getData();

    let i = 0;
    for (const statName in stats) {
      if (!Object.hasOwn(stats, statName)) continue;
      const element = stats[statName as keyof typeof stats];

      const label = new StatDisplay(this.app, element);

      label.y = i++ * 72;

      this.addChild(label);
    }
  }

  private update(): void {}

  destroy(): void {
    this.app.ticker.remove(this.update.bind(this));
    super.destroy();
  }
}
