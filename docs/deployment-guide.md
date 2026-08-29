# PhishGuard Live Deployment Guide

This guide covers 4 ways to take **PhishGuard** from your local machine and make it a live, publicly accessible website on the internet.

---

## ⚡ Option 1: Instant Free Live Deployment on Render.com (Recommended)

Render offers free web service hosting and runs both the React frontend and FastAPI backend in a single unified container with automatic SSL (`https://phishguard.onrender.com`).

### Steps:
1. **Push your code to GitHub:**
   ```powershell
   git init
   git add .
   git commit -m "Deploy PhishGuard cybersecurity platform"
   git remote add origin https://github.com/<your-username>/phishguard.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Render:**
   * Go to **[render.com](https://render.com)** and sign up for a free account.
   * Click **New +** $\rightarrow$ **Web Service** $\rightarrow$ **Build and deploy from a Git repository**.
   * Connect your `phishguard` repository.
   * Render will automatically detect [`render.yaml`](file:///c:/Users/om_mi/OneDrive/Desktop/Cyber%20lab%202/render.yaml) or you can set:
     * **Runtime:** `Python 3`
     * **Build Command:** `cd frontend && npm install && npm run build && cd .. && pip install -r backend/requirements.txt && python ml/train_model.py`
     * **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * Click **Create Web Service**.
   * In 2–3 minutes, your live site will be live at `https://<your-app-name>.onrender.com`!

---

## ⚡ Option 2: Instant Public HTTPS Link Right Now (Without Cloud Signup)

If you want an immediate public URL to test on your phone or share with a colleague right now:

### Using LocalTunnel:
```powershell
npx localtunnel --port 8000
```
This generates a temporary public link like `https://quick-cyber-guard.loca.lt` pointing directly to your local server.

---

## ⚡ Option 3: Deploy on Railway.app / Fly.io

1. Go to **[railway.app](https://railway.app)** or **[fly.io](https://fly.io)**.
2. Select **Deploy from GitHub repo**.
3. Railway automatically recognizes the `Dockerfile.backend` / unified build and sets up a custom domain with HTTPS enabled.

---

## ⚡ Option 4: Deploy on Linux Cloud VPS (AWS EC2 / DigitalOcean Droplet / Linode)

Using the included Docker Compose configuration:

```bash
# Clone on your VPS
git clone https://github.com/<your-username>/phishguard.git
cd phishguard

# Launch with Docker Compose
docker compose up -d --build
```
Your application will be live on port 80/443 with Nginx reverse proxy.
