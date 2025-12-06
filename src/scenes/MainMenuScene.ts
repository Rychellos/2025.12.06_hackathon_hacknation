import { Application, Container, Graphics, Sprite } from "pixi.js";

import { LevelSelectScene } from "./LevelSelectScene";
import { ImageButton } from "../components/ImageButton";
import {
  background,
  playButton,
  rankingButton,
  settingsButton,
  logo,
} from "../AssetManager";

/**
 * Main menu scene for the game
 */
export class MainMenuScene extends Container {
  private app: Application;
  private particles: Graphics[] = [];
  private onPlayClick?: () => void;

  // UI Elements
  private background!: Graphics;
  private title!: Sprite;
  private playButton!: ImageButton;
  private settingsButton!: ImageButton;
  private rankingButton!: ImageButton;

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
    window.addEventListener("resize", this.onResize);
  }

  private createBackground(): void {
    this.background = new Graphics();
    this.updateBackground();
    this.addChild(this.background);
  }

  private updateBackground(): void {
    this.background.clear();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(background);
  }

  private createParticles(): void {
    // Create floating particles in background
    for (let i = 0; i < 30; i++) {
      const particle = new Graphics();
      const size = Math.random() * 32 + 8;
      particle.circle(0, 0, size);
      particle.fill({
        color: 0x4a90e2,
        alpha: Math.random() * 0.5 + 0.1,
      });

      particle.x = Math.random() * this.app.screen.width;
      particle.y = Math.random() * this.app.screen.height;

      // Store velocity data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (particle as any).vx = (Math.random() - 0.5) * 0.5;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (particle as any).vy = (Math.random() - 0.5) * 0.5;

      this.particles.push(particle);
      this.addChild(particle);
    }
  }

  private createTitle(): void {
    this.title = new Sprite(logo);
    this.title.anchor.set(0.5);
    this.positionTitle();

    this.addChild(this.title);

    // Add pulse animation to title
    let elapsed = 0;
    const baseScale = 0.27;
    this.app.ticker.add((time) => {
      elapsed += time.deltaTime * 0.05;
      // Pulse scale relative to base scale
      const pulse = 1 + Math.sin(elapsed) * 0.05;
      this.title.scale.set(baseScale * pulse);
    });
  }

  private positionTitle(): void {
    this.title.position.set(this.app.screen.width / 2, 150);
  }

  private createButtons(): void {
    // Play Button
    this.playButton = new ImageButton({
      label: "",
      onClick: () => {
        console.log("Play button clicked!");

        if (this.onPlayClick) {
          this.onPlayClick();
        } else {
          this.destroy();
          this.app.stage.addChild(new LevelSelectScene(this.app));
        }
      },
      texture: playButton,
    });

    this.addChild(this.playButton);

    // Settings Button
    this.settingsButton = new ImageButton({
      label: "",
      onClick: () => {
        console.log("Settings button clicked!");
        alert("Opening settings...");
      },
      texture: settingsButton,
    });
    this.addChild(this.settingsButton);

    // Ranking Button
    this.rankingButton = new ImageButton({
      label: "",
      onClick: () => {
        console.log("Ranking button clicked!");

        alert("View ranks!");
      },
      texture: rankingButton,
    });
    this.addChild(this.rankingButton);

    // Position buttons
    this.positionButtons();
  }

  private positionButtons(): void {
    const centerX = this.app.screen.width / 2;
    const startY = this.app.screen.height / 2 + 50;
    const spacing = 80;

    this.playButton.position.set(centerX - this.playButton.width / 2, startY);
    this.settingsButton.position.set(
      centerX - this.settingsButton.width / 2,
      startY + spacing,
    );
    this.rankingButton.position.set(
      centerX - this.rankingButton.width / 2,
      startY + spacing * 2,
    );
  }

  private update(): void {
    // Animate particles
    this.particles.forEach((particle) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      particle.x += (particle as any).vx;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    window.removeEventListener("resize", this.onResize);
    super.destroy();
  }
}
