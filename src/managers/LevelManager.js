import { LEVELS, BLOCK_COLORS, LEVEL_SETTINGS, getLevel, validateLevelPattern, countBricksInLevel } from '../config/levels.js';
import { Brick } from '../objects/Brick.js';

export class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.currentLevel = 1;
    this.currentLevelData = null;
    this.totalBricksInLevel = 0;
  }

  // Загрузка уровня
  loadLevel(levelNumber) {
    this.currentLevel = levelNumber;
    this.currentLevelData = getLevel(levelNumber);

    if (!this.currentLevelData) {
      return false;
    }

    this.totalBricksInLevel = countBricksInLevel(this.currentLevelData.pattern);
    return true;
  }

  // Создание блоков по паттерну текущего уровня
  createBricks() {
    if (!this.currentLevelData) {
      return [];
    }

    const bricks = [];
    const pattern = this.currentLevelData.pattern;

    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        const blockType = pattern[row][col];

        if (blockType === ' ') continue; // Пустое место

        const blockConfig = BLOCK_COLORS[blockType];
        if (!blockConfig) continue;

        const x = LEVEL_SETTINGS.START_X + col * (LEVEL_SETTINGS.BRICK_WIDTH + LEVEL_SETTINGS.BRICK_SPACING);
        const y = LEVEL_SETTINGS.START_Y + row * (LEVEL_SETTINGS.BRICK_HEIGHT + LEVEL_SETTINGS.BRICK_SPACING);

        const brick = new Brick(this.scene, x, y, blockConfig.color, blockConfig.hits);
        brick.blockType = blockType;
        brick.scoreValue = Math.round(blockConfig.score * this.currentLevelData.scoreMultiplier);

        bricks.push(brick);
      }
    }

    return bricks;
  }

  // Получение информации о текущем уровне
  getCurrentLevelInfo() {
    if (!this.currentLevelData) return null;

    return {
      number: this.currentLevel,
      name: this.currentLevelData.name,
      description: this.currentLevelData.description,
      scoreMultiplier: this.currentLevelData.scoreMultiplier,
      totalBricks: this.totalBricksInLevel
    };
  }

  // Переход на следующий уровень
  nextLevel() {
    return this.loadLevel(this.currentLevel + 1);
  }

  // Получение бонуса за завершение уровня
  getLevelCompletionBonus() {
    const baseBonus = LEVEL_SETTINGS.LEVEL_COMPLETION_BONUS;
    const levelMultiplier = this.currentLevelData ? this.currentLevelData.scoreMultiplier : 1.0;
    return Math.floor(baseBonus * levelMultiplier);
  }

  // Получение множителя скорости для текущего уровня
  getSpeedMultiplier() {
    const multiplier = Math.pow(LEVEL_SETTINGS.SPEED_INCREASE_PER_LEVEL, this.currentLevel - 1);
    return Math.min(multiplier, LEVEL_SETTINGS.MAX_SPEED_MULTIPLIER);
  }

  // Проверка существования уровня
  levelExists(levelNumber) {
    const exists = !!LEVELS[levelNumber];
    return exists;
  }

  // Получение списка всех доступных уровней
  getAvailableLevels() {
    return Object.keys(LEVELS).map(Number).sort((a, b) => a - b);
  }

  // Предварительный просмотр уровня (для отладки)
  previewLevel(levelNumber = null) {
    const level = getLevel(levelNumber || this.currentLevel);
    if (!level) {
      return;
    }

    // Можно добавить визуальный превью в будущем
  }

  // Сброс менеджера уровней
  reset() {
    this.currentLevel = 1;
    this.currentLevelData = null;
    this.totalBricksInLevel = 0;
  }

  // Статистика по типам блоков в уровне
  getBrickStatistics() {
    if (!this.currentLevelData) return {};

    const stats = {};

    for (const row of this.currentLevelData.pattern) {
      for (const char of row) {
        if (char !== ' ' && BLOCK_COLORS[char]) {
          if (!stats[char]) {
            stats[char] = {
              count: 0,
              name: BLOCK_COLORS[char].name,
              color: BLOCK_COLORS[char].color,
              hits: BLOCK_COLORS[char].hits,
              score: Math.floor(BLOCK_COLORS[char].score * this.currentLevelData.scoreMultiplier)
            };
          }
          stats[char].count++;
        }
      }
    }

    return stats;
  }
}
