from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.models import User, Scan, Feature, Detection, AnalystNote, ThreatIndicator
from app.core.security import get_password_hash
from app.services.scan_service import ScanService


DEFAULT_USERS = [
    {"username": "admin", "email": "admin@phishguard.security", "password": "Admin@123", "role": "admin"},
    {"username": "analyst", "email": "analyst@phishguard.security", "password": "Analyst@123", "role": "analyst"},
    {"username": "viewer", "email": "viewer@phishguard.security", "password": "Viewer@123", "role": "viewer"}
]

DEMO_IOCS = [
    {
        "indicator": "http://paypal-security-update-center.com/login",
        "indicator_type": "URL",
        "threat_category": "Credential Harvesting",
        "confidence": 98,
        "source": "PhishGuard Threat Intel Hub"
    },
    {
        "indicator": "microsoft-online-verify-365.xyz",
        "indicator_type": "DOMAIN",
        "threat_category": "Brand Impersonation / Spear Phishing",
        "confidence": 95,
        "source": "Global SOC Feed"
    },
    {
        "indicator": "185.220.101.5",
        "indicator_type": "IP",
        "threat_category": "Phishing C2 Host",
        "confidence": 92,
        "source": "AbuseIPDB Community Feed"
    },
    {
        "indicator": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "indicator_type": "HASH",
        "threat_category": "Malicious Attachment SHA256",
        "confidence": 99,
        "source": "VirusTotal Intelligence"
    },
    {
        "indicator": "http://192.168.1.105/auth/bank-login.php",
        "indicator_type": "URL",
        "threat_category": "Banking Trojan Credential Gate",
        "confidence": 96,
        "source": "CERT Threat Exchange"
    },
    {
        "indicator": "appleid-icloud-security-alert.top",
        "indicator_type": "DOMAIN",
        "threat_category": "Credential Stealer",
        "confidence": 94,
        "source": "PhishGuard AI Detection Engine"
    },
    {
        "indicator": "45.142.214.18",
        "indicator_type": "IP",
        "threat_category": "Fast-Flux Phishing Reverse Proxy",
        "confidence": 90,
        "source": "Shadowserver Botnet Report"
    },
    {
        "indicator": "http://netflix-billing-renew-session.xyz/account",
        "indicator_type": "URL",
        "threat_category": "Credit Card Harvesting",
        "confidence": 97,
        "source": "OpenPhish Threat Stream"
    }
]

INITIAL_SAMPLE_URLS = [
    "https://www.google.com/search?q=cybersecurity+defense",
    "https://github.com/torvalds/linux",
    "https://en.wikipedia.org/wiki/Phishing",
    "https://www.microsoft.com/en-us/security",
    "http://paypal-security-update-account.com/login",
    "http://192.168.1.105/verify-password.php",
    "https://account-verify-billing-update-center.xyz/auth",
    "http://secure-apple-id-login-attempt.top/step1",
    "https://docs.python.org/3/library/urllib.parse.html",
    "http://chase-bank-online-security-alert.xyz/signin",
    "https://xk98qwz71mnpl0a8s7d6f5.biz/gate/auth",
    "https://stackoverflow.com/questions/tagged/python"
]


def seed_database(db: Session):
    """Seed users, threat intel, and baseline historical scans."""
    # 1. Seed Users
    for user_data in DEFAULT_USERS:
        existing = db.query(User).filter(User.username == user_data["username"]).first()
        if not existing:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                role=user_data["role"],
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
    db.commit()

    # 2. Seed Threat Indicators
    for ioc in DEMO_IOCS:
        existing = db.query(ThreatIndicator).filter(ThreatIndicator.indicator == ioc["indicator"]).first()
        if not existing:
            now = datetime.now(timezone.utc)
            indicator = ThreatIndicator(
                indicator=ioc["indicator"],
                indicator_type=ioc["indicator_type"],
                threat_category=ioc["threat_category"],
                confidence=ioc["confidence"],
                first_seen=now - timedelta(days=5),
                last_seen=now,
                source=ioc["source"],
                is_demo=True
            )
            db.add(indicator)
    db.commit()

    # 3. Seed Initial Scans if table empty
    scan_count = db.query(Scan).count()
    if scan_count == 0:
        print("[*] Seeding initial baseline scans...")
        for sample_url in INITIAL_SAMPLE_URLS:
            try:
                scan_res = ScanService.scan_url(db, sample_url)
                # Add sample analyst notes to phishing / suspicious scans
                if scan_res.classification in ["PHISHING", "SUSPICIOUS"]:
                    note = AnalystNote(
                        scan_id=scan_res.id,
                        user_id=1,
                        username="analyst",
                        note="Preliminary analysis indicates credential harvesting campaign. Block recommended at gateway perimeter.",
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(note)
            except Exception as e:
                print(f"[!] Error seeding scan {sample_url}: {e}")
        db.commit()
        print("[+] Initial baseline scans seeded successfully.")
