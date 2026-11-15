# Mandatory Android & Physical Device Verification Rule (`SM_A236E` / `R5CWA26LE6N`)

Every milestone across all streams (**Luồng A / B / C**) MUST pass real Android bundling and physical device verification on the target Samsung Galaxy A23 5G (`SM_A236E`, serial `R5CWA26LE6N`) before being marked complete.

---

## 1. Mandatory Pre-Flight Toolchain & Device Check (No Silent Skipping)

Before running any Android build or deploy step, verify ALL required tools and device state:

```powershell
node -v
npm -v
& "C:\Users\Admin\.jdks\jbr-21.0.11\bin\java.exe" -version
Test-Path "C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$adb = "C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe"
& $adb start-server
Start-Sleep -Seconds 2
& $adb devices -l
```

### Hard Stop Rule on Missing / Offline / Unauthorized Device
- **NEVER silently skip** device installation, launch, or screenshot capture if no authorized `device` transport is present.
- If `adb devices -l` lists **no devices**, or ALL matching transports for `R5CWA26LE6N` show `offline` or `unauthorized`:
  1. **STOP** installation/launch/screenshot steps immediately (do NOT fabricate or reuse old screenshots).
  2. Direct the user to the exact troubleshooting steps in [HUONG_DAN_ANDROID.md](../../HUONG_DAN_ANDROID.md).
  3. Report the exact `adb devices -l` output as a blocker.
- **USB vs Wireless Debugging Multi-Transport Rule:**
  - `adb devices -l` may show both USB (`R5CWA26LE6N`) and Wireless TLS Debugging (`adb-R5CWA26LE6N-*._adb-tls-connect._tcp` or `<ip>:<port>`).
  - Prefer `R5CWA26LE6N` when its state is `device`. If USB `R5CWA26LE6N` is `offline` while the wireless transport for `SM_A236E` is `device`, confirm `adb -s <transport> shell getprop ro.serialno` equals `R5CWA26LE6N`, use `-s <transport>`, and explicitly report which transport (`USB` vs `Wireless TLS`) was used.
  - Always pass `-s <transport>` explicitly to every `adb` command so `adb` never fails with `more than one device/emulator`.
- **Windows Job Object / ADB Server Note:**
  - In isolated subshells on Windows, an `adb` server spawned by `adb devices` may be terminated when the shell exits, resetting WinUSB/mDNS discovery. Keep `adb nodaemon server` running for multi-step sessions or call `adb start-server` + wait ~2s inside the command block before `adb devices -l`.

---

## 2. Mandatory Build, Sync & APK Pipeline

Run from the active worktree root (with `$env:JAVA_HOME = "C:\Users\Admin\.jdks\jbr-21.0.11"` and `$env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"`):

1. **Unit tests:**
   ```powershell
   npm test
   ```
2. **Production web bundle (measure build seconds):**
   ```powershell
   $tBuild = Measure-Command { npm run build | Out-Host }
   ```
3. **Capacitor Android sync:**
   ```powershell
   npx cap sync android
   ```
   - Note: Inside `.worktrees/<branch>`, `node_modules` is an NTFS junction to the root repo, so `npx cap sync android` rewrites `android/capacitor.settings.gradle` to `../../../node_modules/...`. Restore `android/capacitor.settings.gradle` (`../node_modules/...`, which resolves in both the worktree via junction and `main`) and whitespace-only CRLF churn on `android/app/capacitor.build.gradle` before committing if targeting `main`, or re-run `npx cap sync android` on `main` after merge.
   - `android/build.gradle` redirects external Capacitor library subprojects (`:capacitor-android`, `:capacitor-haptics`, `:capacitor-preferences`) into `android/build/subprojects/` to avoid stale `ReadOnly` directory locks or OneDrive sync conflicts inside the shared root `node_modules/`.
4. **Build Debug APK & export to `builds/app-debug.apk`:**
   ```powershell
   $env:JAVA_HOME = "C:\Users\Admin\.jdks\jbr-21.0.11"
   $env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"
   $tGradle = Measure-Command { & ".\android\gradlew.bat" -p android assembleDebug --no-daemon | Out-Host }
   New-Item -ItemType Directory -Force -Path builds | Out-Null
   Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "builds\app-debug.apk" -Force
   ```

---

## 3. Install, Cold Launch & Runtime Verification

