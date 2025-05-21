from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional
import random

# User functions
def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(email=user.email, high_score=0)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_high_score(db: Session, user_id: int, score: int) -> Optional[models.User]:
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        if score > db_user.high_score:
            db_user.high_score = score
            db.commit()
            db.refresh(db_user)
        return db_user
    return None

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()

# Question functions
def get_question(db: Session, question_id: int) -> Optional[models.Question]:
    return db.query(models.Question).filter(models.Question.id == question_id).first()

def get_questions(db: Session, skip: int = 0, limit: int = 100) -> List[models.Question]:
    return db.query(models.Question).offset(skip).limit(limit).all()

def create_question(db: Session, question: schemas.QuestionCreate) -> models.Question:
    db_question = models.Question(
        text=question.text,
        options=question.options,
        correct_answer=question.correct_answer
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def get_random_question(db: Session) -> Optional[models.Question]:
    all_questions = db.query(models.Question).all()
    if not all_questions:
        return None
    return random.choice(all_questions)

def delete_question(db: Session, question_id: int) -> Optional[models.Question]:
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if db_question:
        db.delete(db_question)
        db.commit()
        return db_question
    return None

# QuizAttempt functions
def create_quiz_attempt(db: Session, quiz_attempt: schemas.QuizAttemptCreate, user_id: int) -> models.QuizAttempt:
    db_quiz_attempt = models.QuizAttempt(
        user_id=user_id, # Corrected: user_id from parameter
        score=quiz_attempt.score
    )
    db.add(db_quiz_attempt)
    db.commit()
    db.refresh(db_quiz_attempt)
    return db_quiz_attempt
