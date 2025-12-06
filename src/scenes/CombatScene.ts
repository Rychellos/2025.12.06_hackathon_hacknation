import { Application, Container, Text, TextStyle, Graphics } from "pixi.js";
import { MenuButton } from "../MenuButton";

import { LevelSelectScene } from "./LevelSelectScene";

type Choice = 'rock' | 'paper' | 'scissors';

export class CombatScene extends Container {
    private app: Application;
    private resultText!: Text;
    private choiceText!: Text;
    private background!: Graphics;

    constructor(app: Application) {
        super();
        this.app = app;

        this.createBackground();
        this.createUI();
    }

    private createBackground(): void {
        this.background = new Graphics();
        this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
        this.background.fill({ color: 0x1a1a2e });
        this.addChild(this.background);
    }

    private createUI(): void {
        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fontWeight: 'bold',
            fill: '#ffffff',
            align: 'center'
        });

        const title = new Text({ text: 'CHOOSE YOUR WEAPON', style: titleStyle });
        title.anchor.set(0.5);
        title.position.set(this.app.screen.width / 2, 100);
        this.addChild(title);

        // Result Text
        const resultStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: '#ffd700',
            align: 'center'
        });

        this.resultText = new Text({ text: '', style: resultStyle });
        this.resultText.anchor.set(0.5);
        this.resultText.position.set(this.app.screen.width / 2, 200);
        this.addChild(this.resultText);

        // Choice Text (Player vs Computer)
        const choiceStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: '#cccccc',
            align: 'center'
        });

        this.choiceText = new Text({ text: '', style: choiceStyle });
        this.choiceText.anchor.set(0.5);
        this.choiceText.position.set(this.app.screen.width / 2, 250);
        this.addChild(this.choiceText);

        // Buttons
        const buttonY = 400;
        const spacing = 200;
        const centerX = this.app.screen.width / 2;

        const rockBtn = new MenuButton({
            label: 'ROCK',
            width: 150,
            onClick: () => this.play('rock')
        });
        rockBtn.position.set(centerX - spacing - 75, buttonY);

        const paperBtn = new MenuButton({
            label: 'PAPER',
            width: 150,
            onClick: () => this.play('paper')
        });
        paperBtn.position.set(centerX - 75, buttonY);

        const scissorsBtn = new MenuButton({
            label: 'SCISSORS',
            width: 150,
            onClick: () => this.play('scissors')
        });
        scissorsBtn.position.set(centerX + spacing - 75, buttonY);

        this.addChild(rockBtn, paperBtn, scissorsBtn);

        // Back Button
        const backBtn = new MenuButton({
            label: 'BACK',
            width: 120,
            height: 50,
            onClick: () => {
                this.destroy();
                this.app.stage.addChild(new LevelSelectScene(this.app));
            }
        });
        backBtn.position.set(20, 20);
        this.addChild(backBtn);
    }

    private play(playerChoice: Choice): void {
        const choices: Choice[] = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];

        this.choiceText.text = `You: ${playerChoice.toUpperCase()}  vs  Computer: ${computerChoice.toUpperCase()}`;

        if (playerChoice === computerChoice) {
            this.resultText.text = "IT'S A DRAW!";
            this.resultText.style.fill = '#ffffff';
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            this.resultText.text = "YOU WIN!";
            this.resultText.style.fill = '#4ade80'; // Green
        } else {
            this.resultText.text = "YOU LOSE!";
            this.resultText.style.fill = '#ef4444'; // Red
        }
    }
}
