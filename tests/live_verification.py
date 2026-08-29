import json
import urllib.request

def test_scan(url):
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/scan',
        data=json.dumps({'url': url}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode('utf-8'))
        print(f"[*] Target: {url}")
        print(f"    Verdict:      {data['classification']}")
        print(f"    Risk Score:   {data['risk_score']}/100")
        print(f"    ML Phish:     {data['ml_probability'] * 100:.1f}%")
        print(f"    Rule Score:   {data['rule_score']}/100")
        print(f"    Indicators:   {len(data['explainable_analysis']['contributing_factors'])} factors")
        print(f"    Rec:          {data['recommendation'][:75]}...")
        print("-" * 60)

if __name__ == "__main__":
    print("\n" + "="*60)
    print("      PHISHGUARD LIVE END-TO-END SCAN VERIFICATION")
    print("="*60 + "\n")
    test_scan('https://www.google.com/search?q=cybersecurity')
    test_scan('http://paypal-security-update-account.com/login')
    test_scan('http://192.168.1.105/verify-password.php')
    test_scan('https://xk98qwz71mnpl0a8s7d6f5.biz/gate/auth')
