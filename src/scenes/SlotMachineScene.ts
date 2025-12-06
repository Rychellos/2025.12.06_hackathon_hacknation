import { Application, Container, Text, TextStyle } from 'pixi.js';
import { SlotMachine } from '../components/SlotMachine';
import { ImageButton } from '../components/ImageButton';
import { reroll_button, reroll_button_hover } from '../AssetManager';

export interface SlotMachineSceneOptions {
    app: Application;
    maxRerolls?: number;
    stats?: Array<{ key: string; label: string; initialValue?: number }>;
    onNext?: () => void;
}

/**
 * Reusable scene for displaying and managing multiple slot machines
 */
export class SlotMachineScene extends Container {
    private app: Application;
    private slotMachine: SlotMachine;
    private rerollsRemaining: number;
    private maxRerolls: number;
    private rerollButton!: ImageButton;
    private rerollText!: Text;
    private nextButton!: ImageButton;
    private onNext?: () => void;

    constructor(options: SlotMachineSceneOptions) {
        super();

        this.app = options.app;
        this.maxRerolls = options.maxRerolls ?? 3;
        this.rerollsRemaining = this.maxRerolls;
        this.onNext = options.onNext;

        // Create single slot machine
        this.slotMachine = new SlotMachine({
            onRollComplete: (value) => {
                console.log(`Slot machine rolled: ${value}`);
            },
        });
        this.slotMachine.position.set(0, 0); // Position relative to container center
        this.addChild(this.slotMachine);

        this.createRerollButton();
        this.createNextButton();

        // Start update loop
        this.app.ticker.add(this.update, this);
    }

    private createRerollButton(): void {
        const buttonY = 120; // Position below slot machine

        // Reroll Button
        this.rerollButton = new ImageButton({
            texture: reroll_button,
            hoverTexture: reroll_button_hover,
            width: 200,
            height: 60,
            onClick: () => this.rollStats(),
        });
        this.rerollButton.position.set(-110, buttonY);
        this.addChild(this.rerollButton);

        // Rerolls remaining text
        const rerollStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 18,
            fontWeight: 'bold',
            fill: 0xffd700,
            stroke: { color: 0x000000, width: 2 },
        });

        this.rerollText = new Text({
            text: `Rerolls: ${this.rerollsRemaining}/${this.maxRerolls}`,
            style: rerollStyle,
        });
        this.rerollText.anchor.set(0.5);
        this.rerollText.position.set(-10, buttonY - 30);
        this.addChild(this.rerollText);
    }

    private createNextButton(): void {
        const buttonY = 120;

        // Next Button
        this.nextButton = new ImageButton({
            texture: reroll_button,
            hoverTexture: reroll_button_hover,
            width: 200,
            height: 60,
            onClick: () => {
                if (this.onNext) {
                    this.onNext();
                }
            },
        });
        this.nextButton.position.set(110, buttonY);
        this.addChild(this.nextButton);

        // Add "NEXT" label
        const nextLabel = new Text({
            text: 'NEXT →',
            style: new TextStyle({
                fontFamily: 'Arial, sans-serif',
                fontSize: 24,
                fontWeight: 'bold',
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 2 },
            }),
        });
        nextLabel.anchor.set(0.5);
        nextLabel.position.set(210, buttonY + 30);
        this.addChild(nextLabel);
    }

    /**
     * Manually trigger a roll
     */
    public rollStats(): void {
        if (this.rerollsRemaining <= 0) {
            console.log('No rerolls remaining!');
            return;
        }

        if (this.slotMachine.getRolling()) {
            return;
        }

        this.rerollsRemaining--;
        this.rerollText.text = `Rerolls: ${this.rerollsRemaining}/${this.maxRerolls}`;

        if (this.rerollsRemaining === 0) {
            this.rerollButton.alpha = 0.5;
            this.rerollButton.eventMode = 'none';
        }

        this.slotMachine.roll();
    }

    /**
     * Perform initial roll (doesn't count against reroll limit)
     */
    public performInitialRoll(): void {
        this.slotMachine.roll();
    }

    /**
     * Get current rerolls remaining
     */
    public getRerollsRemaining(): number {
        return this.rerollsRemaining;
    }

    private update(time: any): void {
        this.slotMachine.update(time.deltaTime);
    }

    destroy(options?: any): void {
        this.app.ticker.remove(this.update, this);
        super.destroy(options);
    }
}
