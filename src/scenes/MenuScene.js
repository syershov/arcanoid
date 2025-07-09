import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Добавляем фон
    this.add.image(400, 300, 'background');

    // Добавляем заголовок
    this.add.text(400, 200, 'ARCANOID', {
      fontSize: '64px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Добавляем подзаголовок
    this.add.text(400, 280, 'Классическая аркадная игра', {
      fontSize: '24px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Добавляем инструкции
    const instructions = [
      'Управление:',
      '← → или A D - движение платформы',
      'ПРОБЕЛ - пауза',
      'ESC - меню'
    ];

    instructions.forEach((text, index) => {
      this.add.text(400, 350 + index * 30, text, {
        fontSize: index === 0 ? '20px' : '16px',
        fill: index === 0 ? '#ffffff' : '#aaaaaa',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });

    // Добавляем анимированные элементы для красоты
    this.createAnimatedElements();
  }

  createAnimatedElements() {
    // Создаем несколько анимированных блоков для украшения
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57];
    
    for (let i = 0; i < 5; i++) {
      const brick = this.add.rectangle(
        100 + i * 120, 
        100, 
        75, 
        30, 
        colors[i]
      );
      
      brick.setStrokeStyle(2, 0xffffff);
      
      // Добавляем пульсацию
      this.tweens.add({
        targets: brick,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 1000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Создаем анимированный мяч
    const ball = this.add.circle(50, 500, 8, 0xffffff);
    
    this.tweens.add({
      targets: ball,
      x: 750,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Создаем анимированную платформу
    const paddle = this.add.rectangle(400, 520, 100, 20, 0x00ff00);
    
    this.tweens.add({
      targets: paddle,
      x: 300,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
} 