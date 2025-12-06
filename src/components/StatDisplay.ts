import { Application, Container, Graphics, loadImageBitmap, Text, TextStyle } from 'pixi.js';
import { getStatColor, getStatModifier } from '../CharacterUtils';
import { button_test } from '../AssetManager';
import { Background } from './Background';

export interface UserStatData {
    label: string;
    value: number;
}

/**
 * Display component for a single character stat
 */
export class StatDisplay extends Container {
    private labelText: Text;
    private valueText: Text;
    private modifierText: Text;
    private app: Application;
    private options: UserStatData;

    constructor(app: Application, options: UserStatData) {
        super();

        this.app = app;
        this.options = options;

        // Create background
        // const background = button_test;
        // this.updateBackground(256, 64);
        this.addChild(new Background({
            texture: button_test,
            width: 256,
            height: 64,
        }));

        // Create label
        const labelStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'bold',
            fill: 0xcccccc,
        });

        this.labelText = new Text({
            text: options.label.toUpperCase(),
            style: labelStyle,
        });

        this.labelText.anchor.set(0, 0.5);
        this.labelText.position.set(16, 32);
        this.addChild(this.labelText);

        // Create value
        const valueStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 32,
            fontWeight: 'bold',
            fill: getStatColor(options.value),
        });

        this.valueText = new Text({
            text: options.value.toString(),
            style: valueStyle,
        });

        this.valueText.anchor.set(0.5);
        this.valueText.position.set(200, 32);
        this.addChild(this.valueText);

        // Create modifier
        const modifier = getStatModifier(options.value);
        const modifierStyle = new TextStyle({
            fontFamily: 'Arial, sans-serif',
            fontSize: 18,
            fontWeight: 'normal',
            fill: 0xaaaaaa,
        });

        this.modifierText = new Text({
            text: modifier >= 0 ? `+${modifier}` : modifier.toString(),
            style: modifierStyle,
        });

        this.modifierText.anchor.set(0.5, 1);
        this.modifierText.position.set(230, 32);
        this.addChild(this.modifierText);

        this.app.ticker.add(this.update);
    }

    private update = () => {
        const modifier = getStatModifier(this.options.value);
        this.modifierText.text = modifier >= 0 ? `+${modifier}` : modifier.toString();

        this.valueText.style.fill = getStatColor(this.options.value);
        this.modifierText.style.fill = modifier >= 0 ? 0xaaaaaa : 0xaaaaaa;
    }

    /**
     * Update the stat value
     */
    updateValue(): void {
        // this.currentValue = newValue;
        // this.valueText.text = newValue.toString();
        // this.valueText.style.fill = getStatColor(newValue);

        // const modifier = getStatModifier(newValue);
        // this.modifierText.text = modifier >= 0 ? `+${modifier}` : modifier.toString();

        // this.updateBackground(256, 64);
    }

    // private updateBackground(width: number, height: number): void {
    //     this.background.clear();
    //     this.background.roundRect(0, 0, width, height, 8);

    //     this.background.fill({
    //         color: 0x1a1a2e,
    //     });

    //     this.background.stroke({
    //         width: 2,
    //         color: getStatColor(this.currentValue),
    //         alpha: 0.5,
    //     });
    // }
}
