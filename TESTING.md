## Testing Guide

This project uses Jest with the jest-expo preset and React Native Testing Library for isolated frontend testing. Device APIs (file system, camera, notifications) are mocked; data is stored in an in-memory filesystem during tests.

### Prerequisites
- Node 18 or 20
- npm installed

### Install and quick start
```bash
npm i
npm run test
```

### Run individual tests
- By file path:
```bash
npm run test -- tests/components/Timeline.test.tsx
```
- By name pattern:
```bash
npm run test -- -t "captures front then back"
```
- Watch mode (interactive):
```bash
npm run test:watch
```

### Coverage reports
```bash
npm run test:ci    # runs in CI mode with coverage
# or
npm run test -- --coverage --coverageReporters=text,html
```
HTML coverage output will be in `coverage/`.

---

## How mocking works

Jest is configured via `jest.config.js` to use `preset: 'jest-expo'` and a global setup file `setupTests.ts`.

### Global setup (`setupTests.ts`)
- Extends native matchers and initializes RN gesture mocks.
- Replaces device/native APIs with local mocks:
  - `expo-file-system/legacy` → in-memory FS at `fs://doc/`
  - `expo-crypto` → deterministic salt/hash
  - `expo-notifications` → stubs schedule/permissions
  - `expo-camera` → stubbed `CameraView` and `useCameraPermissions`
  - `expo-router` → no-op Stack, mocked navigation hooks
  - `react-native-reanimated` → default mock

### In-memory filesystem
- Path root: `fs://doc/BeReal/`
- Data files used by the app:
  - `users.json`, `session.json`, `profiles.json`, `reactions.json`
  - Per-user photos: `users/<userId>/all_photos/*.jpg`
- Mock helpers (internal to the FS mock):
  - `__reset()` – clear all files
  - `__setReadFailure(pattern)`, `__setWriteFailure(pattern)` – inject failures
  - `__setDelay(pattern, ms)` – add artificial latency

### Camera mock
- `CameraView` exposes `takePictureAsync` returning the next queued base64 image.
- Use helpers:
```ts
import { __queuePicture, __resetCameraMock } from '../../__mocks__/expo-camera';
__resetCameraMock();
__queuePicture('FRONT');
__queuePicture('BACK');
```

### Fixtures and test utilities
- Fixtures: `src/test-utils/fixtures/`
  - `fixtures.empty()` → empty app state
  - `fixtures.loading({ delayMs })` → delayed reads to simulate loading
  - `fixtures.error({ readFailPattern, writeFailPattern })` → failure injection
  - `fixtures.populated({...})` → seed users/session/profiles/reactions/photos
- FS helpers: `src/test-utils/fsTestHelpers.ts`
- Render wrapper: `src/test-utils/render.tsx` wraps UI with providers for realistic rendering.

---

## Adding new tests

### Where to put tests
- Unit services: `tests/unit/services/*.test.ts`
- Components/screens: `tests/components/*.test.tsx`
- Cross-screen integration: `tests/integration/*.test.tsx`

### Minimal example (component)
```ts
import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';
import { render } from '../../src/test-utils/render';
import TimelineScreen from '../../app/index';
import { fixtures } from '../../src/test-utils/fixtures';

test('shows my posts only', async () => {
	await fixtures.populated({
		users: [
			{ id: 'u1', email: 'me@example.com', role: 'admin' },
			{ id: 'u2', email: 'other@example.com', role: 'viewer' },
		],
		sessionUserId: 'u1',
		photos: [
			{ userId: 'u1', dateKey: '20250110', timeKey: '091500' },
			{ userId: 'u2', dateKey: '20250110', timeKey: '091501' },
		],
	});
	render(<TimelineScreen />);
	await waitFor(() => expect(screen.getByText(/On time|Late/)).toBeTruthy());
});
```

### Minimal example (integration)
```ts
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { render } from '../../src/test-utils/render';
import CaptureScreen from '../../app/capture';
import TimelineScreen from '../../app/index';
import { fixtures } from '../../src/test-utils/fixtures';
import { __queuePicture } from '../../__mocks__/expo-camera';

test('capture then show on timeline', async () => {
	await fixtures.populated({ users: [{ id: 'u1', email: 'a@x.com', role: 'admin' }], sessionUserId: 'u1' });
	__queuePicture('FRONT');
	__queuePicture('BACK');
	render(<CaptureScreen />);
	fireEvent.press(screen.getByText(/Capture Front/i));
	fireEvent.press(await screen.findByText(/Capture Back/i));
	await waitFor(() => expect(screen.getByText(/Saved!/i)).toBeTruthy());
	render(<TimelineScreen />);
	await waitFor(() => expect(screen.getByText(/On time|Late/)).toBeTruthy());
});
```

---

## Debugging failing tests

### Common commands
- Clear Jest cache:
```bash
npm run test -- --clearCache
```
- Run a single test in-band (helpful for race conditions):
```bash
npm run test -- tests/components/Timeline.test.tsx --runInBand --verbose
```
- Increase timeout for long async tests:
```ts
jest.setTimeout(15000);
```
- Print the rendered tree:
```ts
import { screen } from '@testing-library/react-native';
screen.debug();
```

### Flaky/timing issues
- Use fake timers for code relying on `setTimeout`/`setInterval`. Example:
```ts
jest.useFakeTimers();
// trigger code
jest.advanceTimersByTime(1000);
jest.useRealTimers();
```
- For tests using artificial FS delays (`fixtures.loading`), prefer real timers and `await waitFor(...)` with adequate timeout.

### Module/mocking issues
- If you see errors like "requireNativeComponent" or reanimated complaints, ensure `setupTests.ts` includes:
  - `react-native-gesture-handler/jestSetup`
  - `react-native-reanimated` mock
- If camera permission affects rendering, adjust the camera mock:
```ts
jest.mock('expo-camera', () => ({
	...jest.requireActual('../__mocks__/expo-camera'),
	useCameraPermissions: () => [{ granted: false }, jest.fn()],
}));
```

### Data/state issues
- Seed state using fixtures before rendering components.
- Inspect the in-memory FS by instrumenting the FS mock or by reading via its API within the test.

### Dependency/version issues
- If RN/React renderer mismatch warnings appear:
```bash
rm -rf node_modules package-lock.json
npm i
npx expo start -c
```

---

## Organization and conventions
- Tests live in `tests/` grouped by purpose:
  - `unit/services` for pure logic
  - `components` for screen-level tests
  - `integration` for cross-screen flows
- Shared utilities in `src/test-utils/`; mocks in `__mocks__/`.
- Use the provided `render` wrapper to include required providers.


