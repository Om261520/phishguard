# PhishGuard - Backend Service

FastAPI Python backend providing static URL feature extraction, 12 modular security rules, scikit-learn Random Forest inference, SQLite persistence, and JWT authentication.

## Quickstart (Windows)

```powershell
# 1. Activate virtual environment or use Python directly
pip install -r requirements.txt

# 2. Train / verify ML model
python ../ml/train_model.py

# 3. Start development server
uvicorn app.main:app --reload --port 8000
```

## Endpoints Summary
* `GET /api/health` - Comprehensive system health probe
* `POST /api/auth/login` - Authenticate with JWT
* `POST /api/scan` - Analyze URL with explainable verdict
* `GET /api/scan/{id}` - Fetch incident report by ID
* `GET /api/scans` - Paginated and filtered scan history
* `POST /api/compare` - Differential URL comparison
* `GET /api/dashboard/stats` - Live SOC telemetry metrics
* `POST /api/notes` - Add investigation remarks
* `GET /api/threat-intelligence` - Query IOC repository
* `GET /api/reports/{id}/export` - Export printable HTML or JSON report
