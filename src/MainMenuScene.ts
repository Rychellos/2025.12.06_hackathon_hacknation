import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { MenuButton } from './MenuButton';
import { StatDisplay } from './components/StatDisplay';
import { CharacterScreenScene } from './views/CharacterScreenScene';

/**
 * Main menu scene for the game
 */
export class MainMenuScene extends Container {
    private app: Application;
    private particles: Graphics[] = [];
    private onPlayClick?: () => void;

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
    }

    private createBackground(): void {
        const bg = new Graphics();
        bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
        bg.fill({
            color: 0x0a0e27,
        });
        this.addChild(bg);
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

        const title = new Text({
            text: 'EPIC GAME',
            style: titleStyle,
        });
        title.anchor.set(0.5);
        title.position.set(this.app.screen.width / 2, 150);

        this.addChild(title);

        // Add pulse animation to title
        let elapsed = 0;
        this.app.ticker.add((time) => {
            elapsed += time.deltaTime * 0.05;
            title.scale.set(1 + Math.sin(elapsed) * 0.05);
        });
    }

    private createButtons(): void {
        const centerX = this.app.screen.width / 2;
        const startY = this.app.screen.height / 2 + 50;
        const spacing = 80;

        // Play Button
        const playButton = new MenuButton({
            label: '▶ PLAY',
            onClick: () => {
                console.log('Play button clicked!');
                if (this.onPlayClick) {
                    this.onPlayClick();
                } else {
                    this.destroy();

                    this.app.stage.addChild(new CharacterScreenScene(this.app))
                }
            },
        });
        playButton.position.set(centerX - playButton.width / 2, startY);
        this.addChild(playButton);

        // Settings Button
        const settingsButton = new MenuButton({
            label: '⚙ SETTINGS',
            onClick: () => {
                console.log('Settings button clicked!');
                alert('Opening settings...');
            },
        });
        settingsButton.position.set(centerX - settingsButton.width / 2, startY + spacing);
        this.addChild(settingsButton);

        // Quit Button
        const quitButton = new MenuButton({
            label: '✖ QUIT',
            onClick: () => {
                console.log('Quit button clicked!');
                if (confirm('Are you sure you want to quit?')) {
                    alert('Thanks for playing!');
                }
            },
        });
        quitButton.position.set(centerX - quitButton.width / 2, startY + spacing * 2);
        this.addChild(quitButton);
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

    destroy(): void {
        this.app.ticker.remove(this.update.bind(this));
        super.destroy();
    }
}
