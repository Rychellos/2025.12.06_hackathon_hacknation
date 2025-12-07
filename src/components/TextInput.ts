import { Container, Graphics, Text, TextStyle } from "pixi.js";

export interface TextInputOptions {
  label: string;
  placeholder?: string;
  width?: number;
  height?: number;
  isPassword?: boolean;
}

export class TextInput extends Container {
  private background: Graphics;
  private inputText: Text;
  private placeholderText: Text;
  private labelText: Text;
  private cursorGraphics: Graphics;

  private value = "";
  private isFocused = false;
  private options: Required<TextInputOptions>;
  private blinkInterval: number | null = null;

  // Static property to track globally focused input
  private static currentlyFocused: TextInput | null = null;

  constructor(options: TextInputOptions) {
    super();

    this.options = {
      width: 300,
      height: 50,
      placeholder: "",
      isPassword: false,
      ...options,
    };

    // Label
    const labelStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 16,
      fill: "#cccccc",
    });
    this.labelText = new Text({ text: this.options.label, style: labelStyle });
    this.labelText.position.set(0, -25);
    this.addChild(this.labelText);

    // Background
    this.background = new Graphics();
    this.drawBackground(false);
    this.addChild(this.background);

    // Placeholder
    const placeholderStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#666666",
      fontStyle: "italic",
    });
    this.placeholderText = new Text({
      text: this.options.placeholder,
      style: placeholderStyle,
    });
    this.placeholderText.anchor.set(0, 0.5);
    this.placeholderText.position.set(10, this.options.height / 2);
    this.addChild(this.placeholderText);

    // Input Text
    const inputStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#ffffff",
    });
    this.inputText = new Text({ text: "", style: inputStyle });
    this.inputText.anchor.set(0, 0.5);
    this.inputText.position.set(10, this.options.height / 2);
    this.addChild(this.inputText);

    // Cursor
    this.cursorGraphics = new Graphics();
    this.cursorGraphics.rect(0, 0, 2, 24);
    this.cursorGraphics.fill({ color: 0xffffff });
    this.cursorGraphics.position.set(10, this.options.height / 2 - 12);
    this.cursorGraphics.visible = false;
    this.addChild(this.cursorGraphics);

    // Make container interactive for proper event handling
    this.eventMode = "static";

    // Interaction
    this.background.eventMode = "static";
    this.background.cursor = "text";
    this.background.on("pointerdown", (e) => {
      e.stopPropagation();
      this.focus();
    });

    // Global click to blur
    window.addEventListener("pointerdown", this.onGlobalClick);

    // Keyboard events
    window.addEventListener("keydown", this.onKeyDown);
  }

  private onGlobalClick = (): void => {
    // Just a simple check, in a real app checking bounds is better
    // But since we stopPropagation on the input click, this mostly works for clicking 'outside'
    // except PIXI events vs DOM events mismatch.
    // We rely on the PIXI event propagation for focus.
    // To blur, we can add a listener to the Stage in the main scene, but for now:
    // We'll require manual Blur logic from outside or rely on the user clicking another input.
    // Actually, let's just blur if we click the *canvas* and it wasn't on us?
    // Hard to track from component.
    // Let's provide a public blur method.
  };

  public blur(): void {
    if (!this.isFocused) return;
    this.isFocused = false;
    // Clear global focus if this was the focused input
    if (TextInput.currentlyFocused === this) {
      TextInput.currentlyFocused = null;
    }
    this.drawBackground(false);
    this.stopCursorBlink();
    this.cursorGraphics.visible = false;
  }

  public focus(): void {
    if (this.isFocused) return;

    // Blur the previously focused input
    if (TextInput.currentlyFocused && TextInput.currentlyFocused !== this) {
      TextInput.currentlyFocused.blur();
    }

    this.isFocused = true;
    TextInput.currentlyFocused = this;
    this.drawBackground(true);
    this.startCursorBlink();
    this.updateCursorPos();
  }

  public getValue(): string {
    return this.value;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.isFocused) return;

    if (e.key === "Backspace") {
      this.value = this.value.slice(0, -1);
    } else if (e.key.length === 1) {
      this.value += e.key;
    }

    this.updateText();
  };

  private updateText(): void {
    if (this.options.isPassword) {
      this.inputText.text = "*".repeat(this.value.length);
    } else {
      this.inputText.text = this.value;
    }

    this.placeholderText.visible = this.value.length === 0;
    this.updateCursorPos();
  }

  private updateCursorPos(): void {
    const width = this.inputText.width;
    this.cursorGraphics.x = 10 + width + 1;
  }

  private drawBackground(focused: boolean): void {
    this.background.clear();
    this.background.rect(0, 0, this.options.width, this.options.height);
    this.background.fill({ color: 0x222222, alpha: 0.8 });

    if (focused) {
      this.background.stroke({ width: 2, color: 0x4a90e2 });
    } else {
      this.background.stroke({ width: 1, color: 0x666666 });
    }
  }

  private startCursorBlink(): void {
    this.stopCursorBlink();
    this.cursorGraphics.visible = true;
    this.blinkInterval = window.setInterval(() => {
      this.cursorGraphics.visible = !this.cursorGraphics.visible;
    }, 500);
  }

  private stopCursorBlink(): void {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public destroy(options?: any): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("pointerdown", this.onGlobalClick);
    this.stopCursorBlink();
    super.destroy(options);
  }
}
