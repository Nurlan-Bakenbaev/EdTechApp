# BILIM OAuth Architecture 🔐

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          BILIM App                              │
│                   (Next.js 16 + TypeScript)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐  ┌───▼──────┐  ┌──▼──────────┐
        │  Sign-in     │  │ Dashboard│  │ Lessons     │
        │  /auth/signin│  │  Page    │  │ Progress    │
        └───────┬──────┘  └───┬──────┘  └──┬──────────┘
                │             │            │
                └─────────────┼────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  NextAuth.js      │
                    │  Session Provider │
                    └─────────┬─────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐  ┌───▼──────┐  ┌──▼──────────┐
        │ Google OAuth │  │ NextAuth  │  │ Supabase    │
        │   Provider   │  │   API     │  │  Adapter    │
        │              │  │  Route    │  │             │
        └───────┬──────┘  └───┬──────┘  └──┬──────────┘
                │             │            │
                └─────────────┼────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Supabase DB      │
                    │  PostgreSQL       │
                    │                   │
                    │  Tables:          │
                    │  - user           │
                    │  - account        │
                    │  - session        │
                    └───────────────────┘
```

---

## Authentication Flow

```
User Visits App
      │
      ▼
┌──────────────────┐
│ Unauthenticated? │─── NO ──────────────────┐
└────────┬─────────┘                         │
        YES                                  │
         │                                   │
         ▼                                   │
   ┌─────────────────┐                      │
   │ Redirect to     │                      │
   │ /auth/signin    │                      │
   └────────┬────────┘                      │
            │                               │
            ▼                               │
   ┌─────────────────────────┐              │
   │ Sign-in Page with       │              │
   │ "Войти с Google" Button │              │
   └────────┬────────────────┘              │
            │                               │
            ▼                               │
   ┌─────────────────────────┐              │
   │ User Clicks Button      │              │
   └────────┬────────────────┘              │
            │                               │
            ▼                               │
   ┌──────────────────────────────────────┐ │
   │ Redirect to Google OAuth Login       │ │
   └────────┬─────────────────────────────┘ │
            │                               │
            ▼                               │
   ┌──────────────────────────────────────┐ │
   │ User Signs In with Google Account    │ │
   └────────┬─────────────────────────────┘ │
            │                               │
            ▼                               │
   ┌──────────────────────────────────────┐ │
   │ Google Redirects to                  │ │
   │ /api/auth/callback/google            │ │
   └────────┬─────────────────────────────┘ │
            │                               │
            ▼                               │
   ┌──────────────────────────────────────┐ │
   │ NextAuth Creates/Updates User        │ │
   │ in Supabase                          │ │
   └────────┬─────────────────────────────┘ │
            │                               │
            ▼                               │
   ┌──────────────────────────────────────┐ │
   │ Create Session Cookie                │ │
   └────────┬─────────────────────────────┘ │
            │                               │
            ▼                               │
   ┌──────────────────────────────────────┐ │
   │ Redirect to /dashboard or Home       │ │
   └────────┬─────────────────────────────┘ │
            │                               │
            ├───────────────────────────────┘
            │
            ▼
   ┌─────────────────────────────┐
   │ Authenticated!              │
   │ Access to protected pages   │
   │ Can use useAuth() hook      │
   └─────────────────────────────┘
```

---

## File Structure

```
BILIM-AI/
├── lib/
│   ├── auth.ts                      ← NextAuth config + Google provider
│   ├── next-auth-provider.tsx       ← SessionProvider wrapper
│   └── use-auth.ts                  ← useAuth() hook
│
├── app/
│   ├── layout.tsx                   ← Wrapped with NextAuthProvider
│   │
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts         ← NextAuth API handler
│   │
│   └── auth/
│       ├── signin/
│       │   ├── page.tsx             ← Google login page
│       │   └── signin.module.css    ← Login styles
│       │
│       └── error/
│           ├── page.tsx             ← Error handler
│           └── error.module.css     ← Error styles
│
├── docs/
│   └── OAUTH_SETUP.md               ← Complete setup guide
│
├── package.json                     ← Dependencies added
├── .env.local                       ← Environment variables
│
├── OAUTH_CHECKLIST.md               ← Configuration tasks
├── AUTH_SETUP_COMPLETE.md           ← Implementation guide
└── SESSION_SUMMARY.md               ← This session's work
```

---

## Key Components

### 1. NextAuth Configuration (`lib/auth.ts`)
```typescript
export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({...}),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
};
```

### 2. Session Provider (`lib/next-auth-provider.tsx`)
```typescript
'use client';
import { SessionProvider } from 'next-auth/react';

