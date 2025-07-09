import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    // Полупрозрачный фон
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    
    // Заголовок
    this.add.text(400, 250, 'ПАУЗА', {
      fontSize: '64px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Инструкции
    this.add.text(400, 350, 'Нажмите ПРОБЕЛ для продолжения', {
      fontSize: '24px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(400, 380, 'или ESC для выхода в меню', {
      fontSize: '24px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Управление
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
    
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
      this.scene.stop();
    });
  }
} 