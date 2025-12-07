import { Container, Sprite, Text, TextStyle, Texture } from "pixi.js";

export interface ImageButtonOptions {
  texture: Texture;
  label?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  hoverTexture?: Texture;
  activeTexture?: Texture;
  scale?: number;
  hoverScale?: boolean
}

/**
 * Interactive button component with image background
 */
export class ImageButton extends Container {
  private background: Sprite;
  private labelText?: Text;
  private hovered = false;
  private options: Required<
    Omit<ImageButtonOptions, "label" | "hoverTexture" | "activeTexture">
  > &
    Pick<ImageButtonOptions, "label" | "hoverTexture" | "activeTexture">;

  constructor(options: ImageButtonOptions) {
    super();

    this.options = {
      width: options.texture.width,
      height: options.texture.height,
      onClick: () => { },
      scale: 1,
      ...options,
      hoverScale: options.hoverScale !== undefined ? options.hoverScale : true,
    };

    // Create background sprite
    this.background = new Sprite(options.texture);
    this.background.texture.source.scaleMode = "nearest"; // Disable smoothing
    this.background.anchor.set(0.5); // Center anchor
    this.background.width = this.options.width;
    this.background.height = this.options.height;
    this.background.position.set(0, 0); // Centered in container
    this.addChild(this.background);

    // Create label if provided
    if (this.options.label) {
      const labelStyle = new TextStyle({
        fontFamily: "Arial, sans-serif",
        fontSize: 24,
        fontWeight: "bold",
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 2 },
      });

      this.labelText = new Text({
        text: this.options.label,
        style: labelStyle,
      });
      this.labelText.anchor.set(0.5);
      this.labelText.position.set(0, 0); // Centered
      this.addChild(this.labelText);
    }

    // Set initial scale
    this.scale.set(this.options.scale);

    // Enable interactivity
    this.eventMode = "static";
    this.cursor = "pointer";

    // Add event listeners
    this.on("pointerover", this.onPointerOver.bind(this));
    this.on("pointerout", this.onPointerOut.bind(this));
    this.on("pointerdown", this.onPointerDown.bind(this));
  }

  private onPointerOver(): void {
    this.hovered = true;

    // Switch to hover texture if available
    if (this.options.hoverTexture) {
      this.background.texture = this.options.hoverTexture;
    }

    // Scale up slightly
    if (this.options.hoverScale) {
      this.scale.set(this.options.scale * 1.05);
    }
  }

  private onPointerOut(): void {
    this.hovered = false;

    // Switch back to normal texture
    this.background.texture = this.options.texture;

    // Reset scale
    this.scale.set(this.options.scale);
  }

  private onPointerDown(): void {
    // Scale down for click feedback
    this.scale.set(this.options.scale * 0.95);

    // Switch to active texture if available
    if (this.options.activeTexture) {
      this.background.texture = this.options.activeTexture;
    }

    setTimeout(() => {
      this.scale.set(
        this.hovered ? this.options.scale * 1.05 : this.options.scale,
      );

      // Revert texture
      if (this.options.activeTexture) {
        this.background.texture = this.hovered
          ? this.options.hoverTexture || this.options.texture
          : this.options.texture;
      }

      this.options.onClick();
    }, 100);
  }

  /**
   * Update button texture
   */
  setTexture(texture: Texture, hoverTexture?: Texture): void {
    this.options.texture = texture;
    if (hoverTexture) {
      this.options.hoverTexture = hoverTexture;
    }

    if (!this.hovered) {
      this.background.texture = texture;
    }
  }

  /**
   * Update button label
   */
  setLabel(label: string): void {
    if (this.labelText) {
      this.labelText.text = label;
    }
  }

  /**
   * Update button size
   */
  setSize(width: number, height: number): void {
    this.options.width = width;
    this.options.height = height;
    this.background.width = width;
    this.background.height = height;

    if (this.labelText) {
      this.labelText.position.set(0, 0);
    }
  }
}
