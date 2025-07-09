import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig.js';

class ArcanoidApp {
  constructor() {
    this.game = null;
    this.gameState = {
      score: 0,
      lives: 3,
      level: 1,
      isGameStarted: false,
      isPaused: false
    };
    
    this.initializeUI();
    this.createGame();
  }

  initializeUI() {
    // Получаем элементы UI
    this.elements = {
      loading: document.getElementById('loading'),
      menuOverlay: document.getElementById('menu-overlay'),
      uiOverlay: document.getElementById('ui-overlay'),
      score: document.getElementById('score'),
      lives: document.getElementById('lives'),
      level: document.getElementById('level'),
      startButton: document.getElementById('start-game'),
      resumeButton: document.getElementById('resume-game'),
      settingsButton: document.getElementById('settings'),
      aboutButton: document.getElementById('about')
    };

    // Добавляем обработчики событий
    this.elements.startButton.addEventListener('click', () => this.startGame());
    this.elements.resumeButton.addEventListener('click', () => this.resumeGame());
    this.elements.settingsButton.addEventListener('click', () => this.showSettings());
    this.elements.aboutButton.addEventListener('click', () => this.showAbout());

    // Обработчики клавиш
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape') {
        this.togglePause();
      }
    });
  }

  createGame() {
    // Показываем загрузку
    this.elements.loading.classList.remove('hidden');
    
    // Создаем игру Phaser
    this.game = new Phaser.Game(GAME_CONFIG);
    
    // Настраиваем события игры
    this.game.events.on('ready', () => {
      this.onGameReady();
    });

    // Глобальные события для связи с UI
    this.game.events.on('score-update', (score) => {
      this.updateScore(score);
    });

    this.game.events.on('lives-update', (lives) => {
      this.updateLives(lives);
    });

    this.game.events.on('level-update', (level) => {
      this.updateLevel(level);
    });

    this.game.events.on('game-over', () => {
      this.onGameOver();
    });
  }

  onGameReady() {
    // Скрываем загрузку
    this.elements.loading.classList.add('hidden');
    
    // Показываем меню
    this.showMenu();
  }

  startGame() {
    this.gameState.isGameStarted = true;
    this.gameState.isPaused = false;
    
    // Скрываем меню
    this.hideMenu();
    
    // Показываем UI игры
    this.elements.uiOverlay.classList.remove('hidden');
    
    // Останавливаем сцену меню и запускаем игровую сцену
    if (this.game.scene.getScene('MenuScene')) {
      this.game.scene.stop('MenuScene');
    }
    if (this.game.scene.getScene('GameScene')) {
      this.game.scene.start('GameScene');
    }
  }

  resumeGame() {
    this.gameState.isPaused = false;
    this.hideMenu();
    
    // Останавливаем сцену меню
    if (this.game.scene.getScene('MenuScene')) {
      this.game.scene.stop('MenuScene');
    }
    
    // Возобновляем игровую сцену
    if (this.game.scene.getScene('GameScene')) {
      this.game.scene.resume('GameScene');
    }
  }

  togglePause() {
    if (!this.gameState.isGameStarted) return;

    if (this.gameState.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    this.gameState.isPaused = true;
    this.elements.startButton.style.display = 'none';
    this.elements.resumeButton.style.display = 'block';
    
    // Приостанавливаем игровую сцену
    if (this.game.scene.getScene('GameScene')) {
      this.game.scene.pause('GameScene');
    }
    
    // Запускаем сцену меню поверх игры
    if (this.game.scene.getScene('MenuScene')) {
      this.game.scene.launch('MenuScene');
    }
    
    this.showMenu();
  }

  showMenu() {
    this.elements.menuOverlay.classList.remove('hidden');
  }

  hideMenu() {
    this.elements.menuOverlay.classList.add('hidden');
  }

  showSettings() {
    alert('Настройки будут реализованы в следующей версии!');
  }

  showAbout() {
    alert('Arcanoid v1.0\\n\\nКлассическая аркадная игра.\\n\\nУправление:\\n- Стрелки или A/D для движения платформы\\n- Пробел для паузы\\n- ESC для меню');
  }

  updateScore(score) {
    this.gameState.score = score;
    this.elements.score.textContent = score;
  }

  updateLives(lives) {
    this.gameState.lives = lives;
    this.elements.lives.textContent = lives;
  }

  updateLevel(level) {
    this.gameState.level = level;
    this.elements.level.textContent = level;
  }

  onGameOver() {
    this.gameState.isGameStarted = false;
    this.gameState.isPaused = false;
    
    // Возвращаем кнопки в исходное состояние
    this.elements.startButton.style.display = 'block';
    this.elements.resumeButton.style.display = 'none';
    
    // Скрываем UI игры
    this.elements.uiOverlay.classList.add('hidden');
    
    // Перезапускаем сцену меню
    if (this.game.scene.getScene('MenuScene')) {
      this.game.scene.start('MenuScene');
    }
    
    // Показываем меню
    this.showMenu();
  }

  // Метод для получения состояния игры (для использования в сценах)
  getGameState() {
    return this.gameState;
  }
}

// Создаем глобальный объект приложения
window.arcanoidApp = new ArcanoidApp();

// Экспортируем для использования в модулях
export default window.arcanoidApp; 