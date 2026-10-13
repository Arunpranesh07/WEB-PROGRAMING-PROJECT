from typing import List, Dict, Any
from pydantic import BaseModel

class CategoryReportItem(BaseModel):
    category: str
    count: int

class StatusReportItem(BaseModel):
    status: str
    count: int

class StaffWorkloadItem(BaseModel):
    staff_id: int
    staff_name: str
    active_assignments: int
    completed_assignments: int

class MonthlyTrendItem(BaseModel):
    month: str
    complaints_count: int

class ReportsSummary(BaseModel):
    total_complaints: int
    by_category: List[CategoryReportItem]
    by_status: List[StatusReportItem]
    average_resolution_hours: float
    monthly_trends: List[MonthlyTrendItem]
    staff_workload: List[StaffWorkloadItem]

class ForecastItem(BaseModel):
    date: str
    actual: float = None
    predicted: float = None

class ForecastResponse(BaseModel):
    historical: List[Dict[str, Any]]
    forecast: List[Dict[str, Any]]
    algorithm: str
