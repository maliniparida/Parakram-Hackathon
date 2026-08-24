from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json


from app.database.database import SessionLocal
from app.models.submission import Submission
from app.schemas.submission import (
    SubmissionCreate,
    SubmissionStatusUpdate
)
from app.services.ai_service import analyze_complaint
from app.ml.ml_service import predict_complaint
from app.services.priority_service import calculate_priority_scores

router = APIRouter(
    prefix="/api/submissions",
    tags=["Submissions"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# CREATE SUBMISSION
# =========================

@router.post("/")
def create_submission(
    submission: SubmissionCreate,
    db: Session = Depends(get_db)
):
    print("🔥 CREATE_SUBMISSION CALLED")
    # =========================
    # ML ANALYSIS
    # =========================

    ml_result = predict_complaint(
    submission.title,
    submission.description
)

    ml_category = ml_result.get("category")
    ml_confidence = ml_result.get("confidence")

    # =========================
    # AI ANALYSIS
    # =========================

    ai_result = analyze_complaint(
        submission.title,
        submission.description
    )

    try:
        # Convert AI JSON text into Python dictionary
        ai_data = json.loads(ai_result)

    except json.JSONDecodeError:
        # If AI doesn't return valid JSON, keep the complaint
        # working without AI data
        ai_data = {
            "summary": "",
            "category": "",
            "department": "",
            "keywords": []
        }

    # Convert keywords list into text for SQLite
    keywords = ai_data.get("keywords", [])

    if isinstance(keywords, list):
        keywords = ", ".join(keywords)

    # =========================
    # CREATE DATABASE RECORD
    # =========================

    new_submission = Submission(
        title=submission.title,
        description=submission.description,
        category=submission.category,

        # AI ANALYSIS
        ai_category=ai_data.get("category"),
        ai_summary=ai_data.get("summary"),
        ai_department=ai_data.get("department"),
        ai_keywords=keywords,

        # ML ANALYSIS
        ml_category=ml_category,
        ml_confidence=ml_confidence,

        # CITIZEN DETAILS
        name=submission.name,
        phone=submission.phone,
        village=submission.village,
        district=submission.district,
        language=submission.language,

        # WARD
        ward=submission.ward,

        # REAL GPS LOCATION
        latitude=submission.latitude,
        longitude=submission.longitude
    )

    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    return {
        "message": "CivicAI received the submission successfully!",
        "data": {
            "id": new_submission.id,
            "complaint_id": f"CMP-{new_submission.id}",

            "title": new_submission.title,
            "description": new_submission.description,
            "category": new_submission.category,

            # ML ANALYSIS
            "ml_category": new_submission.ml_category,
            "ml_confidence": new_submission.ml_confidence,

            # AI ANALYSIS
            "ai_category": new_submission.ai_category,
            "ai_summary": new_submission.ai_summary,
            "ai_department": new_submission.ai_department,
            "ai_keywords": new_submission.ai_keywords,

            "name": new_submission.name,
            "phone": new_submission.phone,
            "village": new_submission.village,
            "district": new_submission.district,
            "language": new_submission.language,
            "ward": new_submission.ward,

            "latitude": new_submission.latitude,
            "longitude": new_submission.longitude,

            "status": new_submission.status,
            "created_at": new_submission.created_at
        }
    }# =========================
# GET ALL SUBMISSIONS
# =========================

@router.get("/")
def get_submissions(db: Session = Depends(get_db)):
    submissions = db.query(Submission).all()

    return {
        "data": [
            {
                "id": submission.id,
                "title": submission.title,
                "description": submission.description,
                "category": submission.category,

                # ML ANALYSIS
                "ml_category": submission.ml_category,
                "ml_confidence": submission.ml_confidence,

                # AI ANALYSIS
                "ai_category": submission.ai_category,
                "ai_summary": submission.ai_summary,
                "ai_department": submission.ai_department,
                "ai_keywords": submission.ai_keywords,
                "name": submission.name,
                "phone": submission.phone,
                "village": submission.village,
                "district": submission.district,
                "language": submission.language,
                "ward": submission.ward,
                "latitude": submission.latitude,
                "longitude": submission.longitude,
                "status": submission.status,
                "created_at": submission.created_at
            }
            for submission in submissions
        ]
    }
# =========================
# GET PRIORITY RANKINGS
# =========================

@router.get("/priorities")
def get_priority_rankings(
    db: Session = Depends(get_db)
):
    priorities = calculate_priority_scores(db)

    return {
        "total_categories": len(priorities),
        "data": priorities
    }

# =========================
# GET SUBMISSION BY ID
# =========================

@router.get("/{submission_id}")
def get_submission(
    submission_id: str,
    db: Session = Depends(get_db)
):
    # Convert CMP-5 → 5
    if submission_id.upper().startswith("CMP-"):
        submission_id = submission_id[4:]

    try:
        submission_id = int(submission_id)
    except ValueError:
        return {
            "message": "Invalid submission ID"
        }

    submission = db.query(Submission).filter(
        Submission.id == submission_id
    ).first()

    if not submission:
        return {
            "message": "Submission not found"
        }

    return {
        "data": {
            "id": submission.id,
            "complaint_id": f"CMP-{submission.id}",
            "title": submission.title,
            "description": submission.description,
            "category": submission.category,

            # ML ANALYSIS
            "ml_category": submission.ml_category,
            "ml_confidence": submission.ml_confidence,
            
            "ai_category": submission.ai_category,
            "ai_summary": submission.ai_summary,
            "ai_department": submission.ai_department,
            "ai_keywords": submission.ai_keywords,
            "name": submission.name,
            "phone": submission.phone,
            "village": submission.village,
            "district": submission.district,
            "language": submission.language,
            "ward": submission.ward,
            "latitude": submission.latitude,
            "longitude": submission.longitude,
            "status": submission.status,
            "created_at": submission.created_at
        }
    }

# =========================
# UPDATE SUBMISSION STATUS
# =========================

@router.patch("/{submission_id}/status")
def update_submission_status(
    submission_id: str,
    status_data: SubmissionStatusUpdate,
    db: Session = Depends(get_db)
):
    # Convert CMP-5 → 5
    if submission_id.upper().startswith("CMP-"):
        submission_id = submission_id[4:]

    try:
        submission_id = int(submission_id)
    except ValueError:
        return {
            "message": "Invalid submission ID"
        }

    submission = db.query(Submission).filter(
        Submission.id == submission_id
    ).first()

    if not submission:
        return {
            "message": "Submission not found"
        }

    submission.status = status_data.status

    db.commit()
    db.refresh(submission)

    return {
        "message": "Submission status updated successfully",
        "data": {
            "id": submission.id,
            "complaint_id": f"CMP-{submission.id}",
            "status": submission.status
        }
    }
    