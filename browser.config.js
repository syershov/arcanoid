// Конфигурация браузера для разработки
// Этот файл помогает настроить, какой браузер использовать при запуске

// Автоматическое определение браузера по умолчанию системы
export const getBrowserConfig = () => {
  // Если установлена переменная окружения BROWSER - используем её
  if (process.env.BROWSER) {
    return process.env.BROWSER;
  }

  // Определяем ОС и возвращаем соответствующий браузер по умолчанию
  const platform = process.platform;

  switch (platform) {
    case 'darwin': // macOS
      return 'default'; // Использует системный браузер по умолчанию
    case 'win32': // Windows
      return 'default';
    case 'linux': // Linux
      return 'default';
    default:
      return true; // Fallback на стандартное поведение Vite
  }
};

// Экспорт для использования в vite.config.js
export default getBrowserConfig;
