import { Application, Container, Text, TextStyle } from 'pixi.js';
import { SlotMachine } from '../components/SlotMachine';
import { ImageButton } from '../components/ImageButton';
import { reroll_button, reroll_button_hover } from '../AssetManager';

export interface SlotMachineSceneOptions {
    app: Application;
    maxRerolls?: number;
    stats: Array<{ key: string; label: string; initialValue?: number }>;
    onStatsUpdate?: (stats: Record<string, number>) => void;
    onNext?: () => void;
}

/**
 * Reusable scene for displaying and managing multiple slot machines
 */
export class SlotMachineScene extends Container {
    private app: Application;
    private slotMachines: Map<string, SlotMachine> = new Map();
    private rerollsRemaining: number;
    private maxRerolls: number;
    private rerollButton!: ImageButton;
    private rerollText!: Text;
    private nextButton!: ImageButton;
    private anyRolling = false;
    private onStatsUpdate?: (stats: Record<string, number>) => void;
    private onNext?: () => void;
    private currentStats: Record<string, number> = {};

    constructor(options: SlotMachineSceneOptions) {
        super();

        this.app = options.app;
        this.maxRerolls = options.maxRerolls ?? 3;
        this.rerollsRemaining = this.maxRerolls;
        this.onStatsUpdate = options.onStatsUpdate;
        this.onNext = options.onNext;

        this.createSlotMachines(options.stats);
        this.createRerollButton();
        this.createNextButton();

        // Start update loop
        this.app.ticker.add(this.update, this);
    }

    private createSlotMachines(stats: Array<{ key: string; label: string; initialValue?: number }>): void {
        const spacing = 120;

        stats.forEach((stat, index) => {
            const slotMachine = new SlotMachine({
                label: stat.label,
                onRollComplete: (value) => {
                    this.currentStats[stat.key] = value;
                    console.log(`${stat.label} rolled: ${value}`);

                    // Notify parent if all slots finished rolling
                    if (!this.anyRolling && this.onStatsUpdate) {
                        this.onStatsUpdate(this.currentStats);
                    }
                },
            });

            slotMachine.position.set(0, index * spacing);
            slotMachine.setValue(stat.initialValue ?? 10);
            this.currentStats[stat.key] = stat.initialValue ?? 10;

            this.addChild(slotMachine);
            this.slotMachines.set(stat.key, slotMachine);
        });
    }

    private createRerollButton(): void {
        const totalHeight = this.slotMachines.size * 120;
        const buttonY = totalHeight + 20;

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
        const totalHeight = this.slotMachines.size * 120;
        const buttonY = totalHeight + 20;

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

        if (this.anyRolling) {
            return;
        }

        this.rerollsRemaining--;
        this.rerollText.text = `Rerolls: ${this.rerollsRemaining}/${this.maxRerolls}`;

        if (this.rerollsRemaining === 0) {
            this.rerollButton.alpha = 0.5;
            this.rerollButton.eventMode = 'none';
        }

        // Start rolling with stagger
        const slots = Array.from(this.slotMachines.values());
        slots.forEach((slot, index) => {
            setTimeout(() => {
                slot.roll();
            }, index * 150);
        });
    }

    /**
     * Perform initial roll (doesn't count against reroll limit)
     */
    public performInitialRoll(): void {
        const slots = Array.from(this.slotMachines.values());
        slots.forEach((slot, index) => {
            setTimeout(() => {
                slot.roll();
            }, index * 150);
        });
    }

    /**
     * Get current rerolls remaining
     */
    public getRerollsRemaining(): number {
        return this.rerollsRemaining;
    }

    /**
     * Get current stats
     */
    public getCurrentStats(): Record<string, number> {
        return { ...this.currentStats };
    }

    /**
     * Check if any slot machine is rolling
     */
    public isRolling(): boolean {
        return this.anyRolling;
    }

    private update(time: any): void {
        this.anyRolling = false;
        this.slotMachines.forEach((slot) => {
            slot.update(time.deltaTime);
            if (slot.getRolling()) {
                this.anyRolling = true;
            }
        });
    }

    destroy(options?: any): void {
        this.app.ticker.remove(this.update, this);
        super.destroy(options);
    }
}
