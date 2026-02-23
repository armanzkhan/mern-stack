# Why sign-in fails: HTTPS frontend + HTTP backend

The app at **https://ressichem-frontend.vercel.app** is served over **HTTPS**.  
Your backend is at **http://167.172.196.0:5000** (**HTTP**).

Browsers **block** HTTP requests from HTTPS pages (mixed content). So the sign-in request to `http://167.172.196.0:5000` never reaches the server — the browser blocks it first.

**Fix:** Expose your backend over **HTTPS** and point the frontend to that URL.

---

## Option 1: Cloudflare Tunnel (free, no domain required)

On the machine where the backend runs (e.g. your server at 167.172.196.0):

1. Install Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
2. Run:
   ```bash
   cloudflared tunnel --url http://localhost:5000
   ```
3. You get a URL like `https://xxxx-xx-xx-xx-xx.trycloudflare.com`. Copy it.
4. In Vercel → your frontend project → **Settings** → **Environment Variables**:
   - Add `NEXT_PUBLIC_BACKEND_URL` = `https://xxxx-xx-xx-xx-xx.trycloudflare.com` (your tunnel URL, no trailing slash).
5. Redeploy the frontend on Vercel.

Keep the `cloudflared` process running (or run it as a service) so the tunnel stays up.

---

## Option 2: ngrok (free tier)

1. Sign up at https://ngrok.com and install ngrok.
2. Run: `ngrok http 5000`
3. Use the HTTPS URL ngrok shows (e.g. `https://abc123.ngrok.io`).
4. Set `NEXT_PUBLIC_BACKEND_URL` in Vercel to that URL and redeploy.

On the free tier the URL changes when you restart ngrok unless you use a reserved domain.

---

## Option 3: Deploy backend to a host that provides HTTPS

Deploy the same Node backend to:

- **Railway** – gives you `https://your-app.up.railway.app`
- **Render** – gives you `https://your-app.onrender.com`
- **Fly.io** – gives you `https://your-app.fly.dev`

Then set `NEXT_PUBLIC_BACKEND_URL` in Vercel to that HTTPS URL.

---

## Option 4: SSL on your current server (167.172.196.0)

If you have a **domain name** pointing to `167.172.196.0`:

1. Install **Caddy** or **nginx** as a reverse proxy in front of your Node app.
2. Use Let’s Encrypt (Caddy does this automatically) to get an HTTPS certificate.
3. Use the URL like `https://api.yourdomain.com` and set that as `NEXT_PUBLIC_BACKEND_URL` in Vercel.

---

## After you have an HTTPS backend URL

1. Vercel → **Settings** → **Environment Variables**  
   - `NEXT_PUBLIC_BACKEND_URL` = `https://your-backend-url` (no trailing slash)
2. **Redeploy** the frontend (Deployments → … → Redeploy).
3. Try sign-in again at https://ressichem-frontend.vercel.app/auth/sign-in.
