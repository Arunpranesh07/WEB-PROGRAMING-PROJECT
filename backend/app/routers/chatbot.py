from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.chatbot_service import process_chatbot_query

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

class ChatMessageRequest(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    reply: str

@router.post("/message", response_model=ChatMessageResponse)
def chatbot_message(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reply = process_chatbot_query(message=req.message, user_id=current_user.user_id, db=db)
    return {"reply": reply}
