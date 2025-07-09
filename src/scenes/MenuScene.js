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

    // Добавляем фейд-ин эффект при входе в меню (только если пришли из игры)
    if (this.scene.settings.data && this.scene.settings.data.fromGame) {
      this.createFadeInEffect();
    }

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

    // Сохраняем ссылки на анимированные элементы для очистки
    this.animatedElements = [];
    this.animatedTweens = [];

    for (let i = 0; i < 5; i++) {
      const brick = this.add.rectangle(
        100 + i * 120,
        100,
        75,
        30,
        colors[i]
      );

      brick.setStrokeStyle(2, 0xffffff);
      this.animatedElements.push(brick);

      // Добавляем пульсацию
      const tween = this.tweens.add({
        targets: brick,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 1000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.animatedTweens.push(tween);
    }

    // Создаем анимированный мяч
    const ball = this.add.circle(50, 500, 8, 0xffffff);
    this.animatedElements.push(ball);

    const ballTween = this.tweens.add({
      targets: ball,
      x: 750,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.animatedTweens.push(ballTween);

    // Создаем анимированную платформу
    const paddle = this.add.rectangle(400, 520, 100, 20, 0x00ff00);
    this.animatedElements.push(paddle);

    const paddleTween = this.tweens.add({
      targets: paddle,
      x: 300,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.animatedTweens.push(paddleTween);
  }

  // Очистка анимированных элементов при выходе из сцены
  shutdown() {
    // Останавливаем все анимации
    if (this.animatedTweens) {
      this.animatedTweens.forEach(tween => {
        if (tween) {
          tween.stop();
          tween.destroy();
        }
      });
      this.animatedTweens = [];
    }

    // Удаляем анимированные элементы
    if (this.animatedElements) {
      this.animatedElements.forEach(element => {
        if (element) {
          element.destroy();
        }
      });
      this.animatedElements = [];
    }

    // Вызываем родительский метод
    super.shutdown();
  }

  // Создание эффекта fade-in при входе в меню
  createFadeInEffect() {
    // Создаем черный overlay для fade-in
    const fadeOverlay = this.add.rectangle(
      400,
      300,
      800,
      600,
      0x000000,
      1
    );

    // Устанавливаем высокий z-index
    fadeOverlay.setDepth(1000);

    // Анимация исчезновения черного экрана
    this.tweens.add({
      targets: fadeOverlay,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        fadeOverlay.destroy();
      }
    });
  }
}
