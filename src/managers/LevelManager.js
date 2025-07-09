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

    // Валидация уровня
    if (!validateLevelPattern(this.currentLevelData.pattern)) {
      console.error(`Невалидный паттерн уровня ${levelNumber}`);
      return false;
    }

    this.totalBricksInLevel = countBricksInLevel(this.currentLevelData.pattern);

    console.log(`Загружен уровень ${levelNumber}: "${this.currentLevelData.name}"`);
    console.log(`Описание: ${this.currentLevelData.description}`);
    console.log(`Блоков в уровне: ${this.totalBricksInLevel}`);

    return true;
  }

  // Создание блоков по паттерну текущего уровня
  createBricks() {
    if (!this.currentLevelData) {
      console.error('Уровень не загружен!');
      return [];
    }

    const bricks = [];
    const pattern = this.currentLevelData.pattern;

    for (let row = 0; row < pattern.length; row++) {
      const rowPattern = pattern[row];

      for (let col = 0; col < rowPattern.length; col++) {
        const blockType = rowPattern[col];

        // Пропускаем пустые места
        if (blockType === ' ' || !BLOCK_COLORS[blockType]) {
          continue;
        }

        // Вычисляем позицию блока
        const x = LEVEL_SETTINGS.START_X + col * (LEVEL_SETTINGS.BRICK_WIDTH + LEVEL_SETTINGS.BRICK_SPACING);
        const y = LEVEL_SETTINGS.START_Y + row * (LEVEL_SETTINGS.BRICK_HEIGHT + LEVEL_SETTINGS.BRICK_SPACING);

        // Получаем настройки блока
        const blockConfig = BLOCK_COLORS[blockType];

        // Создаем блок
        const brick = new Brick(this.scene, x, y, blockConfig.color);

        // Настраиваем свойства блока
        brick.maxHits = blockConfig.hits;
        brick.currentHits = 0;
        brick.scoreValue = Math.floor(blockConfig.score * this.currentLevelData.scoreMultiplier);
        brick.blockType = blockType;
        brick.blockName = blockConfig.name;

        // Устанавливаем размеры
        brick.setDisplaySize(LEVEL_SETTINGS.BRICK_WIDTH, LEVEL_SETTINGS.BRICK_HEIGHT);

        bricks.push(brick);
      }
    }

    console.log(`Создано ${bricks.length} блоков для уровня ${this.currentLevel}`);
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
    return LEVELS.hasOwnProperty(levelNumber);
  }

  // Получение списка всех доступных уровней
  getAvailableLevels() {
    return Object.keys(LEVELS).map(Number).sort((a, b) => a - b);
  }

  // Предварительный просмотр уровня (для отладки)
  previewLevel(levelNumber = null) {
    const level = levelNumber ? getLevel(levelNumber) : this.currentLevelData;
    if (!level) return;

    console.log(`\n=== ПРЕВЬЮ УРОВНЯ ${levelNumber || this.currentLevel} ===`);
    console.log(`Название: ${level.name}`);
    console.log(`Описание: ${level.description}`);
    console.log(`Множитель очков: ${level.scoreMultiplier}`);
    console.log('Паттерн:');

    level.pattern.forEach((row, index) => {
      console.log(`${index + 1}: "${row}"`);
    });

    console.log(`Всего блоков: ${countBricksInLevel(level.pattern)}`);
    console.log('='.repeat(40));
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
