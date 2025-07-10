import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';
import { Paddle } from '../objects/Paddle.js';
import { Ball } from '../objects/Ball.js';
import { Brick } from '../objects/Brick.js';
import { LevelManager } from '../managers/LevelManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Инициализация переменных
    this.score = 0;
    this.lives = GAME_SETTINGS.INITIAL_LIVES;
    this.level = 1;
    this.gameStarted = false;
    this.ballLostProcessing = false;
    this.levelCompleteProcessing = false; // Защита от двойного завершения уровня

    // Создаем менеджер уровней
    this.levelManager = new LevelManager(this);

    // Создаем фон
    this.add.image(400, 300, 'background');

    // Создаем границы
    this.createBounds();

    // Создаем игровые объекты
    this.createGameObjects();

    // Создаем блоки
    this.createBricks();

    // Настраиваем физику столкновений
    this.setupCollisions();

    // Настраиваем управление
    this.setupControls();

    // Настраиваем события
    this.setupEvents();

    // Обновляем UI
    this.updateUI();
  }

  createBounds() {
    // Создаем невидимые границы для столкновений (БЕЗ нижней стены)
    this.bounds = this.physics.add.staticGroup();

    // Левая стена
    const leftWall = this.add.rectangle(5, 300, 10, 600, 0x444444);
    this.physics.add.existing(leftWall, true);
    this.bounds.add(leftWall);

    // Правая стена
    const rightWall = this.add.rectangle(795, 300, 10, 600, 0x444444);
    this.physics.add.existing(rightWall, true);
    this.bounds.add(rightWall);

    // Верхняя стена
    const topWall = this.add.rectangle(400, 5, 800, 10, 0x444444);
    this.physics.add.existing(topWall, true);
    this.bounds.add(topWall);

    // НЕ создаем нижнюю стену - мяч должен улетать вниз!
  }

  createGameObjects() {
    // Создаем платформу
    this.paddle = new Paddle(this, 400, 550);

    // Создаем мяч
    this.ball = new Ball(this, 400, 500);

    // Позиционируем мяч на платформе
    this.resetBall();
  }

  createBricks() {
    // Очищаем существующие блоки если они есть
    if (this.bricks) {
      this.bricks.clear(true, true);
      this.bricks.destroy();
    }

    // Создаем новую группу блоков
    this.bricks = this.physics.add.group();

    // Загружаем текущий уровень
    if (!this.levelManager.loadLevel(this.level)) {
      console.error(`Не удалось загрузить уровень ${this.level}`);
      return;
    }

    // Создаем блоки по паттерну уровня
    const brickArray = this.levelManager.createBricks();

    // Добавляем блоки в группу
    brickArray.forEach(brick => {
      this.bricks.add(brick);
    });

    // Пересоздаем коллайдеры для новых блоков
    this.setupCollisions();

    // Показываем информацию об уровне
    const levelInfo = this.levelManager.getCurrentLevelInfo();
    if (levelInfo) {
      this.showMessage(`${levelInfo.name}`, 2000);
      console.log(`Уровень ${levelInfo.number}: ${levelInfo.name} - ${levelInfo.description}`);
    }

    // Применяем множитель скорости для уровня
    const speedMultiplier = this.levelManager.getSpeedMultiplier();
    if (this.ball) {
      this.ball.speed = GAME_SETTINGS.BALL_SPEED * speedMultiplier;
    }
  }

  setupCollisions() {
    // Удаляем существующие коллайдеры если они есть
    if (this.ballPaddleCollider) {
      this.ballPaddleCollider.destroy();
    }
    if (this.ballBricksCollider) {
      this.ballBricksCollider.destroy();
    }
    if (this.ballBoundsCollider) {
      this.ballBoundsCollider.destroy();
    }

    // Столкновение мяча с платформой
    this.ballPaddleCollider = this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
      ball.bounceOffPaddle(paddle);
      paddle.onBallHit();
    });

    // Столкновение мяча с блоками
    this.ballBricksCollider = this.physics.add.collider(this.ball, this.bricks, (ball, brick) => {
      // Проверяем, что блок еще существует и не обрабатывается
      if (!brick.active || brick.isBeingDestroyed) {
        return;
      }

      // Помечаем блок как обрабатываемый
      brick.isBeingDestroyed = true;

      const destroyed = brick.hit();
      ball.bounceOffBrick(brick);

      if (destroyed) {
        this.score += brick.scoreValue;
        this.updateUI();
        this.checkWinCondition();
      } else {
        // Если блок не разрушен, снимаем флаг
        brick.isBeingDestroyed = false;
      }
    });

    // Столкновение мяча со стенами (только верхняя и боковые)
    this.ballBoundsCollider = this.physics.add.collider(this.ball, this.bounds, (ball, wall) => {
      ball.bounceOffWall();
    });
  }

  setupControls() {
    // Управление клавишами
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Обработчики нажатий
    this.spaceKey.on('down', () => {
      this.handleSpaceKey();
    });

    this.enterKey.on('down', () => {
      this.handleEnterKey();
    });
  }

  setupEvents() {
    // Событие потери мяча
    this.events.on('ball-lost', () => {
      this.onBallLost();
    });

    // Событие уничтожения блока
    this.events.on('brick-destroyed', (score) => {
      this.score += score;
      this.updateUI();
    });
  }

  handleSpaceKey() {
    if (!this.gameStarted) {
      this.startGame();
    } else {
      this.togglePause();
    }
  }

  handleEnterKey() {
    if (!this.gameStarted) {
      this.startGame();
    }
  }

  startGame() {
    if (this.gameStarted) return;

    this.gameStarted = true;
    this.ball.launch();

    // Показываем подсказку
    this.showMessage('Игра началась!', 1000);
  }

  togglePause() {
    if (this.scene.isPaused()) {
      this.scene.resume();
      this.showMessage('Игра возобновлена', 1000);
    } else {
      this.scene.pause();
      this.showMessage('Пауза', 2000);
    }
  }

  onBallLost() {
    // Защита от повторных вызовов
    if (this.ballLostProcessing) {
      return;
    }
    this.ballLostProcessing = true;

    // Останавливаем игру
    this.gameStarted = false;

    // Отнимаем жизнь
    this.lives--;
    this.updateUI();

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Сбрасываем мяч на платформу
      this.resetBall();
      this.showMessage(`Жизнь потеряна! Осталось: ${this.lives}`, 2000);
    }

    // Сбрасываем флаг через небольшую задержку
    this.time.delayedCall(500, () => {
      this.ballLostProcessing = false;
    });
  }

  resetBall() {
    // Сбрасываем мяч на платформу
    this.ball.reset(this.paddle.x, this.paddle.y - 30);
  }

  checkWinCondition() {
    // Защита от множественных вызовов
    if (this.levelCompleteProcessing) {
      return;
    }

    // Проверяем с небольшой задержкой, чтобы все блоки успели обновиться
    this.time.delayedCall(10, () => {
      if (this.levelCompleteProcessing || !this.bricks) {
        return;
      }

      if (this.bricks.children.entries.length === 0) {
        this.levelCompleteProcessing = true;
        this.levelComplete();
      }
    });
  }

  levelComplete() {
    // Получаем бонус за завершение уровня
    const levelBonus = this.levelManager.getLevelCompletionBonus();
    this.score += levelBonus;

    const levelInfo = this.levelManager.getCurrentLevelInfo();
    this.showMessage(`${levelInfo.name} пройден! Бонус: ${levelBonus}`, 3000);

    this.level++;

    // Создаем новые блоки
    this.time.delayedCall(3000, () => {
      this.createBricks();
      this.resetBall();
      this.gameStarted = false;
      this.ballLostProcessing = false; // Сбрасываем флаг
      this.levelCompleteProcessing = false; // Сбрасываем флаг завершения уровня
      this.updateUI();
    });
  }

  gameOver() {
    this.gameStarted = false;
    this.showMessage('Игра окончена!', 2000);

    // После показа сообщения делаем фейд и переходим в главное меню
    this.time.delayedCall(2000, () => {
      this.fadeToMenu();
    });
  }

  // Плавный переход в главное меню с фейдом
  fadeToMenu() {
    // Создаем черный прямоугольник для фейда
    const fadeOverlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0
    );

    // Устанавливаем высокий z-index для overlay
    fadeOverlay.setDepth(1000);

    // Анимация появления черного экрана
    this.tweens.add({
      targets: fadeOverlay,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        // Принудительно очищаем всё перед переходом
        this.forceCleanup();

        // Уведомляем главное приложение о завершении игры
        this.game.events.emit('game-over');

        // Полностью перезапускаем игру через специальное событие
        this.game.events.emit('restart-to-menu');
      }
    });
  }

  // Принудительная очистка всех ресурсов
  forceCleanup() {
    // Останавливаем все таймеры
    if (this.time) {
      this.time.removeAllEvents();
    }

    // Останавливаем все анимации
    if (this.tweens) {
      this.tweens.killAll();
    }

    // Очищаем физический мир
    if (this.physics && this.physics.world) {
      this.physics.world.removeAllListeners();
    }

    // Принудительно удаляем все объекты
    if (this.children) {
      this.children.removeAll(true);
    }

    // Очищаем кэш объектов
    this.paddle = null;
    this.ball = null;
    this.bricks = null;
    this.messageText = null;

    // Сбрасываем состояние
    this.gameStarted = false;
    this.ballLostProcessing = false;
  }

  showMessage(text, duration = 2000) {
    // Удаляем предыдущее сообщение
    if (this.messageText) {
      this.messageText.destroy();
    }

    // Создаем новое сообщение
    this.messageText = this.add.text(400, 300, text, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Анимация появления
    this.messageText.setAlpha(0);
    this.tweens.add({
      targets: this.messageText,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    // Удаляем сообщение через время
    this.time.delayedCall(duration, () => {
      if (this.messageText) {
        this.tweens.add({
          targets: this.messageText,
          alpha: 0,
          duration: 500,
          ease: 'Power2',
          onComplete: () => {
            if (this.messageText) {
              this.messageText.destroy();
              this.messageText = null;
            }
          }
        });
      }
    });
  }

  updateUI() {
    // Обновляем UI через глобальные события
    this.game.events.emit('score-update', this.score);
    this.game.events.emit('lives-update', this.lives);
    this.game.events.emit('level-update', this.level);
  }

  update() {
    // Обновляем игровые объекты
    if (this.paddle) {
      this.paddle.update();
    }

    if (this.ball) {
      this.ball.update();
    }

    // Если мяч не запущен, следуем за платформой
    if (!this.gameStarted && this.ball && this.paddle) {
      this.ball.x = this.paddle.x;
    }
  }

  // Очистка ресурсов при завершении сцены
  shutdown() {
    // Останавливаем все таймеры
    this.time.removeAllEvents();

    // Останавливаем все анимации
    this.tweens.killAll();

    // Удаляем коллайдеры
    if (this.ballPaddleCollider) {
      this.ballPaddleCollider.destroy();
      this.ballPaddleCollider = null;
    }
    if (this.ballBricksCollider) {
      this.ballBricksCollider.destroy();
      this.ballBricksCollider = null;
    }
    if (this.ballBoundsCollider) {
      this.ballBoundsCollider.destroy();
      this.ballBoundsCollider = null;
    }

    // Очищаем группы объектов
    if (this.bricks) {
      this.bricks.clear(true, true);
      this.bricks.destroy();
      this.bricks = null;
    }

    // Удаляем игровые объекты
    if (this.paddle) {
      this.paddle.destroy();
      this.paddle = null;
    }

    if (this.ball) {
      this.ball.destroy();
      this.ball = null;
    }

    // Удаляем UI элементы
    if (this.messageText) {
      this.messageText.destroy();
      this.messageText = null;
    }

    // Сбрасываем флаги
    this.gameStarted = false;
    this.ballLostProcessing = false;
    this.levelCompleteProcessing = false;

    // Очищаем все объекты сцены
    this.children.removeAll(true);

    // Вызываем родительский метод
    super.shutdown();
  }
}
