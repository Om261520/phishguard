from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="analyst", nullable=False)  # 'admin', 'analyst', 'viewer'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    notes = relationship("AnalystNote", back_populates="user", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(Text, nullable=False, index=True)
    domain = Column(String(255), index=True)
    protocol = Column(String(10), default="http")
    classification = Column(String(20), index=True, nullable=False)  # 'SAFE', 'SUSPICIOUS', 'PHISHING'
    risk_score = Column(Integer, index=True, nullable=False)  # 0 - 100
    ml_probability = Column(Float, nullable=False)  # 0.0 - 1.0
    rule_score = Column(Integer, nullable=False)  # 0 - 100
    recommendation = Column(Text, nullable=True)
    executive_summary = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    features = relationship("Feature", back_populates="scan", cascade="all, delete-orphan")
    detections = relationship("Detection", back_populates="scan", cascade="all, delete-orphan")
    notes = relationship("AnalystNote", back_populates="scan", cascade="all, delete-orphan")


class Feature(Base):
    __tablename__ = "features"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    feature_value = Column(String(255), nullable=False)
    risk_contribution = Column(String(100), nullable=True)
    significance = Column(String(255), nullable=True)

    scan = relationship("Scan", back_populates="features")


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    rule_id = Column(String(20), nullable=False)  # e.g., 'RULE-001'
    rule_name = Column(String(150), nullable=False)
    severity = Column(String(20), nullable=False)  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    description = Column(Text, nullable=False)
    score = Column(Integer, nullable=False)
    triggered = Column(Boolean, default=False, nullable=False)

    scan = relationship("Scan", back_populates="detections")


class AnalystNote(Base):
    __tablename__ = "analyst_notes"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(50), nullable=False, default="SOC Analyst")
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notes")
    scan = relationship("Scan", back_populates="notes")


class ThreatIndicator(Base):
    __tablename__ = "threat_indicators"

    id = Column(Integer, primary_key=True, index=True)
    indicator = Column(String(255), unique=True, index=True, nullable=False)
    indicator_type = Column(String(20), index=True, nullable=False)  # 'URL', 'DOMAIN', 'IP', 'HASH'
    threat_category = Column(String(100), nullable=False)
    confidence = Column(Integer, default=90)  # 0-100
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    source = Column(String(100), default="PhishGuard Threat Network")
    is_demo = Column(Boolean, default=True)
