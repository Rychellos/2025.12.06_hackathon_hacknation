import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
<<<<<<< HEAD:src/MainMenuScene.ts
import { MenuButton } from './MenuButton';


import { CombatScene } from './views/CombatScene';
import { LevelSelectScene } from './views/LevelSelectScene';
=======
import { MenuButton } from '../MenuButton';
import { CharacterScreenScene } from './CharacterScreenScene';
>>>>>>> master:src/scenes/MainMenuScene.ts

/**
 * Main menu scene for the game
 */
export class MainMenuScene extends Container {
    private app: Application;
    private particles: Graphics[] = [];
    private onPlayClick?: () => void;

    // UI Elements
    private background!: Graphics;
    private title!: Text;
    private playButton!: MenuButton;
    private fightButton!: MenuButton;
    private settingsButton!: MenuButton;
    private quitButton!: MenuButton;

    constructor(app: Application, onPlayClick?: () => void) {
        super();
        this.app = app;
        this.onPlayClick = onPlayClick;

        this.createBackground();
        this.createParticles();
        this.createTitle();
        this.createButtons();

        // Start animation loop
        this.app.ticker.add(this.update.bind(this));

        // Listen for resize events
        window.addEventListener('resize', this.onResize);
    }

    private createBackground(): void {
        this.background = new Graphics();
        this.updateBackground();
        this.addChild(this.background);
    }

    private updateBackground(): void {
        this.background.clear();
        this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
        this.background.fill({
            color: 0x0a0e27,
        });
    }

    private createParticles(): void {
        // Create floating particles in background
        for (let i = 0; i < 30; i++) {
            const particle = new Graphics();
            const size = Math.random() * 3 + 1;
            particle.circle(0, 0, size);
            particle.fill({
                color: 0x4a90e2,
                alpha: Math.random() * 0.5 + 0.1,
            });

            particle.x = Math.random() * this.app.screen.width;
            particle.y = Math.random() * this.app.screen.height;

            // Store velocity data
            (particle as any).vx = (Math.random() - 0.5) * 0.5;
            (particle as any).vy = (Math.random() - 0.5) * 0.5;

            this.particles.push(particle);
            this.addChild(particle);
        }
    }

    private createTitle(): void {
        const titleStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 72,
            fontWeight: 'bold',
            fill: 0xffffff,
            stroke: { color: 0x1a1a3e, width: 5 },
            dropShadow: {
                color: 0x4a90e2,
                blur: 10,
                angle: Math.PI / 3,
                distance: 5,
            },
        });

        this.title = new Text({
            text: 'EPIC GAME',
            style: titleStyle,
        });
        this.title.anchor.set(0.5);
        this.positionTitle();

        this.addChild(this.title);

        // Add pulse animation to title
        let elapsed = 0;
        this.app.ticker.add((time) => {
            elapsed += time.deltaTime * 0.05;
            this.title.scale.set(1 + Math.sin(elapsed) * 0.05);
        });
    }

    private positionTitle(): void {
        this.title.position.set(this.app.screen.width / 2, 150);
    }

    private createButtons(): void {
        // Play Button
        this.playButton = new MenuButton({
            label: '▶ PLAY',
            onClick: () => {
                console.log('Play button clicked!');
                if (this.onPlayClick) {
                    this.onPlayClick();
                } else {
                    this.destroy();
                    this.app.stage.addChild(new LevelSelectScene(this.app));
                }
            },
        });
        this.addChild(this.playButton);

        // Fight Button
        this.fightButton = new MenuButton({
            label: '⚔ FIGHT',
            onClick: () => {
                this.destroy();
                this.app.stage.addChild(new CombatScene(this.app));
            },
        });
        this.addChild(this.fightButton);

        // Settings Button
        this.settingsButton = new MenuButton({
            label: '⚙ SETTINGS',
            onClick: () => {
                console.log('Settings button clicked!');
                alert('Opening settings...');
            },
        });
        this.addChild(this.settingsButton);

        // Quit Button
        this.quitButton = new MenuButton({
            label: '✖ QUIT',
            onClick: () => {
                console.log('Quit button clicked!');
                if (confirm('Are you sure you want to quit?')) {
                    alert('Thanks for playing!');
                }
            },
        });
        this.addChild(this.quitButton);

        // Position buttons
        this.positionButtons();
    }

    private positionButtons(): void {
        const centerX = this.app.screen.width / 2;
        const startY = this.app.screen.height / 2 + 50;
        const spacing = 80;

        this.playButton.position.set(centerX - this.playButton.width / 2, startY);
        this.fightButton.position.set(centerX - this.fightButton.width / 2, startY + spacing);
        this.settingsButton.position.set(centerX - this.settingsButton.width / 2, startY + spacing * 2);
        this.quitButton.position.set(centerX - this.quitButton.width / 2, startY + spacing * 3);
    }

    private update(): void {
        // Animate particles
        this.particles.forEach((particle) => {
            particle.x += (particle as any).vx;
            particle.y += (particle as any).vy;

            // Wrap around screen
            if (particle.x < 0) particle.x = this.app.screen.width;
            if (particle.x > this.app.screen.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.app.screen.height;
            if (particle.y > this.app.screen.height) particle.y = 0;
        });
    }


    private onResize = (): void => {
        // Update background size
        this.updateBackground();

        // Reposition title
        this.positionTitle();

        // Reposition buttons
        this.positionButtons();
    };

    destroy(): void {
        this.app.ticker.remove(this.update.bind(this));
        window.removeEventListener('resize', this.onResize);
        super.destroy();
    }
}
