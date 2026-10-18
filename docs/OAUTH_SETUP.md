# Google OAuth + Supabase Setup Guide

## Overview
This guide walks you through setting up Google OAuth authentication and Supabase as your database for BILIM.

## Step 1: Create a Supabase Project

### 1.1 Sign up at Supabase
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Sign Up" and choose "Continue with GitHub" (or email)
3. Follow the setup wizard

### 1.2 Create a New Project
1. Click "New Project"
2. Choose a name (e.g., "bilim-app")
3. Set a strong database password
4. Select your preferred region
5. Click "Create new project" and wait ~2 minutes for it to initialize

### 1.3 Get Your Credentials
1. Go to **Settings → API** (in the left sidebar)
2. Copy your **Project URL** → paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
3. Under "Project API keys", copy the **Service Role Secret** → paste as `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Keep the Service Role Key secret!** Don't commit it to GitHub.

---

## Step 2: Set Up Google OAuth

### 2.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Create Project**
3. Enter "BILIM App" as the project name
4. Click **Create** and wait for it to be created

### 2.2 Enable Google+ API
1. In the left sidebar, click **APIs & Services → Library**
2. Search for "Google+ API"
3. Click it and press **Enable**

### 2.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth 2.0 Client ID**
3. If prompted to create a consent screen, click **Configure Consent Screen**
   - Choose "External" for User Type
   - Fill in the required fields (App name: "BILIM", Support email: your email)
   - Add scopes: `userinfo.email`, `userinfo.profile`
   - Save and continue
4. Back to credentials creation, select **Web Application**
5. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3111/api/auth/callback/google
   https://your-domain.com/api/auth/callback/google  (add this later when deploying)
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### 2.4 Add to `.env.local`
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## Step 3: Configure NextAuth Secret

### 3.1 Generate Secret
Run this in your terminal:
```bash
openssl rand -base64 32
```

Or online at [this generator](https://generate-secret.vercel.app/32).

### 3.2 Add to `.env.local`
```
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=http://localhost:3111
```

---

## Step 4: Test the Setup

### 4.1 Run the App
```bash
npm run dev
```

### 4.2 Visit Sign-In Page
1. Go to `http://localhost:3111/auth/signin`
2. Click "Войти с Google"
3. Sign in with your Google account
4. You should be redirected to `/dashboard`

### 4.3 Check Supabase Database
1. Go to Supabase dashboard → **SQL Editor**
2. Run this query to verify the user was created:
   ```sql
   SELECT * FROM "user";
   ```

---

## Step 5: Deploy to Production

When deploying to production (Vercel, Railway, etc.):

### 5.1 Update Google OAuth URLs
1. In Google Cloud Console → **Credentials**
2. Edit the OAuth 2.0 Client ID
3. Add your production domain redirect URI:
   ```
   https://your-bilim-app.com/api/auth/callback/google
   ```

### 5.2 Set Environment Variables
Add these to your hosting platform (Vercel, Railway, etc.):
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL=https://your-bilim-app.com`

---

## Troubleshooting

### "Error: NEXTAUTH_URL not set"
→ Make sure `NEXTAUTH_URL` is set in `.env.local`

### "Redirect URI mismatch"
→ Verify the redirect URI in Google Cloud Console matches exactly: `http://localhost:3111/api/auth/callback/google`

### "Failed to create user in database"
→ Check Supabase credentials are correct and the `user` table exists

### User data not saving
→ Verify `@auth/supabase-adapter` is installed and `SUPABASE_SERVICE_ROLE_KEY` is set correctly

---

## Database Schema

NextAuth automatically creates these tables in Supabase:
- `user` - User account information
- `account` - OAuth account linking
- `session` - Active user sessions
- `verification_token` - Email verification tokens

You can extend these with custom fields for BILIM (progress, points, etc.).

---

## Next Steps

1. ✅ Set up Google OAuth
2. ✅ Configure Supabase
3. ⬜ Migrate user progress from localStorage to Supabase
4. ⬜ Add user profile customization (avatar, name, etc.)
5. ⬜ Implement leaderboard (top scorers across all users)
