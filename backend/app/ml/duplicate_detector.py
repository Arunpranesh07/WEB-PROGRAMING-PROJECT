from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from app.models.complaint import Complaint

def check_for_duplicates(
    description: str,
    location: str,
    db: Session,
    similarity_threshold: float = 0.45
) -> Dict[str, Any]:
    # Query pending and in-progress complaints
    candidates = db.query(Complaint).filter(
        Complaint.status.in_(["Pending", "In Progress"])
    ).all()

    if not candidates or not description.strip():
        return {"is_duplicate": False, "matching_complaints": []}

    # Location matching bonus or location filtering:
    # We compare text similarity across candidates in similar or same location
    descriptions = [c.description for c in candidates]
    all_texts = [description] + descriptions

    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        sim_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    except Exception:
        return {"is_duplicate": False, "matching_complaints": []}

    matches = []
    norm_location = location.strip().lower()

    for i, c in enumerate(candidates):
        score = float(sim_scores[i])
        c_loc = c.location.strip().lower()

        # Give boost if locations are very similar or in the same block/building
        is_same_loc = (norm_location in c_loc) or (c_loc in norm_location)
        if is_same_loc:
            score = min(1.0, score + 0.25)

        if score >= similarity_threshold:
            matches.append({
                "complaint_id": c.complaint_id,
                "display_id": c.display_id or f"WCP{1000 + c.complaint_id}",
                "description": c.description,
                "location": c.location,
                "similarity_score": round(score, 3)
            })

    # Sort matches by similarity score descending
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)

    return {
        "is_duplicate": len(matches) > 0,
        "matching_complaints": matches
    }
