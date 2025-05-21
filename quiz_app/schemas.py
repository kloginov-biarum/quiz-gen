from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Question Schemas
class QuestionBase(BaseModel):
    text: str
    options: List[str]  # e.g., ["Answer 1", "Answer 2", "Answer 3"]
    correct_answer: str # e.g., "Answer 2"

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int

    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    high_score: int = 0

    class Config:
        from_attributes = True

# QuizAttempt Schemas
class QuizAttemptBase(BaseModel):
    score: int

class QuizAttemptCreate(QuizAttemptBase):
    user_id: int

class QuizAttempt(QuizAttemptBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Answer Submission Schema
class AnswerSubmit(BaseModel):
    question_id: int
    selected_answer: str
    time_taken_seconds: int

# Quiz Session End Schema
class QuizSessionEnd(BaseModel):
    email: str # or user_id if client stores it
    final_score: int
