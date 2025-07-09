import Phaser from 'phaser';
import { GAME_SETTINGS } from '../config/gameConfig.js';

export class Brick extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, color, hits = 1) {
    super(scene, x, y, 'brick');
    
    // Добавляем в сцену и физику
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Настраиваем физику
    this.setImmovable(true);
    this.body.setSize(GAME_SETTINGS.BRICK_WIDTH, GAME_SETTINGS.BRICK_HEIGHT);
    
    // Свойства блока
    this.maxHits = hits;
    this.currentHits = hits;
    this.baseColor = color;
    this.scoreValue = GAME_SETTINGS.BRICK_SCORE * hits;
    
    // Устанавливаем цвет
    this.setTint(color);
    
    // Создаем эффекты
    this.createDestroyEffect();
  }

  // Попадание по блоку
  hit() {
    this.currentHits--;
    
    // Эффект попадания
    this.onHit();
    
    if (this.currentHits <= 0) {
      this.destroy();
      return true; // Блок уничтожен
    } else {
      // Меняем цвет в зависимости от оставшихся попаданий
      this.updateAppearance();
      return false; // Блок еще жив
    }
  }

  // Обновление внешнего вида
  updateAppearance() {
    const alpha = this.currentHits / this.maxHits;
    this.setAlpha(alpha);
    
    // Меняем оттенок
    const tintStrength = 0.5 + (this.currentHits / this.maxHits) * 0.5;
    const adjustedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x666666),
      Phaser.Display.Color.ValueToColor(this.baseColor),
      1,
      tintStrength
    );
    
    this.setTint(Phaser.Display.Color.GetColor(adjustedColor.r, adjustedColor.g, adjustedColor.b));
  }

  // Эффект при попадании
  onHit() {
    // Анимация удара
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
    
    // Эффект вспышки
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.updateAppearance();
    });
    
    // Создаем частицы при попадании
    this.createHitParticles();
  }

  // Создание эффекта разрушения
  createDestroyEffect() {
    // Эффект будет создан при уничтожении
  }

  // Создание частиц при попадании
  createHitParticles() {
    const particles = [];
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.scene.add.rectangle(
        this.x + Phaser.Math.Between(-20, 20),
        this.y + Phaser.Math.Between(-10, 10),
        4,
        4,
        this.baseColor
      );
      
      particles.push(particle);
      
      // Анимация частицы
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-50, 50),
        y: particle.y + Phaser.Math.Between(-50, 50),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  // Переопределяем метод destroy для добавления эффектов
  destroy() {
    // Создаем эффект взрыва
    this.createExplosionEffect();
    
    // Эмитим событие уничтожения
    this.scene.events.emit('brick-destroyed', this.scoreValue);
    
    // Уничтожаем объект
    super.destroy();
  }

  // Эффект взрыва
  createExplosionEffect() {
    const particles = [];
    const particleCount = 10;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.scene.add.rectangle(
        this.x,
        this.y,
        6,
        6,
        this.baseColor
      );
      
      particles.push(particle);
      
      // Случайное направление
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = Phaser.Math.Between(50, 150);
      const targetX = this.x + Math.cos(angle) * speed;
      const targetY = this.y + Math.sin(angle) * speed;
      
      // Анимация взрыва
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
    
    // Эффект вспышки
    const flash = this.scene.add.circle(this.x, this.y, 30, 0xffffff, 0.8);
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  // Статический метод для создания сетки блоков
  static createBrickGrid(scene, startX, startY, rows, cols, colors) {
    const bricks = [];
    const brickWidth = GAME_SETTINGS.BRICK_WIDTH;
    const brickHeight = GAME_SETTINGS.BRICK_HEIGHT;
    const padding = GAME_SETTINGS.BRICK_PADDING;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (brickWidth + padding);
        const y = startY + row * (brickHeight + padding);
        
        // Выбираем цвет в зависимости от ряда
        const colorIndex = row % colors.length;
        const color = colors[colorIndex];
        
        // Количество попаданий зависит от ряда (верхние ряды крепче)
        const hits = Math.max(1, Math.floor(row / 2) + 1);
        
        const brick = new Brick(scene, x, y, color, hits);
        bricks.push(brick);
      }
    }
    
    return bricks;
  }
} 