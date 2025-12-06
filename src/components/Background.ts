import { Container, Graphics, Sprite, Texture, TilingSprite } from "pixi.js";

export interface BackgroundOptions {
  width: number;
  height: number;
  color?: number;
  alpha?: number;
  texture?: Texture;
  tiling?: boolean; // If true, uses TilingSprite to repeat texture
}

/**
 * Basic background component
 * Supports both solid colors and textures
 */
export class Background extends Container {
  private bg!: Graphics | Sprite | TilingSprite;
  private options: Required<Omit<BackgroundOptions, "texture" | "tiling">> &
    Pick<BackgroundOptions, "texture" | "tiling">;

  constructor(options: BackgroundOptions) {
    super();

    this.options = {
      color: 0x0a0e27,
      alpha: 1,
      tiling: false,
      ...options,
    };

    this.createBackground();
  }

  private createBackground(): void {
    // Remove old background if exists
    if (this.bg) {
      this.removeChild(this.bg);
      this.bg.destroy();
    }

    if (this.options.texture) {
      // Create background from texture
      if (this.options.tiling) {
        // Use TilingSprite to repeat the texture
        this.bg = new TilingSprite({
          texture: this.options.texture,
          width: this.options.width,
          height: this.options.height,
        });
      } else {
        // Use regular Sprite and scale to fit
        this.bg = new Sprite(this.options.texture);
        this.bg.width = this.options.width;
        this.bg.height = this.options.height;
      }
      this.bg.alpha = this.options.alpha;
    } else {
      // Create solid color background
      this.bg = new Graphics();
      this.bg.rect(0, 0, this.options.width, this.options.height);
      this.bg.fill({
        color: this.options.color,
        alpha: this.options.alpha,
      });
    }

    this.addChild(this.bg);
  }

  /**
   * Update background color (only works for solid color backgrounds)
   */
  setColor(color: number, alpha?: number): void {
    this.options.color = color;
    if (alpha !== undefined) {
      this.options.alpha = alpha;
    }
    this.options.texture = undefined;
    this.createBackground();
  }

  /**
   * Update background texture
   */
  setTexture(texture: Texture, tiling: boolean = false): void {
    this.options.texture = texture;
    this.options.tiling = tiling;
    this.createBackground();
  }

  /**
   * Update background size
   */
  setSize(width: number, height: number): void {
    this.options.width = width;
    this.options.height = height;

    if (this.bg instanceof Graphics) {
      this.bg.clear();
      this.bg.rect(0, 0, width, height);
      this.bg.fill({
        color: this.options.color,
        alpha: this.options.alpha,
      });
    } else {
      this.bg.width = width;
      this.bg.height = height;
    }
  }
}
