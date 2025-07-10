import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';

export class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'ball');

    // Добавляем в сцену и физику
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Настраиваем физику
    this.setCollideWorldBounds(false); // Отключаем столкновения с границами мира
    this.setBounce(1);
    this.body.setCircle(GAME_SETTINGS.BALL_SIZE / 2);

    // Состояние мяча
    this.isLaunched = false;
    this.isLost = false;
    this.speed = GAME_SETTINGS.BALL_SPEED;

    // Эффекты следа
    this.createTrailEffect();
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
    this.isLost = false; // Сбрасываем флаг потери
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.clearTint();
    this.setScale(1);
    this.setAlpha(1); // Восстанавливаем прозрачность
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

    // Предотвращаем строго горизонтальное движение
    if (Math.abs(velocity.y) < 50) {
      this.setVelocityY(velocity.y > 0 ? 50 : -50);
    }

    // Предотвращаем строго вертикальное движение
    if (Math.abs(velocity.x) < 30) {
      // Добавляем небольшую горизонтальную скорость в случайном направлении
      const randomDirection = Math.random() > 0.5 ? 1 : -1;
      this.setVelocityX(randomDirection * 30);
    }
  }

  // Проверка границ
  checkBounds() {
    // Проверяем, не упал ли мяч вниз (потеря жизни)
    // Проверяем только если мяч еще не потерян
    if (!this.isLost && this.y > this.scene.sys.game.config.height + 20) {
      this.onBallLost();
      return;
    }

    // Проверяем боковые границы (мяч не должен улетать в стороны)
    if (this.x < 10) {
      this.x = 10;
      this.setVelocityX(Math.abs(this.body.velocity.x));
    } else if (this.x > this.scene.sys.game.config.width - 10) {
      this.x = this.scene.sys.game.config.width - 10;
      this.setVelocityX(-Math.abs(this.body.velocity.x));
    }

    // Проверяем верхнюю границу
    if (this.y < 10) {
      this.y = 10;
      this.setVelocityY(Math.abs(this.body.velocity.y));
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
  bounceOffBrick(brick) {
    // Эффект отскока
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    // Получаем текущую скорость
    const currentVelocity = this.body.velocity;
    let newVelocityX = currentVelocity.x;
    let newVelocityY = currentVelocity.y;

    if (brick) {
      // Вычисляем относительную позицию попадания
      const ballCenterX = this.x;
      const ballCenterY = this.y;
      const brickCenterX = brick.x;
      const brickCenterY = brick.y;

      // Определяем сторону столкновения
      const deltaX = ballCenterX - brickCenterX;
      const deltaY = ballCenterY - brickCenterY;

      // Размеры блока (приблизительные)
      const brickWidth = brick.width || 75;
      const brickHeight = brick.height || 30;

      // Определяем, с какой стороны произошло столкновение
      const overlapX = Math.abs(deltaX) - brickWidth / 2;
      const overlapY = Math.abs(deltaY) - brickHeight / 2;

      if (overlapX > overlapY) {
        // Столкновение с боковой стороной блока
        newVelocityX = -currentVelocity.x;
        newVelocityY = currentVelocity.y;

        // Добавляем небольшую случайность по Y для избежания зацикливания
        const randomAngle = (Math.random() - 0.5) * 0.2; // ±0.1 радиан (±5.7 градусов)
        newVelocityY = currentVelocity.y + Math.sin(randomAngle) * this.speed * 0.1;
      } else {
        // Столкновение с верхней или нижней стороной блока
        newVelocityY = -currentVelocity.y;

        // Добавляем случайность по X в зависимости от точки попадания
        const hitPosition = deltaX / (brickWidth / 2); // от -1 до 1
        let angleModification = hitPosition * 0.4; // максимум ±0.4 радиан (±22.9 градусов)

        // Добавляем небольшую случайность
        const randomFactor = (Math.random() - 0.5) * 0.15; // ±0.075 радиан
        angleModification += randomFactor;

        newVelocityX = currentVelocity.x + Math.sin(angleModification) * this.speed * 0.25;
      }
    }

    // Ограничиваем угол отскока до 60 градусов (≈1.047 радиан)
    const maxAngle = Math.PI / 3; // 60 градусов
    const minAngle = Math.PI / 6; // 30 градусов для минимального угла

    // Вычисляем текущий угол
    let currentAngle = Math.atan2(Math.abs(newVelocityX), Math.abs(newVelocityY));

    // Ограничиваем угол
    if (currentAngle > maxAngle) {
      currentAngle = maxAngle;
    } else if (currentAngle < minAngle) {
      currentAngle = minAngle;
    }

    // Пересчитываем скорости с ограниченным углом
    const normalizedVelocityX = Math.sin(currentAngle) * (newVelocityX >= 0 ? 1 : -1);
    const normalizedVelocityY = Math.cos(currentAngle) * (newVelocityY >= 0 ? 1 : -1);

    // Применяем скорость с небольшим увеличением
    const speedMultiplier = this.speed * 1.01; // Небольшое увеличение скорости

    this.setVelocity(
      normalizedVelocityX * speedMultiplier,
      normalizedVelocityY * speedMultiplier
    );
  }

  // Отскок от стены
  bounceOffWall() {
    // Эффект отскока
    this.setTint(0x0000ff);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
  }

  // Обработка потери мяча
  onBallLost() {
    // Защита от повторных вызовов
    if (this.isLost) {
      return;
    }
    this.isLost = true;

    // Останавливаем мяч
    this.setVelocity(0, 0);
    this.isLaunched = false;

    // Создаем эффект исчезновения
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Восстанавливаем прозрачность и размер
        this.setAlpha(1);
        this.setScale(1);

        // Эмитим событие потери мяча ТОЛЬКО ОДИН РАЗ
        this.scene.events.emit('ball-lost');
      }
    });

    // Эффект "падения" - красное свечение
    this.setTint(0xff0000);
    this.scene.time.delayedCall(300, () => {
      this.clearTint();
    });
  }
}
