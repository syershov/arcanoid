# 🌐 Быстрый запуск на Play with Docker

## Шаг 1: Подготовка

1. Перейдите на [Play with Docker](https://labs.play-with-docker.com/)
2. Нажмите "Start" для создания новой сессии
3. Нажмите "Add New Instance" для создания виртуальной машины

## Шаг 2: Клонирование проекта

```bash
# Клонируйте репозиторий
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ>
cd arcanoid
```

## Шаг 3: Запуск игры

### Вариант A: Быстрый запуск с Docker Compose (рекомендуется)

```bash
# Сборка и запуск в одной команде
docker-compose up --build
```

### Вариант B: Ручная сборка

```bash
# Сборка Docker образа
docker build -t arcanoid-game .

# Запуск контейнера
docker run -d -p 8080:8080 --name arcanoid arcanoid-game
```

## Шаг 4: Открытие игры

1. После успешного запуска вы увидите сообщение о том, что сервер запущен
2. В интерфейсе Play with Docker появится кнопка "8080" рядом с IP адресом
3. Нажмите на кнопку "8080" для открытия игры в новой вкладке
4. Наслаждайтесь игрой Arcanoid!

## 🔧 Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Проверка состояния
docker-compose ps

# Проверка здоровья приложения
curl http://localhost:8080/health
```

## 📋 Что делать если что-то пошло не так

### Проблема: Порт уже занят
```bash
# Остановите все контейнеры
docker-compose down
docker stop $(docker ps -aq)

# Запустите заново
docker-compose up --build
```

### Проблема: Ошибка сборки
```bash
# Очистите Docker кэш
docker system prune -f

# Пересоберите образ
docker-compose up --build --force-recreate
```

### Проблема: Игра не загружается
1. Убедитесь, что контейнер запущен: `docker-compose ps`
2. Проверьте логи: `docker-compose logs`
3. Проверьте health check: `curl http://localhost:8080/health`

## 🎮 Управление игрой

- **Стрелки ← →** или **A, D** - движение платформы
- **Пробел** - запуск мяча / пауза
- **Enter** - запуск мяча
- **ESC** - пауза / возврат в меню

## 🚀 Особенности для Play with Docker

- Приложение автоматически доступно на порту 8080
- Включен health check для мониторинга
- Оптимизировано для быстрого запуска
- Использует минимальный Alpine Linux образ
- Настроено сжатие gzip для быстрой загрузки

---

**Время сборки**: ~2-3 минуты
**Время запуска**: ~10-15 секунд
**Размер образа**: ~50-70 MB

*Удачной игры! 🎯*
