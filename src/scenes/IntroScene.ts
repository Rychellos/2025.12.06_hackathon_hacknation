import { Application, Container, Graphics, Sprite, Assets } from "pixi.js";
import { LevelSelectScene } from "./LevelSelectScene";

let introPlayed = false;

export class IntroScene extends Container {
  private app: Application;
  private videoSprite!: Sprite;
  private background!: Graphics;
  private videoSource: HTMLVideoElement | null = null;
  private isTransitioning: boolean = false;

  constructor(app: Application) {
    super();
    this.app = app;

    this.createBackground();
    this.initVideo();
    this.setupInput();
  }

  private createBackground(): void {
    // Black background behind video
    this.background = new Graphics();
    this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.background.fill(0x000000);
    this.addChild(this.background);
  }

  private async initVideo(): Promise<void> {
    try {
      // Load the video texture
      const texture = await Assets.load(
        (await import("../assets/intro.mp4")).default,
      );

      if (this.isTransitioning) return;

      // The source is the underlying video element
      this.videoSource = texture.source.resource as HTMLVideoElement;

      // Create sprite from texture
      this.videoSprite = new Sprite(texture);

      // Center and scale video
      this.videoSprite.anchor.set(0.5);
      this.videoSprite.x = this.app.screen.width / 2;
      this.videoSprite.y = this.app.screen.height / 2;

      // Scale to fit (contain) or cover? usually cover or contain.
      // Let's fit it within the screen with some margin (frame)
      const margin = 0; // Remove margin
      const availableWidth = this.app.screen.width - margin * 2;
      const availableHeight = this.app.screen.height - margin * 2;

      const scaleX = availableWidth / this.videoSprite.width;
      const scaleY = availableHeight / this.videoSprite.height;
      const scale = Math.min(scaleX, scaleY);

      this.videoSprite.scale.set(scale);

      this.addChild(this.videoSprite);

      // Play video
      if (this.videoSource && !introPlayed) {
        introPlayed = true;
        this.videoSource.currentTime = 0;
        this.videoSource.muted = false; // Enable sound
        this.videoSource.loop = false;

        // Listen for end
        this.videoSource.onended = () => {
          this.transitionToNextScene();
        };

        const playPromise = this.videoSource.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.warn("Video autoplay failed, waiting for interaction", e);
            // If autoplay fails, we wait for the user to click (setupInput handles this)
          });
        }
      }
    } catch (e) {
      console.error("Failed to load video", e);
      this.transitionToNextScene();
    }
  }

  private setupInput(): void {
    // Create a transparent interactive overlay to catch clicks anywhere
    const overlay = new Graphics();
    overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.fill({ color: 0x000000, alpha: 0.01 }); // Almost transparent
    overlay.eventMode = "static";
    overlay.cursor = "pointer";
    this.addChild(overlay);

    const handleInteraction = () => {
      if (
        this.videoSource &&
        this.videoSource.paused &&
        !this.videoSource.ended &&
        !introPlayed
      ) {
        // Try to play if paused (and not ended)
        this.videoSource.play().catch(() => this.transitionToNextScene());
      } else {
        // Skip if playing or ended
        this.transitionToNextScene();
      }
    };

    // Skip/Play on click
    overlay.on("pointerdown", handleInteraction);

    // Also skip/play on key press
    window.addEventListener("keydown", () => handleInteraction());
  }

  private transitionToNextScene(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Cleanup video
    if (this.videoSource) {
      this.videoSource.pause();
      this.videoSource.onended = null;
    }

    // Remove listener
    // window.removeEventListener("keydown", this.onKeyDown); // Removed as we use anonymous function now

    // Remove from stage before destroying
    this.app.stage.removeChild(this);

    // Go to LevelSelect
    this.destroy({ children: true });

    this.app.stage.addChild(new LevelSelectScene(this.app));
  }
}
