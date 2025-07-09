import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalLevel = data.level || 1;
  }

  create() {
    // Добавляем фон
    this.add.image(400, 300, 'background');
    
    // Заголовок
    this.add.text(400, 200, 'ИГРА ОКОНЧЕНА', {
      fontSize: '48px',
      fill: '#ff6b6b',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Результаты
    this.add.text(400, 280, `Очки: ${this.finalScore}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(400, 320, `Уровень: ${this.finalLevel}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Кнопка перезапуска
    const restartButton = this.add.text(400, 400, 'ИГРАТЬ СНОВА', {
      fontSize: '24px',
      fill: '#4ecdc4',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    restartButton.setInteractive();
    restartButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
    
    restartButton.on('pointerover', () => {
      restartButton.setScale(1.1);
    });
    
    restartButton.on('pointerout', () => {
      restartButton.setScale(1);
    });
    
    // Кнопка меню
    const menuButton = this.add.text(400, 450, 'ГЛАВНОЕ МЕНЮ', {
      fontSize: '24px',
      fill: '#96ceb4',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    menuButton.setInteractive();
    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    menuButton.on('pointerover', () => {
      menuButton.setScale(1.1);
    });
    
    menuButton.on('pointerout', () => {
      menuButton.setScale(1);
    });
    
    // Управление клавишами
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
    
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }
} 