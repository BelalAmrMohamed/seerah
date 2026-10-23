# رحلة في السيرة — Android app (Expo SDK 58 · TypeScript · Expo Router)

The website in `../` is untouched. All app code lives in `mobile/`.

## Run
    cd mobile
    cp .env.example .env        # fill EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (public anon key only)
    npm install
    npm run start               # then press "a" (Android emulator) or scan the QR with a dev build

## Build the APK
    npm i -g eas-cli && eas login
    eas init                    # once; links the project to your Expo account
    eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR.supabase.co" --visibility plaintext
    eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_ANON_KEY" --visibility plaintext
    eas build -p android --profile preview

## Notes
- Offline: `src/data/stations.json` (copied from `../src/data`) is bundled, so all 30 stations read without internet. `npm run sync-data` re-copies it.
- AI: calls `https://al-seerah.vercel.app/api/ai/chat`. No Gemini key in the app.
- Google sign-in: add `seerah://auth/callback` to Supabase → Auth → URL Configuration → Redirect URLs.
- First launch forces RTL and reloads the app once.
- Not included: browser voice dictation (no React Native equivalent), the 3D/GSAP scene effects (replaced by native cards + SVG route map), PWA install buttons.
