# BeReal One (Multi-User)

A lightweight, local-only BeReal-style app built with Expo + React Native. It supports multiple users on the same device, profiles, permissions, two-step capture (front then back), emoji reactions, and an aggregated timeline (All/Mine).

## Features
- Authentication: Sign up / log in with salted password hashing (expo-crypto). First account becomes admin; others are viewers.
- Profiles: Per-user display name and bio.
- Permissions: Viewers can capture/view; admins can also view all users. (All/Mine toggle is visible to everyone.)
- Storage model: Photos stored per user under documentDirectory/BeReal/users/<userId>/...
- Timeline: View your photos or aggregated photos from all users. Pull-to-refresh and auto-refresh on focus.
- Capture: Two-step flow: front first, then back; late status based on elapsed time.
- Reactions: Emoji reactions (👍 😂 ❤️ 😮) with counts per post, saved locally in reactions.json.
- Notifications: Random daily reminder via Expo Notifications.

## Requirements
- Node.js 18 or 20 and npm
- macOS (recommended) for iOS Simulator: Xcode + Command Line Tools
- Or Android SDK/Emulator for Android

## One-command setup and run
Use the included launcher script. It installs dependencies and starts Expo.

```bash
# macOS/iOS simulator (preferred on macOS)
/Users/allenhuo/Documents/code/bereal-one/run.sh ios

# Android emulator
/Users/allenhuo/Documents/code/bereal-one/run.sh android

# Web (camera support varies by browser)
/Users/allenhuo/Documents/code/bereal-one/run.sh web

# Start dev server (auto-choose iOS on macOS if available)
/Users/allenhuo/Documents/code/bereal-one/run.sh
```

## First run tips
- Create an account on first launch. The first account created on the device is admin.
- Open Profile to set display name/bio.
- Use the All/Mine toggle on Timeline to view everyone’s posts (data is local to this device).
- Reactions: tap emojis under a post to set/switch/clear your reaction.

## Data locations (on-device)
- Users: BeReal/users.json
- Session: BeReal/session.json
- Profiles: BeReal/profiles.json
- Reactions: BeReal/reactions.json
- Photos per user: BeReal/users/<userId>/all_photos/*.jpg

Note: All data is stored locally via Expo FileSystem. There is no backend or cloud sync.

## Troubleshooting
- React/renderer mismatch: If you see a warning about React vs react-native-renderer versions, ensure react and react-dom match the renderer version in package.json (this repo uses 19.1.0). Then:
  ```bash
  rm -rf node_modules package-lock.json && npm i
  npx expo start -c
  ```
- Stale screen or context error after changes: Clear Metro cache:
  ```bash
  npx expo start -c
  ```
- Camera permissions: Accept camera prompts; if denied, update system Settings.

## Project structure (high-level)
- app/ – Screens and routing (Expo Router)
- src/services/ – Domain services (auth, profiles, permissions, timeline, camera, file management, notifications, reactions)
- assets/ – Static assets
- run.sh – One-shot setup and launcher

## Security note
This is a local demo app. Passwords are hashed with a per-user salt, but there is no server, transport security, or remote auth. Do not use in production as-is.


