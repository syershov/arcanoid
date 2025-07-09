import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';

export class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'ball');
    
    // Добавляем в сцену и физику
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Настраиваем физику
    this.setCollideWorldBounds(true);
    this.setBounce(1);
    this.body.setCircle(GAME_SETTINGS.BALL_SIZE / 2);
    
    // Состояние мяча
    this.isLaunched = false;
    this.speed = GAME_SETTINGS.BALL_SPEED;
    
    // Эффекты
    this.trailParticles = [];
    this.createTrailEffect();
    
    // Звуковые эффекты (заглушки)
    this.bounceSound = null;
  }

  // Запуск мяча
  launch(angle = null) {
    if (this.isLaunched) return;
    
    this.isLaunched = true;
    
    // Если угол не задан, используем случайный
    if (angle === null) {
      angle = Phaser.Math.Between(-30, 30) * Math.PI / 180;
    }
    
    // Задаем скорость
    const velocityX = Math.sin(angle) * this.speed;
    const velocityY = -Math.cos(angle) * this.speed;
    
    this.setVelocity(velocityX, velocityY);
    
    // Эффект запуска
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }

  // Сброс мяча
  reset(x, y) {
    this.isLaunched = false;
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.clearTint();
    this.setScale(1);
  }

  // Обновление мяча
  update() {
    // Создаем след
    this.updateTrail();
    
    // Проверяем скорость (предотвращаем застревание)
    this.checkVelocity();
    
    // Проверяем границы
    this.checkBounds();
  }

  // Создание эффекта следа
  createTrailEffect() {
    // Простой эффект следа через массив позиций
    this.trailPositions = [];
    this.maxTrailLength = 10;
  }

  // Обновление следа
  updateTrail() {
    // Добавляем текущую позицию
    this.trailPositions.push({ x: this.x, y: this.y });
    
    // Ограничиваем длину следа
    if (this.trailPositions.length > this.maxTrailLength) {
      this.trailPositions.shift();
    }
  }

  // Проверка скорости
  checkVelocity() {
    if (!this.isLaunched) return;
    
    const velocity = this.body.velocity;
    const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // Если скорость слишком мала, нормализуем
    if (currentSpeed < this.speed * 0.8) {
      const normalizedVelocity = velocity.normalize().scale(this.speed);
      this.setVelocity(normalizedVelocity.x, normalizedVelocity.y);
    }
    
    // Если скорость слишком велика, ограничиваем
    if (currentSpeed > this.speed * 1.2) {
      const normalizedVelocity = velocity.normalize().scale(this.speed);
      this.setVelocity(normalizedVelocity.x, normalizedVelocity.y);
    }
    
    // Предотвращаем горизонтальное движение
    if (Math.abs(velocity.y) < 50) {
      this.setVelocityY(velocity.y > 0 ? 50 : -50);
    }
  }

  // Проверка границ
  checkBounds() {
    // Проверяем, не упал ли мяч вниз
    if (this.y > this.scene.sys.game.config.height + 50) {
      this.scene.events.emit('ball-lost');
    }
  }

  // Отскок от платформы
  bounceOffPaddle(paddle) {
    const bounceAngle = paddle.getBounceAngle(this.x);
    
    // Устанавливаем новую скорость
    const velocityX = Math.sin(bounceAngle) * this.speed;
    const velocityY = -Math.cos(bounceAngle) * this.speed;
    
    this.setVelocity(velocityX, velocityY);
    
    // Эффект отскока
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
    
    // Эффект свечения
    this.setTint(0x00ff00);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });
  }

  // Отскок от блока
  bounceOffBrick() {
    // Эффект отскока
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
    
    // Небольшое увеличение скорости
    const currentVelocity = this.body.velocity;
    const speedMultiplier = 1.02;
    this.setVelocity(currentVelocity.x * speedMultiplier, currentVelocity.y * speedMultiplier);
  }

  // Отскок от стены
  bounceOffWall() {
    // Эффект отскока
    this.setTint(0x0000ff);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
  }
} 