import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import { brown_slot_box } from '../AssetManager';

export interface SlotMachineOptions {
    onRollComplete?: (value: number) => void;
}

/**
 * Slot machine component that displays 3 rolling numbers
 */
export class SlotMachine extends Container {
    private background: Sprite;
    private roll1Text: Text;
    private roll2Text: Text;
    private roll3Text: Text;
    private rolls: number[] = [1, 1, 1];
    private isRolling = false;
    private rollDuration = 0;
    private targetRolls: number[] = [1, 1, 1];
    private options: SlotMachineOptions;

    constructor(options: SlotMachineOptions) {
        super();
        this.options = options;

        // Create background (brown box)
        this.background = new Sprite(brown_slot_box);
        this.background.width = 280;
        this.background.height = 100;
        this.addChild(this.background);

        // Create rolling number displays
        const rollStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0xffffff,
            stroke: { color: 0x000000, width: 2 },
        });

        // Center positions
        const yPos = 50;
        const startX = 70;
        const spacing = 70;

        // Roll 1
        this.roll1Text = new Text({
            text: '1',
            style: rollStyle,
        });
        this.roll1Text.anchor.set(0.5);
        this.roll1Text.position.set(startX, yPos);
        this.addChild(this.roll1Text);

        // Roll 2
        this.roll2Text = new Text({
            text: '1',
            style: rollStyle,
        });
        this.roll2Text.anchor.set(0.5);
        this.roll2Text.position.set(startX + spacing, yPos);
        this.addChild(this.roll2Text);

        // Roll 3
        this.roll3Text = new Text({
            text: '1',
            style: rollStyle,
        });
        this.roll3Text.anchor.set(0.5);
        this.roll3Text.position.set(startX + spacing * 2, yPos);
        this.addChild(this.roll3Text);
    }

    /**
     * Start rolling animation
     */
    roll(): void {
        if (this.isRolling) return;

        this.isRolling = true;
        this.rollDuration = 0;

        // Generate target values (simulating 4d6 drop lowest or just random)
        this.targetRolls = this.generateRolls();
    }

    /**
     * Generate 3 random dice rolls
     */
    private generateRolls(): number[] {
        return [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
        ];
    }

    /**
     * Update rolling animation
     */
    update(deltaTime: number): void {
        if (!this.isRolling) return;

        this.rollDuration += deltaTime;

        // Rolling phase (1.5 seconds)
        if (this.rollDuration < 90) { // 1.5 seconds at 60fps
            // Show random numbers while rolling
            if (Math.floor(this.rollDuration) % 3 === 0) {
                this.rolls = [
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                ];
                this.updateDisplay();
            }
        } else {
            // Stop rolling and show final values
            this.rolls = [...this.targetRolls];
            this.updateDisplay();
            this.isRolling = false;

            // Calculate final stat value
            const finalValue = this.rolls.reduce((sum, roll) => sum + roll, 0);

            // Notify callback
            if (this.options.onRollComplete) {
                this.options.onRollComplete(finalValue);
            }
        }
    }

    /**
     * Update text displays
     */
    private updateDisplay(): void {
        this.roll1Text.text = this.rolls[0].toString();
        this.roll2Text.text = this.rolls[1].toString();
        this.roll3Text.text = this.rolls[2].toString();
    }

    /**
     * Set stat value directly (for initialization)
     */
    setValue(value: number): void {
        // Distribute value across 3 dice as evenly as possible
        const avg = Math.floor(value / 3);
        const remainder = value % 3;

        this.rolls = [avg, avg, avg];
        for (let i = 0; i < remainder; i++) {
            this.rolls[i]++;
        }

        this.updateDisplay();
    }

    /**
     * Check if currently rolling
     */
    getRolling(): boolean {
        return this.isRolling;
    }
}
