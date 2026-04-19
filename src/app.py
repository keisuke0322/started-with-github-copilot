"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from copy import deepcopy
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles


STATIC_DIR = Path(__file__).parent / "static"


INITIAL_ACTIVITIES = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    "Basketball Team": {
        "description": "Competitive basketball team for varsity and intramural play",
        "schedule": "Mondays and Wednesdays, 4:00 PM - 5:30 PM",
        "max_participants": 15,
        "participants": ["alex@mergington.edu", "james@mergington.edu"]
    },
    "Tennis Club": {
        "description": "Learn tennis skills and participate in friendly matches",
        "schedule": "Tuesdays and Thursdays, 4:00 PM - 5:00 PM",
        "max_participants": 16,
        "participants": ["sara@mergington.edu"]
    },
    "Art Studio": {
        "description": "Explore painting, drawing, and mixed media techniques",
        "schedule": "Wednesdays, 3:30 PM - 5:00 PM",
        "max_participants": 18,
        "participants": ["lily@mergington.edu", "nathan@mergington.edu"]
    },
    "Music Band": {
        "description": "Play instruments and perform in school concerts and events",
        "schedule": "Mondays and Fridays, 3:30 PM - 4:30 PM",
        "max_participants": 25,
        "participants": ["grace@mergington.edu", "kevin@mergington.edu", "rachel@mergington.edu"]
    },
    "Science Club": {
        "description": "Conduct experiments and explore scientific concepts",
        "schedule": "Thursdays, 3:30 PM - 5:00 PM",
        "max_participants": 20,
        "participants": ["lucas@mergington.edu", "maya@mergington.edu"]
    },
    "Debate Team": {
        "description": "Develop argumentation and public speaking skills through debate competitions",
        "schedule": "Tuesdays, 4:00 PM - 5:30 PM",
        "max_participants": 14,
        "participants": ["brandon@mergington.edu", "isabella@mergington.edu"]
    }
}


def get_initial_activities():
    return deepcopy(INITIAL_ACTIVITIES)


def create_app():
    app = FastAPI(
        title="Mergington High School API",
        description="API for viewing and signing up for extracurricular activities",
    )
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    app.state.activities = get_initial_activities()

    @app.get("/")
    def root():
        return RedirectResponse(url="/static/index.html?v=3")

    @app.get("/activities")
    def get_activities(request: Request):
        return request.app.state.activities

    @app.post("/activities/{activity_name}/signup")
    def signup_for_activity(activity_name: str, email: str, request: Request):
        """Sign up a student for an activity"""
        activities = request.app.state.activities

        if activity_name not in activities:
            raise HTTPException(status_code=404, detail="Activity not found")

        activity = activities[activity_name]

        if email in activity["participants"]:
            raise HTTPException(status_code=400, detail="Student already signed up")

        if len(activity["participants"]) >= activity["max_participants"]:
            raise HTTPException(status_code=400, detail="Activity is full")

        activity["participants"].append(email)
        return {"message": f"Signed up {email} for {activity_name}"}

    @app.delete("/activities/{activity_name}/signup")
    def unregister_from_activity(activity_name: str, email: str, request: Request):
        """Unregister a student from an activity"""
        activities = request.app.state.activities

        if activity_name not in activities:
            raise HTTPException(status_code=404, detail="Activity not found")

        activity = activities[activity_name]

        if email not in activity["participants"]:
            raise HTTPException(
                status_code=404,
                detail="Student is not signed up for this activity",
            )

        activity["participants"].remove(email)
        return {"message": f"Unregistered {email} from {activity_name}"}

    return app


app = create_app()
