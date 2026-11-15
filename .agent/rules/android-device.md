# Mandatory Android & Physical Device Verification Rule (`SM_A236E` / `R5CWA26LE6N`)

Every milestone across all streams (**Luồng A / B / C**) MUST pass real Android bundling and physical device verification on the target Samsung Galaxy A23 5G (`SM_A236E`, serial `R5CWA26LE6N`) before being marked complete.

---

## 1. Mandatory Pre-Flight Toolchain & Transport Selection (USB First -> Wi-Fi TLS Fallback)

Before running any Android build or deploy step, verify ALL required tools and select the active device transport automatically:

```powershell
node -v
npm -v
& "C:\Users\Admin\.jdks\jbr-21.0.11\bin\java.exe" -version
$adb = "C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe"
Test-Path $adb
& $adb start-server
Start-Sleep -Seconds 3
& $adb devices -l
& $adb mdns services
```

### Automatic Transport Resolution Order (`USB R5CWA26LE6N` -> `Wi-Fi TLS SM_A236E`)
1. **Priority 1 — USB Transport (`R5CWA26LE6N`):**
   - Check `adb devices -l` for `^R5CWA26LE6N\s+device\b`. If online, use `-s R5CWA26LE6N`.
2. **Priority 2 — Wi-Fi TLS Debugging Fallback (`SM_A236E`, `ro.serialno = R5CWA26LE6N`):**
   - If USB `R5CWA26LE6N` is `offline` or missing:
     - Check `adb devices -l` for any wireless `device` entry (`adb-R5CWA26LE6N-*._adb-tls-connect._tcp` or `<ip>:<port>.*model:SM_A236E`).
     - If none is connected yet, check `adb mdns services` for `adb-R5CWA26LE6N-.*_adb-tls-connect._tcp` (`<ip>:<port>`) and run `adb connect <ip>:<port>`.
     - Confirm identity before deploying: `(& $adb -s $candidate shell getprop ro.serialno).Trim() -eq "R5CWA26LE6N"`.
3. **Hard Stop Rule on Missing / Offline / Unauthorized Device:**
   - **NEVER silently skip** device installation, gameplay launch, FPS/jank measurement, or screenshot capture if neither USB `R5CWA26LE6N` nor verified Wi-Fi TLS `SM_A236E` is in `device` state.
   - If NO valid `device` transport exists (empty `adb devices -l`, or all entries `offline`/`unauthorized`):
     1. **STOP** installation, gameplay test, and screenshot steps immediately (do NOT fabricate or reuse old screenshots/metrics).
     2. Direct the user to the exact troubleshooting steps in [HUONG_DAN_ANDROID.md](../../HUONG_DAN_ANDROID.md).
     3. Report exact `adb devices -l` / `adb mdns services` / USB PnP status as a hard blocker.
- **Multi-Transport Safety:** Always pass `-s $target` explicitly to every `adb` command so `adb` never fails when both an `offline` USB entry and a `device` Wi-Fi TLS entry exist.
- **Windows Job Object / ADB Server Note:** In transient Windows subshells, `adb` servers spawned inside a single command may terminate when the shell exits. Keep `adb nodaemon server` running during multi-step sessions or call `adb start-server` + `Start-Sleep -Seconds 3` inside the command block.

---

## 2. Mandatory Build, Sync & APK Pipeline

Run from the active worktree root (`$env:JAVA_HOME = "C:\Users\Admin\.jdks\jbr-21.0.11"`, `$env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"`):

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
   - Inside `.worktrees/<branch>`, `node_modules` is an NTFS junction, so `npx cap sync android` rewrites `android/capacitor.settings.gradle` to `../../../node_modules/...`. Restore `android/capacitor.settings.gradle` (`../node_modules/...`, valid in both worktree junction and `main`) and whitespace-only CRLF churn on `android/app/capacitor.build.gradle` before committing.
   - `android/build.gradle` isolates external Capacitor library `layout.buildDirectory` into `android/build/subprojects/` to avoid stale `ReadOnly` locks inside shared root `node_modules/`.
4. **Build Debug APK & export to `builds/app-debug.apk`:**
   ```powershell
   $env:JAVA_HOME = "C:\Users\Admin\.jdks\jbr-21.0.11"
   $env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"
   $tGradle = Measure-Command { & ".\android\gradlew.bat" -p android assembleDebug --no-daemon | Out-Host }
   New-Item -ItemType Directory -Force -Path builds | Out-Null
   Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "builds\app-debug.apk" -Force
   ```

