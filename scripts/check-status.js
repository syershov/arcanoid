#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Функция для выполнения команд
const execCommand = (command) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return '';
  }
};

// Проверка процессов Vite
const checkViteProcesses = () => {
  const output = execCommand('ps aux | grep "vite" | grep -v grep');
  if (!output) return [];

  return output.split('\n').map(line => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[1];
    const command = parts.slice(10).join(' ');
    return { pid, command };
  });
};

// Проверка занятых портов
const checkOccupiedPorts = () => {
  const output = execCommand('lsof -i :3000 -i :3001 -i :3002 -i :3003 | grep LISTEN');
  if (!output) return [];

  return output.split('\n').map(line => {
    const parts = line.trim().split(/\s+/);
    const process = parts[0];
    const pid = parts[1];
    const portInfo = parts[8];

    // Извлекаем номер порта, учитывая что может быть как число, так и название сервиса
    let port = portInfo.split(':')[1];

    // Если порт представлен как название сервиса, попробуем определить номер
    if (port === 'hbci') port = '3000';
    else if (port === 'redwood-broker') port = '3001';
    else if (port === 'exlm-agent') port = '3002';
    else if (port === 'cgms') port = '3003';

    return { process, pid, port };
  });
};

// Определение URL проекта
const determineProjectUrl = (ports) => {
  const vitePorts = ports.filter(p => p.process === 'node');
  if (vitePorts.length === 0) return null;

  const port = vitePorts[0].port;
  return `http://localhost:${port}`;
};

// Основная функция проверки
const checkProjectStatus = () => {
  console.log('🔍 Проверка статуса проекта Arcanoid...\n');

  const viteProcesses = checkViteProcesses();
  const occupiedPorts = checkOccupiedPorts();

  const status = {
    isRunning: viteProcesses.length > 0,
    processes: viteProcesses,
    ports: occupiedPorts,
    url: determineProjectUrl(occupiedPorts)
  };

  return status;
};

// Вывод результатов
const displayStatus = (status) => {
  if (status.isRunning) {
    console.log('✅ Проект запущен!');
    console.log(`📍 URL: ${status.url || 'Определяется...'}`);
    console.log(`⚡ Процессы (${status.processes.length}):`);

    status.processes.forEach((proc, index) => {
      console.log(`   ${index + 1}. PID: ${proc.pid} - ${proc.command}`);
    });

    if (status.ports.length > 0) {
      console.log(`🔌 Занятые порты:`);
      status.ports.forEach(port => {
        console.log(`   - Порт ${port.port}: ${port.process} (PID: ${port.pid})`);
      });
    }

    console.log('\n💡 Команды управления:');
    console.log('   npm run stop     - остановить сервер');
    console.log('   npm run restart  - перезапустить сервер');

  } else {
    console.log('❌ Проект не запущен');

    if (status.ports.length > 0) {
      console.log('⚠️  Обнаружены занятые порты (не Vite):');
      status.ports.forEach(port => {
        console.log(`   - Порт ${port.port}: ${port.process} (PID: ${port.pid})`);
      });
    }

    console.log('\n🚀 Команды запуска:');
    console.log('   npm run dev:system  - запуск с браузером по умолчанию');
    console.log('   npm run dev         - обычный запуск');
    console.log('   npm run dev:default - принудительно браузер по умолчанию');
  }
};

// Запуск проверки
const main = () => {
  try {
    const status = checkProjectStatus();
    displayStatus(status);

    // Возвращаем код выхода для использования в скриптах
    process.exit(status.isRunning ? 0 : 1);

  } catch (error) {
    console.error('❌ Ошибка при проверке статуса:', error.message);
    process.exit(2);
  }
};

// Экспорт для использования в других модулях
export { checkProjectStatus, checkViteProcesses, checkOccupiedPorts };

// Запуск, если файл вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