export function NextAuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### 3. useAuth Hook (`lib/use-auth.ts`)
```typescript
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    session,
    logout: async () => {
      await signOut({ redirect: false });
      router.push('/');
    },
  };
}
```

### 4. Sign-in Page (`app/auth/signin/page.tsx`)
```typescript
'use client';
export default function SignInPage() {
  const handleGoogleSignIn = async () => {
    const result = await signIn('google', { redirect: false });
    if (result?.ok) router.push('/dashboard');
  };

  return (
    <div>
      <h1>Добро пожаловать в BILIM</h1>
      <button onClick={handleGoogleSignIn}>
        Войти с Google
      </button>
    </div>
  );
}
```

---

## Database Schema (Auto-created by Supabase)

```sql
-- Users table
CREATE TABLE "user" (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMP,
  image TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- OAuth account linking
CREATE TABLE "account" (
  id UUID PRIMARY KEY,
  "userId" UUID REFERENCES "user"(id) ON DELETE CASCADE,
  type TEXT,
  provider TEXT,
  "providerAccountId" TEXT,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

-- Sessions
CREATE TABLE "session" (
  id UUID PRIMARY KEY,
  "sessionToken" TEXT UNIQUE,
  "userId" UUID REFERENCES "user"(id) ON DELETE CASCADE,
  expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Verification tokens (optional, for email verification)
CREATE TABLE "verification_token" (
  identifier TEXT,
  token TEXT UNIQUE,
  expires TIMESTAMP,
  PRIMARY KEY (identifier, token)
);
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[secret-key]

# Google OAuth
GOOGLE_CLIENT_ID=[client-id].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[client-secret]

# NextAuth
NEXTAUTH_SECRET=[generated-secret]
NEXTAUTH_URL=http://localhost:3111
```

---

## Using in Components

### Check Authentication
```tsx
'use client';
import { useAuth } from '@/lib/use-auth';

export function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <p>Hello {user?.name}!</p>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Protect Routes
```tsx
'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) redirect('/auth/signin');

  return <div>Protected content for {session.user?.email}</div>;
}
```

---

## Testing Checklist

- [ ] Visit `/auth/signin`
- [ ] Click "Войти с Google"
- [ ] Sign in with Google account
- [ ] Redirected to `/dashboard`
- [ ] User created in Supabase database
- [ ] Refresh page - still logged in
- [ ] Close browser, reopen - session restored
- [ ] useAuth() hook returns correct user data
- [ ] Sign out button works
- [ ] Redirected to sign-in after sign out

---

## Security Highlights

✅ **Session Cookies**
- HttpOnly (can't access from JavaScript)
- Secure (HTTPS only in production)
- SameSite (CSRF protection)
- Expires after 30 days (configurable)

✅ **No Sensitive Data in Frontend**
- Service Role Key stays on server only
- OAuth secrets never exposed
- Sessions validated server-side

✅ **OAuth Best Practices**
- PKCE flow used by default
- State parameter prevents CSRF
- Secure redirect URI validation
- Minimal scopes requested

✅ **Database Security**
- Supabase RLS (Row Level Security) ready
- Service Role Key for server access
- Public/anon key for client access (not used yet)
- All user data encrypted in transit

---

## Next Integration Steps

1. **Migrate Progress Data**
   - Move lesson completion from localStorage
   - Store points in Supabase
   - Sync study streaks

2. **User Profile Page**
   - Display user avatar
   - Show email and name
   - Edit preferences
   - Delete account option

3. **Admin Dashboard**
   - See all users
   - View completion stats
   - Manage achievements

4. **Analytics**
   - Track user engagement
   - Completion rates per lesson
   - Average study time

---

## Commits This Session

| Hash | Message |
|------|---------|
| 9375ed2 | Add comprehensive session summary |
| 095437a | Add OAuth setup guides and checklists |
| 130b40f | Add Google OAuth + Supabase authentication |

**Status**: ✅ Ready for Configuration  
**Date**: October 18, 2026
