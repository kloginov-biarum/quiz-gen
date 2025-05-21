FROM python:3.9-slim

# Настройки окружения
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV ADMIN_ACCESS_KEY="SUPER_SECRET_KEY_123!"

# Рабочая директория
WORKDIR /app

# Установка зависимостей
COPY quiz_app/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Копируем весь код в папку /app/quiz_app
COPY quiz_app /app/quiz_app

# Открываем порт
EXPOSE 8012

# Запускаем приложение
CMD ["uvicorn", "quiz_app.main:app", "--host", "0.0.0.0", "--port", "8012"]
