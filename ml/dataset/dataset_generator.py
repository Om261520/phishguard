"""
PhishGuard - Dataset Generator
Generates a realistic, balanced dataset (2,500+ records) of legitimate and phishing URLs
with cybersecurity feature distributions for training and evaluating the ML model.
"""

import os
import sys
import random
import pandas as pd

# Add parent directory to path to import feature extraction
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from ml.feature_extraction import extract_features, extract_ml_feature_vector, ML_FEATURE_COLUMNS

# Set random seed for reproducibility
random.seed(42)

# Common legitimate domains
SAFE_DOMAINS = [
    "google.com", "youtube.com", "facebook.com", "wikipedia.org", "yahoo.com",
    "amazon.com", "reddit.com", "twitter.com", "instagram.com", "linkedin.com",
    "netflix.com", "microsoft.com", "apple.com", "github.com", "stackoverflow.com",
    "medium.com", "cloudflare.com", "gitlab.com", "spotify.com", "cnn.com",
    "bbc.com", "nytimes.com", "theguardian.com", "forbes.com", "bloomberg.com",
    "nih.gov", "cdc.gov", "harvard.edu", "mit.edu", "stanford.edu",
    "dropbox.com", "salesforce.com", "adobe.com", "zoom.us", "slack.com",
    "stripe.com", "chase.com", "wellsfargo.com", "bankofamerica.com", "paypal.com",
    "fidelity.com", "vanguard.com", "ebay.com", "etsy.com", "walmart.com",
    "target.com", "homedepot.com", "bestbuy.com", "craigslist.org", "zillow.com",
    "weather.com", "imdb.com", "booking.com", "tripadvisor.com", "airbnb.com",
    "uber.com", "lyft.com", "doordash.com", "yelp.com", "pinterest.com",
    "quora.com", "twitch.tv", "vimeo.com", "duckduckgo.com", "bing.com",
    "cloudflare.net", "fastly.com", "akamai.com", "digitalocean.com", "aws.amazon.com",
    "azure.com", "docker.com", "kubernetes.io", "python.org", "nodejs.org",
    "react.dev", "angular.io", "vuejs.org", "mozilla.org", "w3schools.com"
]

SAFE_PATHS = [
    "",
    "/about",
    "/contact",
    "/services",
    "/products",
    "/blog/article/2026/cybersecurity-trends",
    "/documentation/api/v2/overview",
    "/help/faq",
    "/privacy-policy",
    "/terms-of-service",
    "/search?q=machine+learning+tutorial",
    "/categories/technology/software",
    "/item?id=49204&category=electronics",
    "/watch?v=dQw4w9WgXcQ",
    "/user/profile/settings",
    "/news/2026/global-markets-update",
    "/guide/getting-started-with-python",
    "/downloads/releases/version-3.13",
    "/community/discussions/topic/8821"
]

# Patterns used in phishing URLs
PHISHING_BRANDS = [
    "paypal", "appleid", "microsoft", "google", "netflix", "chase",
    "wellsfargo", "bankofamerica", "amazon", "instagram", "facebook",
    "linkedin", "dhl-tracking", "fedex-delivery", "binance", "coinbase",
    "metamask", "outlook", "office365", "adobe-sign", "dropbox"
]

PHISHING_KEYWORDS = [
    "security-update", "verify-account", "login-attempt", "confirm-identity",
    "wallet-recovery", "billing-alert", "password-reset", "suspicious-activity",
    "secure-portal", "auth-session", "renew-subscription", "2fa-verification",
    "unlock-account", "urgent-notice", "customer-service", "signin-support"
]

PHISHING_TLDS = ["tk", "ml", "ga", "cf", "gq", "top", "xyz", "club", "work", "buzz", "cam", "fit", "rest", "icu"]

IP_LIST = [
    "192.168.1.105", "10.0.0.45", "172.16.254.1", "185.220.101.5",
    "45.142.214.18", "194.26.29.112", "91.240.118.172", "193.106.191.28",
    "103.208.220.12", "23.227.198.203", "198.51.100.42", "203.0.113.19"
]


def generate_benign_url() -> str:
    """Generate a realistic legitimate URL."""
    scheme = "https://" if random.random() < 0.94 else "http://"
    domain = random.choice(SAFE_DOMAINS)
    
    # Sometimes add legitimate subdomain
    if random.random() < 0.25:
        sub = random.choice(["blog", "docs", "api", "support", "community", "dev", "app", "news"])
        domain = f"{sub}.{domain}"
        
    path = random.choice(SAFE_PATHS)
    
    # Minor query params
    if path and not "?" in path and random.random() < 0.3:
        param = random.choice(["ref=home", "lang=en", "mode=dark", "page=2", "sort=recent"])
        path = f"{path}?{param}"
        
    return f"{scheme}{domain}{path}"


