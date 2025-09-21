# Deploy to Vercel

Step-by-step guide to deploy **intern3.chat** on Vercel.

---

## Prerequisites

* Vercel account
* GitHub repository with your code
* Convex account (for backend services)
* PostgreSQL database (Neon, Supabase, or similar) – `DATABASE_URL` in environment variables

---

## Step 1: Set up Convex Backend

First, deploy your Convex backend:

```bash
# Install Convex CLI
bun install -g convex

# Login to Convex
bunx convex login

# Deploy to production
bunx convex deploy
```

Copy your production Convex URL from the deployment output.

---

## Step 2: Database Setup

Ensure the `DATABASE_URL` environment variable is set in your local environment.

### Run Migrations

```bash
# Set your database URL
export DATABASE_URL="postgresql://..."

# Generate and run migrations
bun auth:migrate
```

---

## Step 3: Configure Environment Variables

In your **Vercel project settings**, add these environment variables:

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://your-db-url

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
# Generate with: openssl rand -base64 32

# Convex
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
VITE_CONVEX_API_URL=https://your-convex-deployment.convex.site

# Better Auth URL (set after deployment)
VITE_BETTER_AUTH_URL=https://your-app.vercel.app

# For encryption (BYOK feature)
ENCRYPTION_KEY=your-32-character-hex-string
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Email Configuration

```bash
# Email provider
EMAIL_PROVIDER=<resend|ses>
EMAIL_FROM=noreply@yourdomain.com

# Resend API key (if using Resend)
RESEND_API_KEY=re_...

# SES (if using AWS SES)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=your-region
```

### PostHog Analytics

```bash
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://eu.i.posthog.com
```

### OAuth Providers

These are used in Better Auth. Add/remove providers as you like:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Twitch OAuth
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret
```

---

## Step 4: Deploy to Vercel

Deploy using the Vercel CLI:

```bash
# Deploy
bunx vercel --prod

# Set production environment variables
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
# ... add all other variables
```

---

## Step 5: Configure Domain & Auth

1. **Set Custom Domain** (optional):

   * Go to Project Settings → Domains
   * Add your custom domain

2. **Update Auth URLs**:

   * Update `VITE_BETTER_AUTH_URL` with your final domain
   * Update OAuth redirect URIs in provider settings

Redeploy so authentication works properly.

---

## Step 6: Convex Environment Variables

In your **Convex Dashboard** (Deployment → Settings), add:

```bash
VITE_BETTER_AUTH_URL=<inherit>
ENCRYPTION_KEY=<inherit>

# Default API keys (when users don't provide their own)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
FAL_API_KEY=fal-...
GROQ_API_KEY=gsk-...

# Cloudflare R2 / S3 storage
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_TOKEN=your-r2-token

# Web search providers
FIRECRAWL_API_KEY=fc-...
BRAVE_API_KEY=BSA...

# R2/S3 bucket config
R2_BUCKET=your-bucket-name
R2_FORCE_PATH_STYLE=true   # true if using R2, false if using AWS S3
```

---

## Verify Deployment

* Open your app on the Vercel domain.
* Test login (OAuth, email, etc.).
* Verify database migrations are applied.
* Ensure Convex API endpoints are responding.
* Check analytics (PostHog).

---

## Troubleshooting

* Double-check environment variables in Vercel dashboard.
* Ensure Convex backend is deployed and URLs match.
* Confirm `DATABASE_URL` works locally before deploying.
* If auth fails, regenerate `BETTER_AUTH_SECRET` and redeploy.
