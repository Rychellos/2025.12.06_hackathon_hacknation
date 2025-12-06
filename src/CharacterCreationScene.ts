import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { MenuButton } from './MenuButton';
import { StatDisplay } from './components/StatDisplay';
import { Character, generateRandomStats } from './CharacterUtils';

/**
 * Character creation scene
 */
export class CharacterCreationScene extends Container {
    private app: Application;
    private character: Character;
    private statDisplays: Map<string, StatDisplay> = new Map();
    private onComplete?: (character: Character) => void;
    private onBack?: () => void;

    constructor(app: Application, onComplete?: (character: Character) => void, onBack?: () => void) {
        super();
        this.app = app;
        this.onComplete = onComplete;
        this.onBack = onBack;

        // Generate initial stats
        this.character = {
            stats: generateRandomStats(),
        };

        this.createBackground();
        this.createTitle();
        this.createStatDisplays();
        this.createButtons();
        this.createInstructions();
    }

    private createBackground(): void {
        const bg = new Graphics();
        bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
        bg.fill({
            color: 0x0a0e27,
        });
        this.addChild(bg);

        // Add decorative elements
        const decoration = new Graphics();
        decoration.circle(100, 100, 150);
        decoration.fill({
            color: 0x1a1a3e,
            alpha: 0.3,
        });
        this.addChild(decoration);

        const decoration2 = new Graphics();
        decoration2.circle(this.app.screen.width - 100, this.app.screen.height - 100, 200);
        decoration2.fill({
            color: 0x1a1a3e,
            alpha: 0.2,
        });
        this.addChild(decoration2);
    }

    private createTitle(): void {
        const titleStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 48,
            fontWeight: 'bold',
            fill: 0xffffff,
            stroke: { color: 0x1a1a3e, width: 4 },
        });

        const title = new Text({
            text: 'CHARACTER CREATION',
            style: titleStyle,
        });
        title.anchor.set(0.5);
        title.position.set(this.app.screen.width / 2, 80);
        this.addChild(title);
    }

    private createStatDisplays(): void {
        const stats = [
            { key: 'strength', label: 'Strength', value: this.character.stats.strength },
            { key: 'dexterity', label: 'Dexterity', value: this.character.stats.dexterity },
            { key: 'constitution', label: 'Constitution', value: this.character.stats.constitution },
            { key: 'intelligence', label: 'Intelligence', value: this.character.stats.intelligence },
            { key: 'charisma', label: 'Charisma', value: this.character.stats.charisma },
        ];

        const startX = this.app.screen.width / 2 - 130;
        const startY = 160;
        const spacing = 65;

        stats.forEach((stat, index) => {
            const display = new StatDisplay({
                label: stat.label,
                value: stat.value,
            });
            display.position.set(startX, startY + index * spacing);
            this.addChild(display);
            this.statDisplays.set(stat.key, display);
        });
    }

    private createButtons(): void {
        const centerX = this.app.screen.width / 2;
        const bottomY = this.app.screen.height - 150;

        // Roll Stats Button
        const rollButton = new MenuButton({
            label: '🎲 ROLL STATS',
            width: 200,
            onClick: () => this.rollStats(),
        });
        rollButton.position.set(centerX - 230, bottomY);
        this.addChild(rollButton);

        // Accept Button
        const acceptButton = new MenuButton({
            label: '✓ ACCEPT',
            width: 180,
            onClick: () => {
                console.log('Character accepted:', this.character);
                if (this.onComplete) {
                    this.onComplete(this.character);
                }
            },
        });
        acceptButton.position.set(centerX - 90 + 10, bottomY);
        this.addChild(acceptButton);

        // Back Button
        const backButton = new MenuButton({
            label: '← BACK',
            width: 150,
            onClick: () => {
                if (this.onBack) {
                    this.onBack();
                }
            },
        });
        backButton.position.set(centerX + 100 + 20, bottomY);
        this.addChild(backButton);
    }

    private createInstructions(): void {
        const instructionStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fill: 0xaaaaaa,
            align: 'center',
        });

        const instructions = new Text({
            text: 'Roll stats using 4d6 drop lowest method\nClick ROLL STATS to generate new random stats',
            style: instructionStyle,
        });
        instructions.anchor.set(0.5);
        instructions.position.set(this.app.screen.width / 2, this.app.screen.height - 80);
        this.addChild(instructions);
    }

    private rollStats(): void {
        // Generate new stats
        this.character.stats = generateRandomStats();

        // Update all displays with animation
        const statKeys: (keyof typeof this.character.stats)[] = [
            'strength',
            'dexterity',
            'constitution',
            'intelligence',
            'charisma',
        ];

        statKeys.forEach((key, index) => {
            setTimeout(() => {
                const display = this.statDisplays.get(key);
                if (display) {
                    display.updateValue(this.character.stats[key]);
                }
            }, index * 50); // Stagger the updates for effect
        });
    }
}
