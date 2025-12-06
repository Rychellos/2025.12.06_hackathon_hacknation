import { Container, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { slotySheet } from '../AssetManager';

export interface SlotMachineOptions {
    onRollComplete?: (value: number) => void;
    onClick?: () => void;
}

/**
 * Slot machine component that displays 3 rolling numbers over a spritesheet background
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
    private availableFrames: Texture[] = [];
    private currentFrameIndex = 0;

    constructor(options: SlotMachineOptions) {
        super();
        this.options = options;

        // Get all available frames from the spritesheet
        this.availableFrames = Object.values(slotySheet.textures);

        // Use first frame from spritesheet as background
        this.background = new Sprite(this.availableFrames[0]);

        // Disable smoothing for crisp pixel art
        this.background.texture.source.scaleMode = 'nearest';

        // Scale only the background by 3x
        this.background.scale.set(3);

        this.addChild(this.background);

        // Create rolling number displays
        const rollStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0xffffff,
            stroke: { color: 0x000000, width: 2 },
        });

        // Position text over the 3 number slots in the spritesheet
        const yPos = this.background.height / 2 + 15;
        const startX = this.background.width / 5 - 4;
        const spacing = this.background.width / 5 - 2;

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

        // Make clickable
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', () => {
            // Cooldown - only allow clicks when not rolling
            if (!this.isRolling && this.options.onClick) {
                this.options.onClick();
            }
        });
    }

    /**
     * Start rolling animation
     */
    roll(targetFrame: number = 0): void {
        if (this.isRolling) return;

        this.isRolling = true;
        this.rollDuration = 0;

        // Store target frame (0 for normal, 4 for no rerolls)
        this.currentFrameIndex = targetFrame;

        // Change cursor to indicate cooldown
        this.cursor = 'not-allowed';

        // Generate target values (simulating dice rolls)
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

        const totalFrames = this.availableFrames.length;
        const animationDuration = 120; // 2 seconds at 60fps
        const framesPerCycle = Math.floor(animationDuration / totalFrames);

        // Calculate which frame to show based on time
        let frameIndex = Math.floor(this.rollDuration / framesPerCycle);

        // If target frame is not 0 (e.g., 4), cap the animation at that frame
        if (this.currentFrameIndex > 0) {
            frameIndex = Math.min(frameIndex, this.currentFrameIndex);
        } else {
            // Normal cycle - wrap around
            frameIndex = frameIndex % totalFrames;
        }

        // Update background texture
        this.background.texture = this.availableFrames[frameIndex];

        // Show random numbers while rolling - update every 2 frames for smoother animation
        if (Math.floor(this.rollDuration) % 2 === 0 && this.rollDuration < animationDuration) {
            this.rolls = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
            ];
            this.updateDisplay();
        }

        // Check if animation is complete (one full cycle or reached target frame)
        if (this.rollDuration >= animationDuration) {
            // Stop rolling and show final values
            this.rolls = [...this.targetRolls];
            this.updateDisplay();
            this.isRolling = false;

            // Set to target frame (0 normally, 4 when out of rerolls)
            this.background.texture = this.availableFrames[this.currentFrameIndex];

            // Re-enable cursor
            this.cursor = 'pointer';

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
