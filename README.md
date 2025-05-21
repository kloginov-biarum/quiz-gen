# Quiz Challenge Web Application

## Description
The Quiz Challenge is a web application designed to test users' knowledge through a timed, multiple-choice quiz. Users can start a quiz by providing their email, answer questions within a time limit, and receive a score based on correctness and speed. The application also features an admin interface for viewing user scores and managing the question bank. It's built with Python (FastAPI) on the backend, a simple HTML/CSS/JavaScript frontend, and is fully containerized with Docker for easy deployment and setup.

## Features
*   **Email Entry**: Users start the quiz by entering their email.
*   **Timed Quiz**: A 60-second countdown timer keeps the challenge engaging.
*   **Random Questions**: Questions are presented in a random order for variety.
*   **Dynamic Scoring**: Points are awarded based on both the correctness of the answer and the time taken.
*   **Quiz Summary**: A summary screen displays the user's final score and their all-time high score.
*   **Admin Dashboard**: Accessible via `/admin-dashboard-37Xp1fZ`, allowing admins to view all users and their high scores.
*   **Question Management**: Admins can add new questions and delete existing ones via the `/admin/questions` page.
*   **Mobile-Friendly Design**: The user interface is responsive and usable on various screen sizes.
*   **Dockerized**: The entire application is containerized using Docker and Docker Compose for easy setup and deployment.

## Tech Stack
*   **Backend**: Python, FastAPI, Uvicorn
*   **Database**: SQLAlchemy (ORM), SQLite (database engine)
*   **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
*   **Templating**: Jinja2
*   **Containerization**: Docker, Docker Compose

## Prerequisites
*   Docker Engine installed (e.g., Docker Desktop).
*   Docker Compose installed (usually comes with Docker Desktop).

## Getting Started / Running with Docker
1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
2.  **Navigate to the application directory**:
    The `Dockerfile` and `docker-compose.yml` are located within the `quiz_app` directory.
    ```bash
    cd quiz_app
    ```
3.  **Build and run the application using Docker Compose**:
    *   To build the Docker image and run the container(s) in detached mode (in the background):
        ```bash
        docker-compose build
        docker-compose up -d
        ```
    *   Alternatively, to run in the foreground and see logs directly:
        ```bash
        docker-compose build
        docker-compose up
        ```
4.  **Access the application**:
    The Quiz Challenge app will be available at `http://localhost:8012`.

## Admin Access
The admin interface provides access to user data and question management. An admin key is required to access these routes.

*   **Admin Dashboard URL**: `http://localhost:8012/admin-dashboard-37Xp1fZ?admin_key=YOUR_ADMIN_KEY`
*   **Question Management URL**: `http://localhost:8012/admin/questions?admin_key=YOUR_ADMIN_KEY`

**Admin Key Configuration:**
*   **Default Development Key**: The `Dockerfile` sets a default `ADMIN_ACCESS_KEY` to `Aa123456`. This is intended for development purposes only.
*   **Overriding with Docker Compose**: You can override this key when using Docker Compose by setting the `ADMIN_ACCESS_KEY_COMPOSE` environment variable.
    *   The `docker-compose.yml` is configured to use `ADMIN_ACCESS_KEY_COMPOSE` if set, otherwise it falls back to `Aa123456` (another default, showing precedence).
    *   For a persistent and secure way to set this for your local Docker Compose environment, create a `.env` file in the `quiz_app` directory (alongside `docker-compose.yml`) with your desired key:
        ```env
        # quiz_app/.env
        ADMIN_ACCESS_KEY_COMPOSE=my_very_secure_admin_key_12345
        ```
        Docker Compose will automatically pick up variables from this `.env` file.

## Project Structure
```
.
├── quiz_app/                  # Main application directory
│   ├── .dockerignore          # Specifies intentionally untracked files for Docker
│   ├── Dockerfile             # Instructions to build the Docker image
│   ├── docker-compose.yml     # Defines and runs multi-container Docker applications
│   ├── main.py                # FastAPI application, API endpoints, request handling
│   ├── database.py            # SQLAlchemy setup, database engine, session management
│   ├── models.py              # SQLAlchemy ORM models (database table definitions)
│   ├── schemas.py             # Pydantic schemas for data validation and serialization
│   ├── crud.py                # CRUD (Create, Read, Update, Delete) database operations
│   ├── requirements.txt       # Python package dependencies
│   ├── quiz_app.db            # SQLite database file (created on run, persisted by Docker volume)
│   ├── static/                # Static assets
│   │   ├── css/style.css      # Main stylesheet
│   │   ├── js/                # JavaScript files (main.js, quiz.js, summary.js, admin.js)
│   │   └── img/logo.png       # Application logo (assumed to be present)
│   └── templates/             # HTML templates (Jinja2)
│       ├── base.html          # Base template with common layout
│       ├── index.html         # Landing page
│       ├── quiz.html          # Quiz interface
│       ├── summary.html       # Post-quiz summary page
│       ├── admin_dashboard.html # Admin view for users and scores
│       └── admin_questions.html # Admin page for question management
└── README.md                  # This file (project overview and instructions)
```

## API Endpoints Overview
*   `GET /`: Serves the landing page (`index.html`).
*   `POST /start_quiz`: Initializes a quiz session for a user (identified by email).
*   `GET /quiz/question`: Fetches a random question for the ongoing quiz.
*   `POST /quiz/answer`: Submits a user's answer to a question, returns correctness and points.
*   `POST /quiz/end`: Finalizes the quiz session, records the score, and updates the user's high score.
*   `GET /admin-dashboard-37Xp1fZ`: (Admin) Displays user data and high scores. Requires `admin_key`.
*   `GET /admin/questions`: (Admin) Displays existing questions and a form to add new ones. Requires `admin_key`.
*   `POST /admin/questions/add`: (Admin) Adds a new question to the database. Requires `admin_key`.
*   `POST /admin/questions/{question_id}/delete`: (Admin) Deletes a specific question. Requires `admin_key`.

---
*This Quiz Challenge application is a demonstration project.*