```powershell
$adb = "C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$target = "<verified_device_transport>" # R5CWA26LE6N or verified SM_A236E wireless transport

& $adb -s $target install -r "builds\app-debug.apk"
& $adb -s $target logcat -c
& $adb -s $target shell input keyevent KEYCODE_WAKEUP
& $adb -s $target shell am force-stop com.paperclone.game
& $adb -s $target shell am start -W -n com.paperclone.game/.MainActivity
Start-Sleep -Seconds 3
```

Always verify and record:
- **Process & Window Focus:**
  - `adb -s $target shell pidof com.paperclone.game` (non-empty PID)
  - `adb -s $target shell "dumpsys window displays | grep -E 'mCurrentFocus|mFocusedApp'"` (`com.paperclone.game/.MainActivity`)
  - Immersive check: confirm `StatusBar` and `NavigationBar0` report `isVisible=false`.
- **Logcat Error Audit:**
  - `adb -s $target logcat -d -v time *:E Capacitor:D SystemBars:D chromium:I`
  - Inspect for `Capacitor` `JavaScript Error`, missing asset 404s, WebView/WebAudio issues, or plugin failures.
- **Frame Timing / GPU Metrics:**
  - `adb -s $target shell "dumpsys gfxinfo com.paperclone.game"` (capture 50th/90th/95th/99th frame & GPU percentiles and janky frame %).

---

## 4. Clean Binary PNG Screenshot Capture (Windows PowerShell Caveat)

> **CRITICAL:** NEVER run `adb exec-out screencap -p > screenshots\out.png` directly inside Windows PowerShell 5.1. PowerShell's `>` operator decodes stdout as text and corrupts binary PNG files (UTF-16LE / CRLF mangling).

Use **either** `cmd /c` raw binary redirection **or** `adb pull`:

```powershell
New-Item -ItemType Directory -Force -Path screenshots | Out-Null
# Option A: raw binary redirection via cmd.exe
cmd /c "`"$adb`" -s $target exec-out screencap -p > screenshots\milestone_device.png"

# Option B: on-device capture + binary pull (immune to shell encoding)
# & $adb -s $target shell screencap -p /sdcard/cap_tmp.png
# & $adb -s $target pull /sdcard/cap_tmp.png screenshots\milestone_device.png
# & $adb -s $target shell rm /sdcard/cap_tmp.png
```

Always validate the PNG signature and pixel dimensions before inspecting visually:

```powershell
node -e "const fs = require('fs'); const b = fs.readFileSync('screenshots/milestone_device.png'); console.log({ bytes: b.length, sig: b.subarray(0,8).toString('hex'), valid: b.subarray(0,8).toString('hex') === '89504e470d0a1a0a', w: b.readUInt32BE(16), h: b.readUInt32BE(20) });"
```

Then visually inspect the PNG file directly to check:
- **Notch / Safe Area:** Samsung `SM_A236E` has a `65px` (`23.11dp`) top waterdrop `DisplayCutout`. Top HUD controls must sit cleanly below it via `env(safe-area-inset-top)`.
- **Immersive Fullscreen:** Full `1080x2408` edge-to-edge canvas with no solid white/black status or navigation bar strips.
- **Touch / Audio / Haptics:** Confirm `touch-action: none`, Web Audio unlock/buffer initialization, and `@capacitor/haptics` (`VIBRATE`) behavior when testing interactive flows.

---

## 5. Live Reload Workflow (Rapid UI/Gameplay Iteration)

During active UI/skin development, run Vite dev server + Capacitor live reload on the same Wi-Fi LAN (`vite.config.ts` already sets `host: true`, port `5173`):

```powershell
$env:JAVA_HOME = "C:\Users\Admin\.jdks\jbr-21.0.11"
$env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"
npx cap run android -l --external
# Or specify explicit target:
# npx cap run android -l --external --target <device_id>
```

- Ensure Windows Firewall allows Node/Vite TCP port `5173` on Private Wi-Fi.
- **Important:** `npx cap run android -l` temporarily writes `server.url` into `android/app/src/main/assets/capacitor.config.json`. Always run a clean `npm run android:build` (or `npx cap sync android` + `gradlew.bat assembleDebug`) after live-reload testing so `builds/app-debug.apk` bundles offline `dist/` assets rather than a LAN dev URL.
