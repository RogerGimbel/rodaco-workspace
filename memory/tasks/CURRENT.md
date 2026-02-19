# Current Task

**Status:** IDLE
**Updated:** 2026-02-19 02:07 ET
**Task:** Overnight Build v2 — COMPLETE ✅

## Summary
Completed 4 tasks across BladeKeeper and Mission Control.
See memory/2026-02-19.md for full details.

## What We're Doing
Priority fixes from overnight-queue.md BladeKeeper section:
1. Add "Forgot password?" link on login screen → Supabase password reset email flow
2. Add "Change Password" / "Reset Password" in Settings → Account tab
3. Settings page general cleanup (actually implement account & appearance tabs)

## Plan
- [ ] Step 1: Add ForgotPassword flow to AuthPage.tsx (new "forgot" mode with email input + send reset)
- [ ] Step 2: Add useResetPassword hook (wraps supabase.auth.resetPasswordForEmail)
- [ ] Step 3: Add PasswordResetHandler — catch /auth/callback?type=recovery and show new-password form
- [ ] Step 4: Implement Settings → Account tab (show email, change password, danger zone)
- [ ] Step 5: Settings → Appearance tab (dark/light/system theme toggle)
- [ ] Step 6: TypeScript check + push to GitHub

## Key Files
- `projects/bladekeeper.app/src/pages/AuthPage.tsx` — login/signup form
- `projects/bladekeeper.app/src/pages/AuthCallback.tsx` — OAuth callback, needs recovery handling
- `projects/bladekeeper.app/src/pages/SettingsPage.tsx` — settings tabs
- `projects/bladekeeper.app/src/hooks/useAuthMethods.ts` — signIn/signUp/signOut
- `projects/bladekeeper.app/src/integrations/supabase/client.ts` — supabase client
- `projects/bladekeeper.app/src/components/ThemeProvider.tsx` — theme context

## Supabase
- Project: zocftrkoaokqvklugztj
- Auth reset: supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://bladekeeper.app/auth/callback' })
- Update password: supabase.auth.updateUser({ password: newPassword })

## Deploy
- Push to GitHub after TypeScript check passes
- Lovable auto-syncs → Roger publishes
