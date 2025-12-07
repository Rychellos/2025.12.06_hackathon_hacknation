import {
  Container,
  Graphics,
  Text,
  TextStyle,
  Texture,
  Sprite,
  AnimatedSprite,
  Rectangle,
} from "pixi.js";

export interface UnitDisplayOptions {
  name: string;
  maxHp: number;
  currentHp?: number;
  maxShield?: number;
  currentShield?: number;
  showVisual?: boolean; // Option to hide the face visual if needed
  nameColor?: string;
  visualTexture?: Texture; // Optional texture to replace default face
  visualScaleX?: number;
  visualScaleY?: number;
  pixelated?: boolean;
}

export class UnitDisplay extends Container {
  private maxHp: number;
  private currentHp: number;
  private maxShield: number;
  private currentShield: number;

  private hpBar: Graphics;
  private shieldBar: Graphics;
  private hpText: Text;
  private shieldText: Text;
  private showVisual: boolean;

  public visualContainer: Container;
  private visualSprite?: Sprite;

  private scaleX: number;
  private scaleY: number;
  private pixelated: boolean;

  constructor(options: UnitDisplayOptions) {
    super();
    this.maxHp = options.maxHp;
    this.currentHp = options.currentHp ?? options.maxHp;
    this.maxShield = options.maxShield ?? 0;
    this.currentShield = options.currentShield ?? 0;
    this.showVisual = options.showVisual ?? true;
    this.scaleX = options.visualScaleX ?? 3;
    this.scaleY = options.visualScaleY ?? 3;
    this.pixelated = options.pixelated ?? false;

    this.visualContainer = new Container();
    this.addChild(this.visualContainer);

    if (this.showVisual) {
      if (options.visualTexture) {
        // Texture Visual
        if (this.pixelated) {
          options.visualTexture.source.scaleMode = "nearest";
        }
        this.visualSprite = new Sprite(options.visualTexture);
        this.visualSprite.anchor.set(0.5);
        this.visualSprite.scale.set(this.scaleX, this.scaleY);
        this.visualContainer.addChild(this.visualSprite);
      } else {
        // Default Visual Placeholder
        const visual = new Graphics();
        visual.circle(0, 0, 60);
        visual.fill({ color: 0xff0000 });
        visual.circle(-20, -10, 10);
        visual.circle(20, -10, 10);
        visual.fill({ color: 0xffffff });
        visual.rect(-30, 20, 60, 10);
        visual.fill({ color: 0x000000 });
        this.visualContainer.addChild(visual);
      }
    }

    // Name
    const nameStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: "bold",
      fill: options.nameColor ?? "#ffffff",
      stroke: { color: "#000000", width: 4 },
    });
    const nameText = new Text({
      text: options.name.toUpperCase(),
      style: nameStyle,
    });
    nameText.anchor.set(0.5, 1);
    // Move name higher: -130 if visual, else -30
    nameText.position.set(0, this.showVisual ? -130 : -30);
    this.addChild(nameText);

    // HP Bar Background
    const barWidth = 200;

    // HP Bar
    this.hpBar = new Graphics();
    // Move HP bar lower: 160 if visual, else 10
    this.hpBar.position.set(-barWidth / 2, this.showVisual ? 160 : 10);
    this.addChild(this.hpBar);

    this.hpText = new Text({
      text: `${this.currentHp}/${this.maxHp}`,
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 14,
        fill: "#ffffff",
        fontWeight: "bold",
        stroke: { color: "#000000", width: 2 },
      }),
    });
    this.hpText.anchor.set(0.5);
    // Update text position relative to bar
    this.hpText.position.set(0, this.showVisual ? 170 : 20);
    this.addChild(this.hpText);

    // Shield Bar
    this.shieldBar = new Graphics();
    // Shield relative to HP bar
    this.shieldBar.position.set(-barWidth / 2, this.showVisual ? 190 : 45);
    this.addChild(this.shieldBar);

    this.shieldText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "Arial",
        fontSize: 14,
        fill: "#00ffff",
        fontWeight: "bold",
        stroke: { color: "#000000", width: 2 },
      }),
    });
    this.shieldText.anchor.set(0.5);
    this.shieldText.position.set(0, this.showVisual ? 200 : 55);
    this.addChild(this.shieldText);

    this.updateVisuals();
  }

  public playAnimation(texture: Texture): void {
    // Assume horizontal strip with square frames based on height
    const frameHeight = texture.height;
    const frameWidth = frameHeight;
    const totalFrames = Math.floor(texture.width / frameWidth);

    const frames: Texture[] = [];
    if (this.pixelated) {
      texture.source.scaleMode = "nearest";
    }

    for (let i = 0; i < totalFrames; i++) {
      const rect = new Rectangle(i * frameWidth, 0, frameWidth, frameHeight);
      const frameTex = new Texture({
        source: texture.source,
        frame: rect,
      });
      frames.push(frameTex);
    }

    // Hide idle visual
    this.visualContainer.visible = false;

    const anim = new AnimatedSprite(frames);
    anim.anchor.set(0.5);
    anim.scale.set(this.scaleX, this.scaleY);
    anim.animationSpeed = 0.15;
    anim.loop = false;
    anim.onComplete = () => {
      anim.destroy();
      this.visualContainer.visible = true; // Restore idle
    };

    // Add slightly above 0,0 typically, but here 0,0 is center
    this.addChildAt(anim, this.getChildIndex(this.visualContainer) + 1);
    anim.play();
  }

  private updateVisuals(): void {
    const barWidth = 200;
    const barHeight = 20;

    // Draw HP
    this.hpBar.clear();
    // Background
    this.hpBar.rect(0, 0, barWidth, barHeight);
    this.hpBar.fill({ color: 0x330000 });
    // Foreground
    const hpPercent = Math.max(0, Math.min(1, this.currentHp / this.maxHp));
    this.hpBar.rect(0, 0, barWidth * hpPercent, barHeight);
    this.hpBar.fill({ color: 0xff0000 });
    // Border
    this.hpBar.rect(0, 0, barWidth, barHeight);
    this.hpBar.stroke({ color: 0xffffff, width: 2 });

    this.hpText.text = `${Math.ceil(this.currentHp)}/${this.maxHp}`;

    // Draw Shield
    this.shieldBar.clear();
    this.shieldText.text = "";

    if (this.maxShield > 0) {
      // Background
      this.shieldBar.rect(0, 0, barWidth, barHeight / 2); // Thinner bar for shield
      this.shieldBar.fill({ color: 0x001133 });
      // Foreground
      const shieldPercent = Math.max(
        0,
        Math.min(1, this.currentShield / this.maxShield),
      );
      this.shieldBar.rect(0, 0, barWidth * shieldPercent, barHeight / 2);
      this.shieldBar.fill({ color: 0x00ccff });
      // Border
      this.shieldBar.rect(0, 0, barWidth, barHeight / 2);
      this.shieldBar.stroke({ color: 0xffffff, width: 1 });

      if (this.currentShield > 0) {
        this.shieldText.text = `${Math.ceil(this.currentShield)}`;
      }
    }
  }

  public updateHealth(current: number, max?: number): void {
    this.currentHp = current;
    if (max !== undefined) this.maxHp = max;
    this.updateVisuals();
  }

  public updateShield(current: number, max?: number): void {
    this.currentShield = current;
    if (max !== undefined) this.maxShield = max;
    this.updateVisuals();
  }

  // Getter for current HP to check life state
  public get hp(): number {
    return this.currentHp;
  }

  public get shield(): number {
    return this.currentShield;
  }

  public setVisual(visual: Container): void {
    if (this.visualContainer) {
      this.visualContainer.removeChildren();
      this.visualContainer.addChild(visual);
    }
  }
}
