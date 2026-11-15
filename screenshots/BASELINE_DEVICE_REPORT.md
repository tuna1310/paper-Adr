# Baseline Device Verification Report (`SM_A236E` / `R5CWA26LE6N`)

- **Branch:** `b-android`
- **APK:** `builds/app-debug.apk` (`4,323,152` bytes)
- **Screenshot:** `screenshots/baseline_device_home.png` (`1080 x 2408`, `523,651` bytes, valid PNG `89504e470d0a1a0a`)
- **Target Device:** Samsung Galaxy A23 5G (`SM-A236E`, `ro.serialno = R5CWA26LE6N`, Android 14 / SDK 34)
- **ADB Transport Used:** `192.168.1.154:46773` (`adb-R5CWA26LE6N-75yntR._adb-tls-connect._tcp` Wireless TLS Debugging — USB `R5CWA26LE6N` transport reported `offline`)
- **WebView Engine:** `com.google.android.webview` `156.0.8078.47`

## Visual Comparison: Prior Baseline vs Current `b-android` Build

| Aspect | Prior `phone_real_app.png` | Reference (`screen_home_1.png`) | Current `screenshots/baseline_device_home.png` |
|---|---|---|---|
| Fullscreen / System Bars | Solid white status bar + white gesture bar | Full-bleed edge-to-edge | **Full-bleed `1080x2408` edge-to-edge** (`StatusBar` & `NavigationBar0` `isVisible=false`) |
| Notch / Display Cutout | Blocked below status bar | Content clears top edge | `LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS` + `SystemBars` `css` passthrough; top HUD sits cleanly below `65px` (`23.11dp`) cutout via `env(safe-area-inset-top)` |
| App Label | `Paper.io 2` | — | `Paper Territory` (`com.paperclone.game`) |
| Bottom Dock | Crowded above white nav bar | Flush near bottom edge | Flush at bottom edge with clean icon spacing |

## Device Metrics & Runtime Notes

- **Display:** `1080x2408`, `450 dpi` (`dpr = 2.8125`, `384 x 856.18 dp`), `120 Hz` override refresh mode (`120.00001 fps` / `60.000004 fps` supported), top cutout `[454, 0 - 626, 65]`.
- **Cold Launch Time (`am start -W`):** `1869 ms` (`TotalTime`).
- **Frame Timing (`dumpsys gfxinfo com.paperclone.game`, 2065 frames):**
  - 50th percentile: `16 ms` (GPU `5 ms`)
  - 90th percentile: `20 ms` (GPU `8 ms`)
  - 95th percentile: `24 ms` (GPU `9 ms`)
  - 99th percentile: `40 ms` (GPU `13 ms`)
  - Janky frames: `83 (4.02%)` (mostly cold startup traversal/font load `Skipped 33 frames!`)
- **Capacitor Plugins Loaded:** `CapacitorCookies`, `WebView`, `CapacitorHttp`, `SystemBars`, `Haptics`, `Preferences` (zero plugin registration errors).
- **Audio / Haptics / Touch:**
  - `Bridge.java` keeps `setMediaPlaybackRequiresUserGesture(false)`; WebView initialized `audioHardwareBufferSize = 192` cleanly.
  - `VIBRATE` permission present in `AndroidManifest.xml`, `Haptics` plugin registered (`src/` does not invoke `@capacitor/haptics` or `@capacitor/preferences` yet).
  - `touch-action: none` active across viewport.
- **Cross-Stream Bug Observed in `logcat` (for Stream A — `src/` not modified by Stream B):**
  - During live gameplay touch interaction on the prior build/launch, `logcat` captured:
    `E/Capacitor: JavaScript Error: {"type":"js.error","error":{"message":"Uncaught TypeError: this.renderJoystick360 is not a function","url":"https://localhost/assets/index-Dpbwl6U4.js","line":643,"col":8168}}`
  - No JS errors occurred on cold launch to the Home Screen (`screenshots/baseline_device_home.png`).
