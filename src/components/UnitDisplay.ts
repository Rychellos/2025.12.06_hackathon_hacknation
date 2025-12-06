import { Container, Graphics, Text, TextStyle } from "pixi.js";

export interface UnitDisplayOptions {
    name: string;
    maxHp: number;
    currentHp?: number;
    maxShield?: number;
    currentShield?: number;
    showVisual?: boolean; // Option to hide the face visual if needed
    nameColor?: string;
}

export class UnitDisplay extends Container {
    private maxHp: number;
    private currentHp: number;
    private maxShield: number;
    private currentShield: number;

    private hpBar: Graphics;
    private shieldBar: Graphics;
    private hpText: Text;
    private shieldText: Text;
    private showVisual: boolean;

    constructor(options: UnitDisplayOptions) {
        super();
        this.maxHp = options.maxHp;
        this.currentHp = options.currentHp ?? options.maxHp;
        this.maxShield = options.maxShield ?? 0;
        this.currentShield = options.currentShield ?? 0;
        this.showVisual = options.showVisual ?? true;

        if (this.showVisual) {
            // Visual Placeholder
            const visual = new Graphics();
            visual.circle(0, 0, 60);
            visual.fill({ color: 0xff0000 });
            // Add a simple "face" or mark
            visual.circle(-20, -10, 10); // Left eye
            visual.circle(20, -10, 10);  // Right eye
            visual.fill({ color: 0xffffff });
            visual.rect(-30, 20, 60, 10); // Mouth
            visual.fill({ color: 0x000000 });
            this.addChild(visual);
        }

        // Name
        const nameStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: options.nameColor ?? '#ffffff',
            stroke: { color: '#000000', width: 4 },
        });
        const nameText = new Text({ text: options.name.toUpperCase(), style: nameStyle });
        nameText.anchor.set(0.5, 1);
        nameText.position.set(0, this.showVisual ? -70 : -30); // Adjust pos if visual is hidden
        this.addChild(nameText);

        // HP Bar Background
        const barWidth = 200;

        // HP Bar
        this.hpBar = new Graphics();
        this.hpBar.position.set(-barWidth / 2, this.showVisual ? 80 : 10);
        this.addChild(this.hpBar);

        this.hpText = new Text({
            text: `${this.currentHp}/${this.maxHp}`,
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#ffffff',
                fontWeight: 'bold',
                stroke: { color: '#000000', width: 2 }
            })
        });
        this.hpText.anchor.set(0.5);
        this.hpText.position.set(0, this.showVisual ? 90 : 20);
        this.addChild(this.hpText);

        // Shield Bar (only if shield exists)
        this.shieldBar = new Graphics();
        this.shieldBar.position.set(-barWidth / 2, this.showVisual ? 110 : 40);
        this.addChild(this.shieldBar);

        this.shieldText = new Text({
            text: '',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 14,
                fill: '#00ffff',
                fontWeight: 'bold',
                stroke: { color: '#000000', width: 2 }
            })
        });
        this.shieldText.anchor.set(0.5);
        this.shieldText.position.set(0, this.showVisual ? 120 : 50);
        this.addChild(this.shieldText);

        this.updateVisuals();
    }

    private updateVisuals(): void {
        const barWidth = 200;
        const barHeight = 20;

        // Draw HP
        this.hpBar.clear();
        // Background
        this.hpBar.rect(0, 0, barWidth, barHeight);
        this.hpBar.fill({ color: 0x330000 });
        // Foreground
        const hpPercent = Math.max(0, Math.min(1, this.currentHp / this.maxHp));
        this.hpBar.rect(0, 0, barWidth * hpPercent, barHeight);
        this.hpBar.fill({ color: 0xff0000 });
        // Border
        this.hpBar.rect(0, 0, barWidth, barHeight);
        this.hpBar.stroke({ color: 0xffffff, width: 2 });

        this.hpText.text = `${Math.ceil(this.currentHp)}/${this.maxHp}`;


        // Draw Shield
        this.shieldBar.clear();
        this.shieldText.text = '';

        if (this.maxShield > 0) {
            // Background
            this.shieldBar.rect(0, 0, barWidth, barHeight / 2); // Thinner bar for shield
            this.shieldBar.fill({ color: 0x001133 });
            // Foreground
            const shieldPercent = Math.max(0, Math.min(1, this.currentShield / this.maxShield));
            this.shieldBar.rect(0, 0, barWidth * shieldPercent, barHeight / 2);
            this.shieldBar.fill({ color: 0x00ccff });
            // Border
            this.shieldBar.rect(0, 0, barWidth, barHeight / 2);
            this.shieldBar.stroke({ color: 0xffffff, width: 1 });

            if (this.currentShield > 0) {
                this.shieldText.text = `${Math.ceil(this.currentShield)}`;
            }
        }
    }

    public updateHealth(current: number, max?: number): void {
        this.currentHp = current;
        if (max !== undefined) this.maxHp = max;
        this.updateVisuals();
    }

    public updateShield(current: number, max?: number): void {
        this.currentShield = current;
        if (max !== undefined) this.maxShield = max;
        this.updateVisuals();
    }

    // Getter for current HP to check life state
    public get hp(): number {
        return this.currentHp;
    }
}
