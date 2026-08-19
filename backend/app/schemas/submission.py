from pydantic import BaseModel, Field
from typing import Optional, Literal


class SubmissionCreate(BaseModel):

    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=10, max_length=2000)

    category: str

    name: str
    phone: str

    village: str
    district: str

    language: str

    ward: Optional[str] = None

    latitude: float
    longitude: float


class SubmissionStatusUpdate(BaseModel):
    status: Literal[
        "Submitted",
        "Under Review",
        "Action Planned",
        "Resolved"
    ]