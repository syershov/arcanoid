#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { checkProjectStatus } from './check-status.js';
import readline from 'readline';

// Интерфейс для взаимодействия с пользователем
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Функция для вопросов пользователю
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Функция для выполнения команд
const execCommand = (command) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return '';
  }
};

// Остановка всех процессов Vite
const stopViteProcesses = () => {
  console.log('🛑 Остановка существующих процессов Vite...');
  try {
    execSync('pkill -f "vite"', { stdio: 'pipe' });
    console.log('✅ Процессы остановлены');
    // Небольшая пауза для завершения процессов
    execSync('sleep 2');
  } catch (error) {
    console.log('ℹ️  Процессы уже остановлены или не найдены');
  }
};

// Запуск проекта
const startProject = (command = 'npm run dev:system') => {
  console.log(`🚀 Запуск проекта: ${command}`);

  try {
    // Запускаем в фоновом режиме
    const child = spawn('npm', ['run', 'dev:system'], {
      stdio: 'inherit',
      detached: false
    });

    console.log('✅ Проект запускается...');
    console.log('📍 URL будет доступен через несколько секунд');
    console.log('🌐 Браузер откроется автоматически');

    return child;
  } catch (error) {
    console.error('❌ Ошибка при запуске:', error.message);
    return null;
  }
};

// Основная логика безопасного запуска
const safeStart = async () => {
  console.log('🔍 Проверка статуса проекта Arcanoid...\n');

  try {
    const status = checkProjectStatus();

    if (status.isRunning) {
      console.log('⚠️  Проект уже запущен!');
      console.log(`📍 URL: ${status.url}`);
      console.log(`⚡ Активных процессов: ${status.processes.length}`);

      status.processes.forEach((proc, index) => {
        console.log(`   ${index + 1}. PID: ${proc.pid}`);
      });

      console.log('\nВыберите действие:');
      console.log('1. Использовать существующий сервер (по умолчанию)');
      console.log('2. Перезапустить сервер');
      console.log('3. Запустить на другом порту');
      console.log('4. Отмена');

      const choice = await askQuestion('\nВаш выбор (1-4): ');

      switch (choice) {
        case '2':
          stopViteProcesses();
          startProject();
          break;

        case '3':
          console.log('🚀 Запуск на другом порту...');
          startProject('npm run dev');
          break;

        case '4':
          console.log('❌ Отменено пользователем');
          break;

        case '1':
        case '':
        default:
          console.log('✅ Используем существующий сервер');
          console.log(`🌐 Откройте браузер: ${status.url}`);
          break;
      }

    } else {
      console.log('✅ Проект не запущен, можно запускать');

      if (status.ports.length > 0) {
        console.log('⚠️  Обнаружены занятые порты:');
        status.ports.forEach(port => {
          console.log(`   - Порт ${port.port}: ${port.process}`);
        });
        console.log('Vite автоматически выберет свободный порт\n');
      }

      startProject();
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке статуса:', error.message);
    console.log('🔄 Попытка запуска без проверки...');
    startProject();
  } finally {
    rl.close();
  }
};

// Обработка сигналов завершения
process.on('SIGINT', () => {
  console.log('\n👋 Завершение работы...');
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Завершение работы...');
  rl.close();
  process.exit(0);
});

// Запуск, если файл вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  safeStart().catch(error => {
    console.error('❌ Критическая ошибка:', error.message);
    process.exit(1);
  });
}

export { safeStart, stopViteProcesses, startProject };
