import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'paddle');
    
    // Добавляем в сцену и физику
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Настраиваем физику
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.body.setSize(GAME_SETTINGS.PADDLE_WIDTH, GAME_SETTINGS.PADDLE_HEIGHT);
    
    // Настраиваем управление
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,S,A,D');
    
    // Скорость движения
    this.speed = GAME_SETTINGS.PADDLE_SPEED;
    
    // Ограничиваем движение по Y
    this.body.setVelocityY(0);
  }

  update() {
    // Сброс скорости
    this.setVelocityX(0);
    
    // Управление стрелками или WASD
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.setVelocityX(-this.speed);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.setVelocityX(this.speed);
    }
  }

  // Метод для получения отскока мяча в зависимости от точки попадания
  getBounceAngle(ballX) {
    const paddleCenter = this.x;
    const paddleWidth = this.width;
    
    // Вычисляем относительную позицию попадания (-1 до 1)
    const relativeIntersectX = (ballX - paddleCenter) / (paddleWidth / 2);
    
    // Максимальный угол отскока (в радианах)
    const maxBounceAngle = Math.PI / 3; // 60 градусов
    
    // Вычисляем угол отскока
    const bounceAngle = relativeIntersectX * maxBounceAngle;
    
    return bounceAngle;
  }

  // Анимация при попадании мяча
  onBallHit() {
    // Небольшая вибрация
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.8,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
    
    // Эффект свечения
    this.setTint(0xffffff);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });
  }
} 