---

## 3. Install, Live Gameplay Test, 0-JS-Error Check & FPS / Jank < 2% Gate

Every milestone build MUST verify **live gameplay** on `SM_A236E`, not just the home screen:

```powershell
$adb = "C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$target = "<verified_R5CWA26LE6N_or_wifi_tls_target>"

& $adb -s $target install -r "builds\app-debug.apk"
& $adb -s $target logcat -c
& $adb -s $target shell input keyevent KEYCODE_WAKEUP
& $adb -s $target shell am force-stop com.paperclone.game
& $adb -s $target shell am start -W -n com.paperclone.game/.MainActivity
Start-Sleep -Seconds 3

# Reset gfxinfo right before active gameplay so cold-launch frame skips don't skew steady-state jank
& $adb -s $target shell dumpsys gfxinfo com.paperclone.game reset

# Tap Play button (~bottom center on 1080x2408: x=540, y=2140) and steer continuously for 2-3s
& $adb -s $target shell input tap 540 2140
Start-Sleep -Milliseconds 800
& $adb -s $target shell input swipe 540 1500 820 1500 700
& $adb -s $target shell input swipe 540 1500 540 1200 700
& $adb -s $target shell input swipe 540 1500 260 1500 700
& $adb -s $target shell input swipe 540 1500 540 1780 700
```

### Mandatory Post-Gameplay Checks
1. **Zero JavaScript Errors (`logcat`):**
   ```powershell
   & $adb -s $target logcat -d -v time *:E Capacitor:D SystemBars:D chromium:I | Select-String -Pattern "JavaScript Error|Uncaught|TypeError|ReferenceError|FATAL"
   ```
   - Must report **0 JavaScript runtime errors** (e.g., no `renderJoystick360` or uncaught exceptions).
2. **FPS & `dumpsys gfxinfo` Jank Gate (Target: Jank < 2%):**
   ```powershell
   & $adb -s $target shell "dumpsys gfxinfo com.paperclone.game"
   ```
   - Record **Total frames rendered**, **Janky frames + %** (target **`< 2.0%`** steady-state gameplay), **50th / 90th / 95th / 99th frame percentiles**, **GPU percentiles**, and estimated effective FPS (`1000 / 50th_percentile_ms` or SurfaceFlinger refresh vs frame cadence).
   - Confirm `StatusBar` and `NavigationBar0` remain `isVisible=false` (immersive full-bleed `1080x2408`).

---

## 4. Clean Binary PNG Screenshot Capture (Windows PowerShell Caveat)

> **CRITICAL:** NEVER run `adb exec-out screencap -p > screenshots\out.png` directly inside Windows PowerShell 5.1. PowerShell's `>` operator decodes stdout as text and corrupts binary PNG bytes.

Use **`cmd /c`** raw binary redirection (or `adb shell screencap` + `adb pull`):

```powershell
New-Item -ItemType Directory -Force -Path screenshots | Out-Null
cmd /c "`"$adb`" -s $target exec-out screencap -p > screenshots\<name>.png"
```

Validate PNG header + dimensions (`1080 x 2408`) and inspect visually with `read_file`:

```powershell
node -e "const fs = require('fs'); const b = fs.readFileSync('screenshots/<name>.png'); console.log({ bytes: b.length, sig: b.subarray(0,8).toString('hex'), valid: b.subarray(0,8).toString('hex') === '89504e470d0a1a0a', w: b.readUInt32BE(16), h: b.readUInt32BE(20) });"
```

Check visually:
- **Notch / Safe Area:** `SM_A236E` `65px` (`23.11dp`) top `DisplayCutout` is respected via `env(safe-area-inset-top)`.
- **Gameplay Rendering:** Arena boundary, territory blobs, trails, characters, bots, HUD bar, and joystick feedback render cleanly.

---

## 5. Live Reload Workflow

```powershell
$env:JAVA_HOME = "C:\Users\Admin\.jdks\jbr-21.0.11"
$env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"
npx cap run android -l --external
# Or explicit target:
# npx cap run android -l --external --target <device_id>
```

- Ensure Windows Firewall allows port `5173` on Private Wi-Fi.
- Always run `npm run android:build` (or `npm run build && npx cap sync android` + `gradlew.bat assembleDebug`) after live-reload testing so `builds/app-debug.apk` bundles offline `dist/` assets rather than a LAN dev URL.