def generate_phishing_url() -> str:
    """Generate a realistic phishing URL mimicking common attack vectors."""
    attack_type = random.choice([
        "brand_spoofing",
        "ip_based",
        "dga_entropy",
        "deep_subdomain",
        "redirect_chain",
        "keyword_stuffing",
        "typosquatting"
    ])
    
    scheme = "http://" if random.random() < 0.65 else "https://"
    
    if attack_type == "brand_spoofing":
        brand = random.choice(PHISHING_BRANDS)
        kw = random.choice(PHISHING_KEYWORDS)
        tld = random.choice(PHISHING_TLDS + ["com", "net", "org", "info"])
        domain = f"{brand}-{kw}.{tld}"
        path = random.choice([
            f"/login?auth_token={random.randint(100000, 999999)}",
            f"/verify/user/{random.randint(1000, 9999)}/security.php",
            f"/account/update-credentials.html",
            f"/webscr?cmd=_login-run&dispatch={random.randint(1000, 9999)}"
        ])
        return f"{scheme}{domain}{path}"
        
    elif attack_type == "ip_based":
        ip = random.choice(IP_LIST)
        path = random.choice([
            f"/login.php?ref={random.choice(PHISHING_BRANDS)}",
            f"/secure/verify-account.html",
            f"/auth/signin?session={random.randint(100000, 999999)}",
            f"/cgi-bin/webscr?cmd=_login-submit",
            f"/verification/id/{random.randint(1000, 9999)}"
        ])
        return f"http://{ip}{path}"
        
    elif attack_type == "dga_entropy":
        # High entropy random character string
        chars = "abcdefghijklmnopqrstuvwxyz0123456789"
        rand_str = "".join(random.choices(chars, k=random.randint(18, 30)))
        tld = random.choice(PHISHING_TLDS)
        domain = f"{rand_str}.{tld}"
        path = f"/gate/auth/{random.randint(100, 999)}/index.html"
        return f"{scheme}{domain}{path}"
        
    elif attack_type == "deep_subdomain":
        brand = random.choice(PHISHING_BRANDS)
        kw1 = random.choice(["login", "secure", "verify", "account"])
        kw2 = random.choice(["portal", "service", "auth", "validation"])
        base_domain = random.choice(["duckdns.org", "hopto.org", "zapto.org", "servehttp.com", "bounceme.net", "ddns.net"])
        domain = f"{brand}.{kw1}.{kw2}.{base_domain}"
        path = f"/signin?session_id={random.randint(10000, 99999)}&redirect=account"
        return f"{scheme}{domain}{path}"
        
    elif attack_type == "redirect_chain":
        legit_looking = random.choice(["account-center", "auth-portal", "verification-hub"])
        tld = random.choice(PHISHING_TLDS + ["com", "xyz"])
        domain = f"{legit_looking}.{tld}"
        target = f"http://{random.choice(PHISHING_BRANDS)}-security-confirm.xyz/login"
        path = f"/gateway?url={target}&next=verify&token={random.randint(10000, 99999)}"
        return f"{scheme}{domain}{path}"
        
    elif attack_type == "keyword_stuffing":
        brand = random.choice(PHISHING_BRANDS)
        domain = f"security-{brand}-verification-portal-update.com"
        path = f"/account/signin/authenticate/step1/verify-password.php?client_id={random.randint(10000, 99999)}"
        return f"{scheme}{domain}{path}"
        
    else: # typosquatting / character trick
        brand = random.choice(["g00gle", "micros0ft", "paypa1", "app1e-security", "netf1ix-verify"])
        tld = random.choice(["com", "net", "cc", "top", "xyz"])
        domain = f"{brand}-account-center.{tld}"
        path = "/login.php"
        return f"{scheme}{domain}{path}"


def generate_dataset(num_samples: int = 2500, output_path: str = None) -> pd.DataFrame:
    """Generate balanced dataset and extract feature vectors for each URL."""
    print(f"[*] Generating {num_samples} realistic URL samples (50% benign, 50% phishing)...")
    
    half = num_samples // 2
    benign_urls = [generate_benign_url() for _ in range(half)]
    phishing_urls = [generate_phishing_url() for _ in range(num_samples - half)]
    
    rows = []
    
    # Process benign
    for url in benign_urls:
        features = extract_features(url)
        vector = extract_ml_feature_vector(features)
        row = {col: vector[i] for i, col in enumerate(ML_FEATURE_COLUMNS)}
        row["url"] = url
        row["label"] = 0  # Benign
        rows.append(row)
        
    # Process phishing
    for url in phishing_urls:
        features = extract_features(url)
        vector = extract_ml_feature_vector(features)
        row = {col: vector[i] for i, col in enumerate(ML_FEATURE_COLUMNS)}
        row["url"] = url
        row["label"] = 1  # Phishing
        rows.append(row)
        
    random.shuffle(rows)
    df = pd.DataFrame(rows)
    
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"[+] Dataset successfully saved to: {output_path} ({len(df)} records)")
        
    # Also save separate sample CSV files for testing
    safe_sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sample_data/safe_urls.csv"))
    phish_sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sample_data/phishing_urls.csv"))
    
    os.makedirs(os.path.dirname(safe_sample_path), exist_ok=True)
    pd.DataFrame({"url": benign_urls[:100], "label": [0]*100}).to_csv(safe_sample_path, index=False)
    pd.DataFrame({"url": phishing_urls[:100], "label": [1]*100}).to_csv(phish_sample_path, index=False)
    print(f"[+] Sample datasets saved to sample_data/safe_urls.csv and sample_data/phishing_urls.csv")
    
    return df


if __name__ == "__main__":
    dataset_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "urls_dataset.csv"))
    generate_dataset(num_samples=2500, output_path=dataset_file)
