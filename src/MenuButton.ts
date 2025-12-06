import { Container, Graphics, Text, TextStyle } from "pixi.js";

export interface MenuButtonOptions {
  label: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

/**
 * Interactive menu button with hover effects
 */
export class MenuButton extends Container {
  private background: Graphics;
  private labelText: Text;
  private hovered = false;
  private options: Required<MenuButtonOptions>;

  constructor(options: MenuButtonOptions) {
    super();

    this.options = {
      width: 250,
      height: 60,
      onClick: () => {},
      ...options,
    };

    // Create background
    this.background = new Graphics();
    this.drawBackground(false);
    this.addChild(this.background);

    // Create label
    const labelStyle = new TextStyle({
      fontFamily: "Arial, sans-serif",
      fontSize: 24,
      fontWeight: "bold",
      fill: "#ffffff",
    });

    this.labelText = new Text({
      text: this.options.label,
      style: labelStyle,
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(
      this.options.width / 2,
      this.options.height / 2,
    );
    this.addChild(this.labelText);

    // Enable interactivity
    this.eventMode = "static";
    this.cursor = "pointer";

    // Add event listeners
    this.on("pointerover", this.onPointerOver.bind(this));
    this.on("pointerout", this.onPointerOut.bind(this));
    this.on("pointerdown", this.onPointerDown.bind(this));
  }

  private drawBackground(hovered: boolean): void {
    this.background.clear();

    if (hovered) {
      // Hovered state - brighter gradient
      this.background.rect(0, 0, this.options.width, this.options.height);
      this.background.fill({
        color: 0x4a90e2,
      });
      this.background.stroke({
        width: 3,
        color: 0x6ab7ff,
      });
    } else {
      // Normal state
      this.background.roundRect(
        0,
        0,
        this.options.width,
        this.options.height,
        10,
      );
      this.background.fill({
        color: 0x2c5aa0,
      });
      this.background.stroke({
        width: 2,
        color: 0x4a90e2,
      });
    }
  }

  private onPointerOver(): void {
    this.hovered = true;
    this.drawBackground(true);
    this.scale.set(1.05);
  }

  private onPointerOut(): void {
    this.hovered = false;
    this.drawBackground(false);
    this.scale.set(1);
  }

  private onPointerDown(): void {
    this.scale.set(0.95);
    setTimeout(() => {
      this.scale.set(this.hovered ? 1.05 : 1);
      this.options.onClick();
    }, 100);
  }
}
