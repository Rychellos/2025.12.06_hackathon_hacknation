import { Application, Container } from "pixi.js";
import UserData from "../data/UsersCharacter"
import { StatDisplay } from "../components/StatDisplay";

export class CharacterScreenScene extends Container {
    private app: Application;

    constructor(app: Application) {
        super();
        this.app = app;

        // Start animation loop
        this.app.ticker.add(this.update.bind(this));

        this.createLabels();
    }

    private createLabels() {
        const { stats } = UserData.getData();

        let i = 0;
        for (const statName in stats) {
            if (!Object.hasOwn(stats, statName)) continue;
            const element = stats[statName];

            const label = new StatDisplay(this.app, element)

            label.y = (i++) * 72;

            this.addChild(label)
        }
    }

    private update(): void {

    }

    destroy(): void {
        this.app.ticker.remove(this.update.bind(this));
        super.destroy();
    }
}