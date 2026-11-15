# Milestone 1 (Loading Screen) & P0 Gameplay Verification Report (`SM_A236E` / `R5CWA26LE6N`)

- **Branch:** `b-android` (merged `a-ui` `d961b43` at `5173ac9`)
- **Target Device:** Samsung Galaxy A23 5G (`SM-A236E`, `ro.serialno = R5CWA26LE6N`)
- **ADB Transport Used:** USB (`R5CWA26LE6N device product:a23xqnsdxx model:SM_A236E device:a23xq transport_id:1`)
- **APK:** `builds/app-debug.apk` (`4,378,399` bytes)
- **WebView Engine:** `com.google.android.webview` `156.0.8078.47` (`code 807804703`)

## Build & Test Results

- **`npm test`:** `14` test files passed (`14`), `47` tests passed (`47`), Vitest duration `9.18s` (`test_seconds=12.56`).
- **`npm run build`:** `41 modules transformed`, built in `2.23s` (`web_build_seconds=15.40`); `dist/assets/index-gYOOrmUN.js` (`163.80 kB`), `dist/assets/index-D_5sJ9MO.css` (`64.61 kB`).
- **`npx cap sync android`:** finished in `0.381s` (`cap_sync_seconds=6.57`), junction-modified `capacitor.settings.gradle` & `app/capacitor.build.gradle` restored cleanly via `git checkout --`.
- **`gradlew.bat -p android assembleDebug --no-daemon`:** `BUILD SUCCESSFUL in 1m 5s` (`gradle_build_seconds=66.61`, `153 actionable tasks: 27 executed, 126 up-to-date`).

## Visual Verification Artifacts (`screenshots/`)

| Artifact | Dimensions | Size (bytes) | Visual Check |
|---|---|---|---|
| `screenshots/m1_device_loading.png` | `1080 x 2408` | `1,087,487` | Full-bleed edge-to-edge Man 1 Loading Screen (`PAPER STUDIO`, `PAPER TERRITORY` 3D logo, mascots, maple leaves, bottom spinner; zero system bars). |
| `screenshots/m1_device_vs_video.png` | `2209 x 2408` | `6,032,596` | Side-by-side matched-height comparison (`0018.png` left vs `m1_device_loading.png` right). |
| `screenshots/p0_device_gameplay.png` | `1080 x 2408` | `143,490` | Live gameplay after Play tap (`540, 2175`) + 4 directional swipes: `Dưa Hấu` territory, curved paper trail loop, `Bạn` avatar, live 360° joystick + direction arrow, `0.2%` HUD pill. |

## Runtime, Logcat & Frame Timing (`dumpsys gfxinfo`)

- **Cold Launch (`am start -W`):**
  - M1 capture run: `TotalTime: 1825ms`, `WaitTime: 1854ms` (`LaunchState: COLD`)
  - P0 gameplay run: `TotalTime: 1472ms`, `WaitTime: 1524ms` (`LaunchState: COLD`)
- **System Bars & Cutout (`dumpsys window windows`):**
  - `StatusBar` `isVisible=false`, `NavigationBar0` `isVisible=false`
  - `com.paperclone.game/.MainActivity` `isVisible=true`, `frame=[0,0,1080,2408]`, `DisplayCutout` top `65px`
- **Logcat JS Error Check (`2588` lines scanned, `PID 31559`):**
  - **0 JavaScript runtime errors** (`Uncaught`, `TypeError`, `ReferenceError`, `SyntaxError`, `renderJoystick`, `favicon`, `FATAL` all empty).
  - Local bundled assets loaded cleanly (`https://localhost/assets/index-gYOOrmUN.js`, `index-D_5sJ9MO.css`, `fredoka-latin-700-normal-BOIZVyIN.woff2`, `fredoka-latin-400-normal-17JuUzdy.woff2`).
  - WebAudio initialized (`audioHardwareBufferSize = 192`).
- **Steady-State Gameplay `dumpsys gfxinfo com.paperclone.game` (after `reset` before Play tap, during active swipe gameplay):**
  - `Total frames rendered: 623` (rendered across `~5.20s`, `mActiveRenderFrameRate=120.00001` display mode)
  - `Janky frames: 2 (0.32%)` — **PASS** (`< 2.0%` gate)
  - `50th / 90th / 95th / 99th percentile`: `15ms / 18ms / 19ms / 20ms`
  - `50th / 90th / 95th / 99th gpu percentile`: `8ms / 12ms / 13ms / 15ms`
  - `Number Missed Vsync: 0`, `Number Slow bitmap uploads: 0`, `Number Slow UI thread: 1`, `Number Slow issue draw commands: 2`, `Number Frame deadline missed: 2`
- **USB + Wireless Fallback Readiness Check:**
  - Active USB transport: `R5CWA26LE6N device` (`ro.serialno = R5CWA26LE6N`, `ro.product.model = SM-A236E`).
  - `adb mdns check`: `mdns daemon version [adb discovery 0.0.0]`, device Wi-Fi IP `192.168.1.154/24` (`wlan0`), `adb_wifi_enabled = 0` (currently off while USB tethered; Wi-Fi TLS mDNS auto-fallback rule verified intact in `.agent/rules/android-device.md`).
