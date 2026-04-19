from fastapi.testclient import TestClient
import pytest

from src.app import create_app


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)