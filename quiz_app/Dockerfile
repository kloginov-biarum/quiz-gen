
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV ADMIN_ACCESS_KEY="SUPER_SECRET_KEY_123!" # Can be overridden at runtime

# Set the working directory in the container
WORKDIR /app

# Copy requirements first to leverage Docker cache
# requirements.txt is at the root of the build context (quiz_app/)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code from the build context (quiz_app/) to /app
COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run app - main:app refers to main.py in /app (WORKDIR)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
