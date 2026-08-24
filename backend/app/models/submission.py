from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(150), nullable=False)
    description = Column(String(2000), nullable=False)

    category = Column(String, nullable=False)

    # AI ANALYSIS
    ai_category = Column(String(100), nullable=True)
    ai_summary = Column(String(1000), nullable=True)
    ai_department = Column(String(150), nullable=True)
    ai_keywords = Column(String(500), nullable=True)

    # ML ANALYSIS
    ml_category = Column(String(100), nullable=True)
    ml_confidence = Column(Float, nullable=True)

    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    village = Column(String, nullable=False)
    district = Column(String, nullable=False)

    language = Column(String, nullable=False)

    ward = Column(String, nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    status = Column(
    String(30),
    nullable=False,
    default="Submitted",
    server_default="Submitted"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )