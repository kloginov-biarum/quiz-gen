import os
from fastapi import FastAPI, Depends, HTTPException, Request, Form, Path
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional # Ensure List and Optional are imported

from . import crud, models, schemas, database

# Create database tables
# Option 1: Call your function from database.py if it contains this line
# database.create_db_and_tables() 
# Option 2: Directly use models.Base (ensure models.py defines Base correctly)
models.Base.metadata.create_all(bind=database.engine)


app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="quiz_app/static"), name="static")

# Setup Jinja2 templates
templates = Jinja2Templates(directory="quiz_app/templates")

# Dependency for getting DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Admin Protection
ADMIN_KEY = os.getenv("ADMIN_ACCESS_KEY", "SUPER_SECRET_KEY_123!") # Default for dev

async def verify_admin_key(request: Request):
    provided_key = request.query_params.get("admin_key")
    if provided_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Not authorized or missing/incorrect admin key in query parameters.")
    return True

# --- User-Facing Endpoints ---

@app.get("/")
async def serve_landing_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/start_quiz", response_model=schemas.User)
async def start_quiz(email: str = Form(...), db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=email)
    if not db_user:
        db_user = crud.create_user(db, user=schemas.UserCreate(email=email))
    return db_user

@app.get("/quiz/question", response_model=schemas.Question)
async def get_quiz_question(db: Session = Depends(get_db)):
    question = crud.get_random_question(db)
    if not question:
        raise HTTPException(status_code=404, detail="No questions available")
    return question

@app.post("/quiz/answer")
async def submit_answer(answer_data: schemas.AnswerSubmit, db: Session = Depends(get_db)):
    question = crud.get_question(db, question_id=answer_data.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = answer_data.selected_answer == question.correct_answer
    points = 0
    if is_correct:
        # Calculate points: max 100 for 1 sec, min 10 for 10+ secs
        # (10 - time_taken) * 10, but ensure time_taken doesn't make points negative or zero if too long
        # Adjusted logic: points should decrease as time_taken_seconds increases
        time_taken = max(1, min(answer_data.time_taken_seconds, 10)) # clamp time between 1 and 10 for scoring
        points = (11 - time_taken) * 10 # 1 sec = 100, 10 secs = 10
        points = max(10, points) # Ensure minimum 10 points for a correct answer within 10s

    return {
        "correct": is_correct,
        "points_awarded": points,
        "correct_answer": question.correct_answer,
    }

@app.post("/quiz/end")
async def end_quiz(session_end_data: schemas.QuizSessionEnd, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=session_end_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create QuizAttempt
    quiz_attempt_data = schemas.QuizAttemptCreate(
        user_id=user.id,  # Pass user_id here
        score=session_end_data.final_score
    )
    crud.create_quiz_attempt(db=db, quiz_attempt=quiz_attempt_data, user_id=user.id) # Pass user_id to crud

    # Update user's high score
    updated_user = crud.update_user_high_score(db, user_id=user.id, score=session_end_data.final_score)
    
    return {
        "user_email": updated_user.email,
        "final_score": session_end_data.final_score,
        "high_score": updated_user.high_score,
    }

# --- Admin Endpoints ---
@app.get("/admin-dashboard-37Xp1fZ", dependencies=[Depends(verify_admin_key)])
async def admin_dashboard(request: Request, db: Session = Depends(get_db)):
    users = crud.get_users(db)
    # You might want to transform users to a list of dicts or a specific schema for the template
    return templates.TemplateResponse("admin_dashboard.html", {"request": request, "users": users})

@app.get("/admin/questions", dependencies=[Depends(verify_admin_key)])
async def admin_manage_questions(request: Request, db: Session = Depends(get_db)):
    questions = crud.get_questions(db)
    return templates.TemplateResponse("admin_questions.html", {"request": request, "questions": questions})

@app.post("/admin/questions/add", response_model=schemas.Question, dependencies=[Depends(verify_admin_key)])
async def admin_add_question(question_data: schemas.QuestionCreate, db: Session = Depends(get_db)):
    # Assuming question_data is received as a JSON body
    new_question = crud.create_question(db, question=question_data)
    return new_question # FastAPI will return this as JSON, including ID

@app.post("/admin/questions/{question_id}/delete", dependencies=[Depends(verify_admin_key)])
async def admin_delete_question(
    question_id: int = Path(..., title="The ID of the question to delete"),
    db: Session = Depends(get_db)
):
    deleted_question = crud.delete_question(db, question_id=question_id)
    if not deleted_question:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully", "question_id": question_id}
