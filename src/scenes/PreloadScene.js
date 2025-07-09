import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Создаем графические элементы программно (без внешних файлов)
    this.createAssets();
  }

  createAssets() {
    // Создаем текстуру для платформы
    this.add.graphics()
      .fillStyle(0x00ff00)
      .fillRect(0, 0, 100, 20)
      .generateTexture('paddle', 100, 20);

    // Создаем текстуру для мяча
    this.add.graphics()
      .fillStyle(0xffffff)
      .fillCircle(8, 8, 8)
      .generateTexture('ball', 16, 16);

    // Создаем текстуру для блока
    this.add.graphics()
      .fillStyle(0xff0000)
      .fillRect(0, 0, 75, 30)
      .lineStyle(2, 0xffffff)
      .strokeRect(0, 0, 75, 30)
      .generateTexture('brick', 75, 30);

    // Создаем текстуру для стен
    this.add.graphics()
      .fillStyle(0x444444)
      .fillRect(0, 0, 10, 600)
      .generateTexture('wall', 10, 600);

    // Создаем фоновую текстуру
    this.add.graphics()
      .fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1)
      .fillRect(0, 0, 800, 600)
      .generateTexture('background', 800, 600);
  }

  create() {
    // Переходим к меню
    this.scene.start('MenuScene');
  }
} 