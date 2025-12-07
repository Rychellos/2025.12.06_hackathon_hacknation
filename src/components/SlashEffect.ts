import { Container, Texture, AnimatedSprite, Rectangle } from "pixi.js";

export class SlashEffect extends Container {
  private anim: AnimatedSprite;

  constructor(texture: Texture) {
    super();

    // Assume horizontal strip with square frames
    const frameHeight = texture.height;
    const frameWidth = frameHeight; // Square frames
    const totalFrames = Math.floor(texture.width / frameWidth);

    const frames: Texture[] = [];
    for (let i = 0; i < totalFrames; i++) {
      const rect = new Rectangle(i * frameWidth, 0, frameWidth, frameHeight);
      const frameTex = new Texture({
        source: texture.source,
        frame: rect,
      });
      frames.push(frameTex);
    }

    this.anim = new AnimatedSprite(frames);
    this.anim.anchor.set(0.5);
    this.anim.loop = false;
    this.anim.loop = false;
    this.anim.animationSpeed = 0.15; // Much slower
    this.anim.onComplete = () => {
      this.destroy();
    };

    this.addChild(this.anim);
    this.anim.play();
  }

  /**
   * Plays the slash effect on the target container.
   * @param target The container to attach the effect to.
   * @param texture The sprite sheet texture for the slash.
   */
  public static playOn(target: Container, texture: Texture): void {
    // Remove existing slash if any (identifiable by name or type)
    const existing = target.children.find((c) => c instanceof SlashEffect);
    if (existing) {
      existing.destroy();
    }

    const slash = new SlashEffect(texture);
    target.addChild(slash);
    slash.position.set(0, 0); // Center on target's origin
  }
}
