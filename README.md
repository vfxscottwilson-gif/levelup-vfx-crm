# LEVEL UP VFX - Production CRM (TeamLog)

A web CRM designed for **LEVEL UP VFX** to track team production, attendance, 12-hour hourly reports, daily EOD reviews, project deadlines, and artist deliverables.

---

## 🚀 Deploy to Vercel (Step-by-Step)

This project is pre-configured for **1-click Vercel deployment** with `vercel.json` included for SPA routing.

### Option 1: Deploy with GitHub (Recommended)

1. **Initialize Git & Push to GitHub**:
   ```bash
   cd "C:\Users\Khizar Malik\.gemini\antigravity\scratch\teamlog-crm"
   git init
   git add .
   git commit -m "Initial commit - LEVEL UP VFX CRM"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/levelupvfx-crm.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Connect your GitHub account and select `levelupvfx-crm`
   - Vercel will automatically detect the settings:
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Click **Deploy**!
   - Your CRM will be live on `https://your-project.vercel.app` in under 60 seconds!

---

### Option 2: Deploy with Vercel CLI

Run this command in the project directory:
```bash
npx vercel
```
Follow the prompts (accept default settings), and Vercel will provide your live URL immediately.

---

## ⚡ Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run production build & type check
npm run build
```

---

## 👥 Default Accounts

| Name | Email | Role |
|---|---|---|
| Admin Portal | `khizarvfx@gmail.com` | Admin / Supervisor |
| Haroon Malik | `haroonvfx@gmail.com` | Artist |
| Khizar Malik | `vfx.scottwilson@gmail.com` | Artist |
