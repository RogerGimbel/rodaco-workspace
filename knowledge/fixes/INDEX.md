
## Supabase private bucket images not displaying
- **Symptom:** Images show broken/blank in UI despite being uploaded correctly
- **Cause:** Storage bucket is private (`public: false`). Raw storage paths don't resolve — need signed URLs.
- **Fix:** Always use `getSignedBladeImageUrl(storagePath)` from `services/bladeImage/imageService.ts`. Never pass raw `storage_path` to `<img src>`.
- **Tags:** supabase, storage, bladekeeper, images

## BladeKeeper: Don't sign image URLs in hooks
- **Symptom:** Images broken in new components even after adding `getSignedBladeImageUrl`
- **Cause:** The app's pattern is hooks pass raw storage paths (`user-uploads/...`), and *components* sign them at render time. `BladeCard.tsx` does this internally. Signing in the hook double-signs, producing garbage URLs.
- **Fix:** Pass raw `img.url` from RPC through hooks. Sign in the component using `getSignedBladeImageUrl(storagePath)` with a `useEffect`.
- **Tags:** bladekeeper, supabase, images, architecture

## BladeKeeper: Images broken in Lovable preview but work on deployed site
- **Symptom:** Signed Supabase Storage URLs show broken images in Lovable preview pane
- **Cause:** Lovable preview runs in an iframe sandbox with different origin — Supabase signed URL requests fail due to CORS/origin mismatch
- **Fix:** Ignore it. Test images on the deployed site (bladekeeper.app), not in Lovable preview.
- **Tags:** bladekeeper, lovable, supabase, images, not-a-bug
