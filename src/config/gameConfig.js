import Phaser from 'phaser';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { GameOverScene } from '../scenes/GameOverScene.js';
import { PauseScene } from '../scenes/PauseScene.js';

export const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    PreloadScene,
    MenuScene,
    GameScene,
    GameOverScene,
    PauseScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 400,
      height: 300
    },
    max: {
      width: 1200,
      height: 900
    }
  },
  render: {
    antialias: true,
    pixelArt: false
  }
};

export const GAME_SETTINGS = {
  // Размеры игровых объектов
  PADDLE_WIDTH: 100,
  PADDLE_HEIGHT: 20,
  BALL_SIZE: 16,
  BRICK_WIDTH: 75,
  BRICK_HEIGHT: 30,
  
  // Скорости
  PADDLE_SPEED: 350,
  BALL_SPEED: 300,
  
  // Игровые параметры
  INITIAL_LIVES: 3,
  ROWS_OF_BRICKS: 5,
  BRICKS_PER_ROW: 10,
  BRICK_PADDING: 5,
  BRICK_OFFSET_TOP: 100,
  
  // Очки
  BRICK_SCORE: 10,
  BONUS_SCORE: 50,
  
  // Цвета блоков
  BRICK_COLORS: [
    0xff6b6b, // Красный
    0x4ecdc4, // Бирюзовый
    0x45b7d1, // Синий
    0x96ceb4, // Зеленый
    0xfeca57, // Желтый
    0xff9ff3, // Розовый
    0x54a0ff, // Голубой
    0x5f27cd, // Фиолетовый
  ]
}; 