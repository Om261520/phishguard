import pytest
from app.services.scan_service import ScanService


def test_valid_urls():
    valid_urls = [
        "https://www.google.com",
        "http://example.com/login",
        "https://sub.domain.co.uk/path/to/page?query=test#hash",
        "http://192.168.1.1:8080/index.html",
        "paypal-security-update.com",
        "https://github.com/torvalds/linux"
    ]
    for url in valid_urls:
        assert ScanService.validate_url(url) is True, f"Failed for valid URL: {url}"


def test_invalid_urls():
    invalid_urls = [
        "",
        "   ",
        "a",
        "://missing-scheme-and-host",
        "http://",
        "ftp://[invalid-ip",
    ]
    for url in invalid_urls:
        assert ScanService.validate_url(url) is False, f"Should be invalid: {url}"
