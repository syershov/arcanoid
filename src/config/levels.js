// Конфигурация уровней игры Arcanoid
// Каждый уровень содержит схему расположения блоков

export const LEVELS = {
  1: {
    name: "Начальный уровень",
    description: "Простая схема для знакомства с игрой",
    pattern: [
      "RRRRRRRRR",
      "OOOOOOOOO",
      "YYYYYYYYY",
      "GGGGGGGGG",
      "BBBBBBBBB",
      "PPPPPPPPP",
      "CCCCCCCCC"
    ],
    scoreMultiplier: 1.0
  },

  2: {
    name: "Пирамида",
    description: "Блоки расположены в виде пирамиды",
    pattern: [
      "    R    ",
      "   RRR   ",
      "  OOOOO  ",
      " YYYYYYY ",
      "GGGGGGGGG"
    ],
    scoreMultiplier: 1.2
  },

  3: {
    name: "Крепость",
    description: "Защищенные блоки в центре",
    pattern: [
      "RRRRRRRRR",
      "R       R",
      "R  BBB  R",
      "R  BBB  R",
      "R       R",
      "RRRRRRRRR"
    ],
    scoreMultiplier: 1.5
  },

  4: {
    name: "Шахматная доска",
    description: "Блоки расположены в шахматном порядке",
    pattern: [
      "R O R O R",
      "O R O R O",
      "R O R O R",
      "O R O R O",
      "R O R O R"
    ],
    scoreMultiplier: 1.3
  },

  5: {
    name: "Лабиринт",
    description: "Сложная схема с проходами",
    pattern: [
      "RRRRRRRRR",
      "R   R   R",
      "R R R R R",
      "R   R   R",
      "R RRRRR R",
      "R       R",
      "RRRRRRRRR"
    ],
    scoreMultiplier: 2.0
  },

  6: {
    name: "Алмаз",
    description: "Блоки в форме алмаза",
    pattern: [
      "    B    ",
      "   BBB   ",
      "  BBBBB  ",
      " BBBBBBB ",
      "BBBBBBBBB",
      " BBBBBBB ",
      "  BBBBB  ",
      "   BBB   ",
      "    B    "
    ],
    scoreMultiplier: 1.8
  },

  7: {
    name: "Радуга",
    description: "Все цвета радуги",
    pattern: [
      "RRRRRRRRR",
      "OOOOOOOOO",
      "YYYYYYYYY",
      "GGGGGGGGG",
      "BBBBBBBBB",
      "PPPPPPPPP",
      "CCCCCCCCC"
    ],
    scoreMultiplier: 1.6
  },

  8: {
    name: "Крест",
    description: "Блоки в форме креста",
    pattern: [
      "   RRR   ",
      "   RRR   ",
      "RRRRRRRRR",
      "RRRRRRRRR",
      "RRRRRRRRR",
      "   RRR   ",
      "   RRR   "
    ],
    scoreMultiplier: 1.4
  },

  9: {
    name: "Спираль",
    description: "Блоки расположены по спирали",
    pattern: [
      "RRRRRRRRR",
      "R       R",
      "R OOOOO R",
      "R O   O R",
      "R O Y O R",
      "R O   O R",
      "R OOOOO R",
      "R       R",
      "RRRRRRRRR"
    ],
    scoreMultiplier: 2.2
  },

  10: {
    name: "Финальный босс",
    description: "Самый сложный уровень",
    pattern: [
      "BBBBBBBBB",
      "BRRRRRRB",
      "BROOOOORB",
      "BROYYYORB",
      "BROYGGORB",
      "BROYYYORB",
      "BROOOOORB",
      "BRRRRRRB",
      "BBBBBBBBB"
    ],
    scoreMultiplier: 3.0
  }
};

// Цветовые коды для блоков
export const BLOCK_COLORS = {
  'R': { color: 0xff6b6b, name: 'Красный', hits: 1, score: 10 },
  'O': { color: 0xff9f43, name: 'Оранжевый', hits: 1, score: 15 },
  'Y': { color: 0xfeca57, name: 'Желтый', hits: 1, score: 20 },
  'G': { color: 0x48dbfb, name: 'Зеленый', hits: 2, score: 25 },
  'B': { color: 0x0abde3, name: 'Синий', hits: 2, score: 30 },
  'P': { color: 0x9c88ff, name: 'Фиолетовый', hits: 3, score: 40 },
  'C': { color: 0x54a0ff, name: 'Голубой', hits: 1, score: 12 },
  ' ': null // Пустое место
};

// Настройки уровней
export const LEVEL_SETTINGS = {
  BRICK_WIDTH: 75,
  BRICK_HEIGHT: 30,
  BRICK_SPACING: 5,
  START_X: 50,
  START_Y: 80,
  MAX_BRICKS_PER_ROW: 9,

  // Бонусы за прохождение уровня
  LEVEL_COMPLETION_BONUS: 1000,

  // Увеличение сложности
  SPEED_INCREASE_PER_LEVEL: 1.05,
  MAX_SPEED_MULTIPLIER: 2.0
};

// Функция получения уровня
export function getLevel(levelNumber) {
  // Если уровень не найден, генерируем случайный
  if (!LEVELS[levelNumber]) {
    return generateRandomLevel(levelNumber);
  }

  return LEVELS[levelNumber];
}

// Генерация случайного уровня для высоких номеров
function generateRandomLevel(levelNumber) {
  const patterns = [
    "RRRRRRRRR",
    "OOOOOOOOO",
    "YYYYYYYYY",
    "GGGGGGGGG",
    "BBBBBBBBB"
  ];

  // Добавляем случайности в зависимости от уровня
  const complexity = Math.min(levelNumber - 10, 10);
  const scoreMultiplier = 1.0 + (levelNumber * 0.1);

  return {
    name: `Уровень ${levelNumber}`,
    description: "Случайно сгенерированный уровень",
    pattern: patterns,
    scoreMultiplier: scoreMultiplier
  };
}

// Функция проверки валидности паттерна уровня
export function validateLevelPattern(pattern) {
  if (!Array.isArray(pattern)) return false;

  for (const row of pattern) {
    if (typeof row !== 'string') return false;
    if (row.length > LEVEL_SETTINGS.MAX_BRICKS_PER_ROW) return false;

    // Проверяем, что все символы валидны
    for (const char of row) {
      if (!BLOCK_COLORS.hasOwnProperty(char)) return false;
    }
  }

  return true;
}

// Подсчет общего количества блоков в уровне
export function countBricksInLevel(pattern) {
  let count = 0;
  for (const row of pattern) {
    for (const char of row) {
      if (char !== ' ') count++;
    }
  }
  return count;
}
