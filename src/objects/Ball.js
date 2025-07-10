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

  // Отскок от платформы (классическая логика Arcanoid)
  bounceOffPaddle(paddle) {
    // Получаем угол отскока в зависимости от точки попадания
    const bounceAngle = paddle.getBounceAngle(this.x);

    // Получаем влияние скорости платформы
    const paddleVelocity = paddle.getVelocityInfluence();

    // Базовая скорость отскока
    let velocityX = Math.sin(bounceAngle) * this.speed;
    let velocityY = -Math.cos(bounceAngle) * this.speed;

    // Добавляем влияние движения платформы (классическая механика)
    // Скорость платформы влияет на горизонтальную составляющую
    const paddleInfluence = 0.3; // Коэффициент влияния движения платформы
    velocityX += paddleVelocity * paddleInfluence;

    // Нормализуем скорость для сохранения исходной энергии
    const targetSpeed = this.speed;
    const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    if (currentSpeed > 0) {
      const speedRatio = targetSpeed / currentSpeed;
      velocityX *= speedRatio;
      velocityY *= speedRatio;
    }

    // Ограничиваем минимальную вертикальную скорость
    // Предотвращаем слишком пологие отскоки
    const minVerticalSpeed = this.speed * 0.3; // 30% от общей скорости
    if (Math.abs(velocityY) < minVerticalSpeed) {
      velocityY = velocityY >= 0 ? minVerticalSpeed : -minVerticalSpeed;

      // Пересчитываем горизонтальную скорость для сохранения общей скорости
      const remainingSpeed = Math.sqrt(targetSpeed * targetSpeed - velocityY * velocityY);
      velocityX = velocityX >= 0 ? remainingSpeed : -remainingSpeed;
    }

    // Устанавливаем новую скорость
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

  // Отскок от блока (классическая логика Arcanoid)
  bounceOffBrick(brick) {
    // Эффект отскока
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    if (!brick) return;

    // Получаем текущую скорость
    const currentVelocity = this.body.velocity;

    // Позиции центров
    const ballCenterX = this.x;
    const ballCenterY = this.y;
    const brickCenterX = brick.x;
    const brickCenterY = brick.y;

    // Размеры блока
    const brickWidth = brick.width || 75;
    const brickHeight = brick.height || 30;

    // Вычисляем расстояния от центров
    const deltaX = ballCenterX - brickCenterX;
    const deltaY = ballCenterY - brickCenterY;

    // Определяем сторону столкновения по классическим правилам
    // Сравниваем отношения расстояний к размерам блока
    const ratioX = Math.abs(deltaX) / (brickWidth / 2);
    const ratioY = Math.abs(deltaY) / (brickHeight / 2);

    let newVelocityX = currentVelocity.x;
    let newVelocityY = currentVelocity.y;

    if (ratioX > ratioY) {
      // Столкновение с вертикальной стороной блока (левая или правая)
      // Инвертируем горизонтальную составляющую скорости
      newVelocityX = -currentVelocity.x;
      // Вертикальная составляющая остается прежней
      newVelocityY = currentVelocity.y;
    } else {
      // Столкновение с горизонтальной стороной блока (верхняя или нижняя)
      // Инвертируем вертикальную составляющую скорости
      newVelocityY = -currentVelocity.y;
      // Горизонтальная составляющая остается прежней
      newVelocityX = currentVelocity.x;
    }

    // Добавляем минимальную случайность для предотвращения зацикливания
    // Только небольшое отклонение (±2%)
    const randomFactor = 0.02;
    const randomMultiplierX = 1 + (Math.random() - 0.5) * randomFactor;
    const randomMultiplierY = 1 + (Math.random() - 0.5) * randomFactor;

    newVelocityX *= randomMultiplierX;
    newVelocityY *= randomMultiplierY;

    // Нормализуем скорость для сохранения исходной энергии
    const originalSpeed = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);
    const newSpeed = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY);

    if (newSpeed > 0) {
      const speedRatio = originalSpeed / newSpeed;
      newVelocityX *= speedRatio;
      newVelocityY *= speedRatio;
    }



    // Проверяем, что скорость не нулевая
    if (Math.abs(newVelocityX) < 30) {
      newVelocityX = newVelocityX >= 0 ? 30 : -30;
    }
    if (Math.abs(newVelocityY) < 30) {
      newVelocityY = newVelocityY >= 0 ? 30 : -30;
    }

    // Принудительно "выталкиваем" мяч из блока для предотвращения застревания
    if (ratioX > ratioY) {
      // Боковое столкновение - сдвигаем мяч по X
      const pushDistance = 5;
      if (deltaX > 0) {
        this.x = brickCenterX + (brickWidth / 2) + pushDistance;
      } else {
        this.x = brickCenterX - (brickWidth / 2) - pushDistance;
      }
    } else {
      // Верхнее/нижнее столкновение - сдвигаем мяч по Y
      const pushDistance = 5;
      if (deltaY > 0) {
        this.y = brickCenterY + (brickHeight / 2) + pushDistance;
      } else {
        this.y = brickCenterY - (brickHeight / 2) - pushDistance;
      }
    }

    // Применяем новую скорость
    this.setVelocity(newVelocityX, newVelocityY);
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
