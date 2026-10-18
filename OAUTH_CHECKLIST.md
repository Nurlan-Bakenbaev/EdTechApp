# OAuth Configuration Checklist

## Your BILIM App is ready for Google OAuth + Supabase!

Follow these steps in order:

### Phase 1: Create Supabase Project (5 minutes)
- [ ] Go to https://supabase.com and sign up
- [ ] Click "New Project"
- [ ] Name: `bilim-app`
- [ ] Set strong database password
- [ ] Select region (choose closest to your users)
- [ ] Wait for initialization (~2 minutes)

### Phase 2: Get Supabase Credentials (2 minutes)
- [ ] Open your Supabase project
- [ ] Click **Settings → API** in left sidebar
- [ ] Copy **Project URL** (looks like: `https://xxxxxx.supabase.co`)
- [ ] Copy **Service Role Secret** (under "Project API keys")
- [ ] Open `.env.local` in your editor
- [ ] Paste:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-url-here.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-secret-key-here
  ```

### Phase 3: Create Google OAuth Credentials (10 minutes)
- [ ] Go to https://console.cloud.google.com
- [ ] Click **Create Project**
- [ ] Name: `BILIM App`
- [ ] Click **Create** and wait
- [ ] Search for **Google+ API** and enable it
- [ ] Go to **APIs & Services → Credentials**
- [ ] Click **+ Create Credentials → OAuth 2.0 Client ID**
- [ ] If prompted: Click **Configure Consent Screen** → Set to "External"
  - [ ] App name: `BILIM`
  - [ ] Support email: your email
  - [ ] Add scope: `userinfo.email`
  - [ ] Add scope: `userinfo.profile`
  - [ ] Save and continue
- [ ] Select **Web Application** as credential type
- [ ] Under "Authorized redirect URIs", add:
  ```
  http://localhost:3111/api/auth/callback/google
  ```
- [ ] Click **Create**
- [ ] Copy **Client ID** and **Client Secret**
- [ ] Open `.env.local` and paste:
  ```
  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your-client-secret
  ```

### Phase 4: Generate NextAuth Secret (2 minutes)
Option A: Using command line
```bash
openssl rand -base64 32
```

Option B: Online generator
- Go to https://generate-secret.vercel.app/32
- Copy the generated secret

Add to `.env.local`:
```
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3111
```

### Phase 5: Test the Setup (5 minutes)
- [ ] Save `.env.local`
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:3111/auth/signin
- [ ] Click "Войти с Google"
- [ ] Sign in with your Google account
- [ ] Should redirect to dashboard
- [ ] ✅ If successful, OAuth is working!

### Phase 6: Verify Database (2 minutes)
- [ ] Go to your Supabase project
- [ ] Click **SQL Editor** (left sidebar)
- [ ] Paste and run:
  ```sql
  SELECT * FROM "user";
  ```
- [ ] You should see your account created! ✅

---

## Production Deployment Checklist

When ready to deploy to production (Vercel, Railway, etc.):

### Google Cloud Console
- [ ] Add production redirect URI in OAuth credentials:
  ```
  https://your-bilim-app.com/api/auth/callback/google
  ```

### Hosting Platform (Vercel, Railway, etc.)
- [ ] Set environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `NEXTAUTH_SECRET` (new secret for production)
  - [ ] `NEXTAUTH_URL=https://your-bilim-app.com`

- [ ] Deploy!
- [ ] Test sign-in on production domain
- [ ] Verify Supabase records are created

---

## Expected Results After Setup

✅ **After completing all steps, you should have:**
- Users can sign in with Google
- User data stored in Supabase database
- Sessions persist across page reloads
- User profile accessible via `useAuth()` hook
- Ready to integrate with lesson progress tracking

---

## Still Having Issues?

Check troubleshooting guide: `docs/OAUTH_SETUP.md` → Troubleshooting section

Or contact support with:
1. Error message (exact text)
2. Which step failed?
3. Your `.env.local` credentials (redacted, of course!)

---

**Status**: ✅ All code implemented, ready for configuration
**Last Updated**: October 18, 2026
