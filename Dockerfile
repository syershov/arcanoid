# Многоступенчатая сборка для оптимизации размера образа
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (включая devDependencies для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение для продакшена
RUN npm run build

# Производственный образ с nginx
FROM nginx:alpine

# Копируем собранное приложение из builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Создаем пользователя для nginx (безопасность)
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

# Устанавливаем права доступа
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
  chown -R nextjs:nodejs /var/cache/nginx && \
  chown -R nextjs:nodejs /var/log/nginx && \
  chown -R nextjs:nodejs /etc/nginx/conf.d

# Создаем директории для nginx
RUN touch /var/run/nginx.pid && \
  chown -R nextjs:nodejs /var/run/nginx.pid

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт 8080 (стандартный для Play with Docker)
EXPOSE 8080

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
