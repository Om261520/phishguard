import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import engine, Base, SessionLocal
from app.services.seed_service import seed_database


@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    """Ensure database tables and demo seed data are initialized for testing."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "services" in data
    assert "api" in data["services"]
    assert "database" in data["services"]


def test_auth_login(client):
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "Admin@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"


def test_scan_api_safe_url(client):
    response = client.post("/api/scan", json={
        "url": "https://www.wikipedia.org"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["classification"] == "SAFE"
    assert data["risk_score"] < 30
    assert "features" in data
    assert "detections" in data
    assert "explainable_analysis" in data


def test_scan_api_phishing_url(client):
    response = client.post("/api/scan", json={
        "url": "http://192.168.1.105/login-verify-account.php"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["classification"] == "PHISHING"
    assert data["risk_score"] >= 80
    assert data["ml_probability"] > 0.5


def test_get_scans_list(client):
    response = client.get("/api/scans?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) <= 5


def test_dashboard_stats(client):
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_scanned" in data
    assert "classification_distribution" in data
    assert "risk_distribution" in data
    assert "scans_over_time" in data


def test_compare_api(client):
    response = client.post("/api/compare", json={
        "url_a": "https://paypal.com",
        "url_b": "http://paypal-security-update-center.xyz/login"
    })
    assert response.status_code == 200
    data = response.json()
    assert "scan_a" in data
    assert "scan_b" in data
    assert "feature_diffs" in data
    assert data["scan_b"]["risk_score"] > data["scan_a"]["risk_score"]


def test_threat_intel_api(client):
    response = client.get("/api/threat-intelligence")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "indicator" in data[0]


def test_notes_and_reports(client):
    # 1. Create a scan
    scan_resp = client.post("/api/scan", json={"url": "https://www.google.com"})
    assert scan_resp.status_code == 200
    scan_id = scan_resp.json()["id"]

    # 2. Add a note
    note_resp = client.post("/api/notes", json={
        "scan_id": scan_id,
        "note": "Verified benign domain during testing."
    })
    assert note_resp.status_code == 200

    # 3. Export report as JSON
    report_json_resp = client.get(f"/api/reports/{scan_id}/export?format=json")
    assert report_json_resp.status_code == 200
    assert "security_assessment" in report_json_resp.json()

    # 4. Export report as HTML
    report_html_resp = client.get(f"/api/reports/{scan_id}/export?format=html")
    assert report_html_resp.status_code == 200
    assert "text/html" in report_html_resp.headers["content-type"]
