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

    // ИСПРАВЛЕНИЕ: Дополнительная защита от перемещения блоков
    this.body.moves = false; // Блок вообще не может двигаться
    this.body.setVelocity(0, 0); // Убираем любую скорость
    this.body.setAcceleration(0, 0); // Убираем любое ускорение

    // Свойства блока
    this.maxHits = hits;
    this.currentHits = 0; // Исправлено: начинаем с 0 попаданий
    this.baseColor = color;
    this.scoreValue = GAME_SETTINGS.BRICK_SCORE * hits;
    this.isBeingDestroyed = false; // Флаг для предотвращения двойной обработки

    // Принудительно устанавливаем активность
    this.setActive(true);
    this.setVisible(true);



    // Устанавливаем цвет
    this.setTint(color);

    // Создаем эффекты
    this.createDestroyEffect();
  }

  // Попадание по блоку
  hit() {
    // Дополнительная проверка на то, что блок еще активен
    if (!this.active) {
      return false;
    }

    if (this.isBeingDestroyed) {
      return false;
    }

    // Увеличиваем счетчик попаданий
    this.currentHits++;

    // Эффект попадания (только если не слишком много анимаций)
    const activeAnimations = this.scene.tweens.getTweens().length;
    if (activeAnimations <= 15) {
      this.onHit();
    }

    if (this.currentHits >= this.maxHits) {
      // Помечаем блок как разрушаемый только перед уничтожением
      this.isBeingDestroyed = true;
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
    const hitProgress = this.currentHits / this.maxHits;

    // Уменьшаем яркость по мере повреждения
    const alpha = 1.0 - (hitProgress * 0.3); // Максимум 30% потери яркости
    this.setAlpha(alpha);

    // Меняем оттенок - делаем темнее при повреждении
    const tintStrength = 1.0 - (hitProgress * 0.4); // Максимум 40% затемнения
    const darkenedColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x444444), // Темно-серый
      Phaser.Display.Color.ValueToColor(this.baseColor),
      1,
      tintStrength
    );

    this.setTint(Phaser.Display.Color.GetColor(darkenedColor.r, darkenedColor.g, darkenedColor.b));

    // Добавляем трещины для сильно поврежденных блоков
    if (hitProgress > 0.5 && this.maxHits > 1) {
      this.addCrackEffect();
    }
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

  // Добавление эффекта трещин
  addCrackEffect() {
    // Проверяем, что блок еще существует и активен
    if (this.hasCracks || !this.scene || !this.active) return;
    this.hasCracks = true;

    // Создаем несколько линий-трещин
    const crackCount = 2 + Math.floor(Math.random() * 2); // 2-3 трещины

    for (let i = 0; i < crackCount; i++) {
      try {
        const crack = this.scene.add.line(
          this.x, this.y,
          Phaser.Math.Between(-this.width / 2, this.width / 2),
          Phaser.Math.Between(-this.height / 2, this.height / 2),
          Phaser.Math.Between(-this.width / 2, this.width / 2),
          Phaser.Math.Between(-this.height / 2, this.height / 2),
          0x000000,
          0.6
        );
        crack.setLineWidth(1);

        // Сохраняем ссылку для удаления
        if (!this.cracks) this.cracks = [];
        this.cracks.push(crack);
      } catch (error) {
        // Игнорируем ошибки создания трещин
        break;
      }
    }
  }

  // Создание эффекта разрушения
  createDestroyEffect() {
    // Эффект будет создан при уничтожении
  }

  // Создание частиц при попадании (упрощенный)
  createHitParticles() {
    // Проверяем количество активных анимаций в сцене для предотвращения перегрузки
    const activeAnimations = this.scene.tweens.getTweens().length;
    if (activeAnimations > 20) {
      // Если слишком много анимаций, пропускаем создание частиц
      return;
    }

    const particleCount = 2; // Еще больше уменьшаем количество частиц

    for (let i = 0; i < particleCount; i++) {
      const particle = this.scene.add.rectangle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y + Phaser.Math.Between(-5, 5),
        2,
        2,
        this.baseColor
      );

      // Анимация частицы с еще меньшей продолжительностью
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-20, 20),
        y: particle.y + Phaser.Math.Between(-20, 20),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          if (particle && particle.destroy) {
            particle.destroy();
          }
        }
      });
    }
  }

  // Переопределяем метод destroy для добавления эффектов
  destroy() {

    // Удаляем трещины
    if (this.cracks) {
      this.cracks.forEach(crack => crack.destroy());
      this.cracks = null;
    }

    // Создаем эффект взрыва
    this.createExplosionEffect();

    // Эмитим событие уничтожения
    this.scene.events.emit('brick-destroyed', this.scoreValue);

    // Уничтожаем объект
    super.destroy();
  }

  // Эффект взрыва (упрощенный для предотвращения зависания)
  createExplosionEffect() {
    // Проверяем количество активных анимаций в сцене для предотвращения перегрузки
    const activeAnimations = this.scene.tweens.getTweens().length;
    if (activeAnimations > 30) {
      // Если слишком много анимаций, создаем только простую вспышку
      this.createSimpleFlash();
      return;
    }

    // Уменьшаем количество частиц для стабильности
    const particleCount = 3;

    for (let i = 0; i < particleCount; i++) {
      const particle = this.scene.add.rectangle(
        this.x,
        this.y,
        3,
        3,
        this.baseColor
      );

      // Случайное направление
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = Phaser.Math.Between(20, 60);
      const targetX = this.x + Math.cos(angle) * speed;
      const targetY = this.y + Math.sin(angle) * speed;

      // Анимация взрыва с меньшей продолжительностью
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          if (particle && particle.destroy) {
            particle.destroy();
          }
        }
      });
    }

    // Создаем простую вспышку
    this.createSimpleFlash();
  }

  // Простая вспышка без сложных анимаций
  createSimpleFlash() {
    const flash = this.scene.add.circle(this.x, this.y, 15, 0xffffff, 0.5);
    this.scene.tweens.add({
      targets: flash,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        if (flash && flash.destroy) {
          flash.destroy();
        }
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
