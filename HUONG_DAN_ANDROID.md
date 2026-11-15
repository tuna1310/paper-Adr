# Hướng Dẫn Build, Cài Đặt & Kiểm Thử Trên Điện Thoại Android

Tài liệu dành cho Product Owner (PO) và các thành viên nhóm phát triển để build APK, chạy Live Reload, cài `builds/app-debug.apk`, chụp ảnh màn hình thật và xử lý lỗi kết nối ADB trên máy Windows với thiết bị mục tiêu **Samsung Galaxy A23 5G (`SM_A236E`, serial `R5CWA26LE6N`)**.

---

## 1. Cấu hình môi trường trên máy Windows

Các đường dẫn đã kiểm tra sẵn trên máy này:
- **Node.js / npm**: `node v24.20.0`, `npm 11.19.0`
- **JDK 21 (bắt buộc cho Capacitor 8 / Gradle 8.14 / AGP 8.13)**: `C:\Users\Admin\.jdks\jbr-21.0.11`
  - File `android/gradle.properties` đã cấu hình sẵn `org.gradle.java.home=C:\\Users\\Admin\\.jdks\\jbr-21.0.11`.
  - Khi chạy lệnh từ terminal PowerShell, vẫn nên export `JAVA_HOME` để tránh xung đột với JDK 17 mặc định của hệ thống.
- **Android SDK & ADB**: `C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe`

Thiết lập biến môi trường nhanh cho phiên PowerShell hiện tại:

```powershell
$env:JAVA_HOME = "C:\Users\Admin\.jdks\jbr-21.0.11"
$env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"
$adb = "$env:ANDROID_HOME\platform-tools\adb.exe"
```

---

## 2. Bật USB Debugging & Gỡ lỗi không dây trên Samsung Galaxy A23 5G (`SM_A236E`)

1. Trên điện thoại, vào **Cài đặt (Settings) → Thông tin điện thoại (About phone) → Thông tin phần mềm (Software information)**.
2. Chạm liên tục **7 lần** vào **Số hiệu bản tạo (Build number)** để mở **Cài đặt cho người phát triển (Developer options)**.
3. Vào **Cài đặt → Cài đặt cho người phát triển**:
   - Bật **Gỡ lỗi USB (USB debugging)**.
   - (Khuyên dùng thêm) Bật **Gỡ lỗi không dây (Wireless debugging)** và đảm bảo điện thoại dùng **cùng mạng Wi-Fi** với PC.
   - Bật **Luôn bật màn hình khi sạc (Stay awake)** để điện thoại không khóa màn hình khi test.
4. Cắm cáp USB truyền dữ liệu (không dùng cáp chỉ sạc):
   - Khi bảng **"Cho phép gỡ lỗi USB? (Allow USB debugging?)"** hiện ra, tích **"Luôn cho phép từ máy tính này (Always allow from this computer)"** rồi bấm **Cho phép (Allow)**.
   - Kiểm tra chế độ USB trên thanh thông báo: chọn **Truyền tệp / Android Auto (Transferring files)** thay vì *Chỉ sạc*.

Kiểm tra kết nối từ PC:

```powershell
& $adb start-server
Start-Sleep -Seconds 2
& $adb devices -l
```

Kết quả đạt chuẩn phải có trạng thái **`device`** (ví dụ `R5CWA26LE6N ... device` hoặc entry wireless `adb-R5CWA26LE6N-..._adb-tls-connect._tcp device model:SM_A236E`).

---

## 3. Build APK & Cài `builds/app-debug.apk` lên điện thoại

### Cách 1: Build đầy đủ từ source (Web → Capacitor → APK)

Chạy trong thư mục project (ví dụ `.worktrees\b-android` hoặc thư mục gốc sau khi merge):

```powershell
$env:JAVA_HOME = "C:\Users\Admin\.jdks\jbr-21.0.11"
$env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"

npm test
npm run build
npx cap sync android
.\android\gradlew.bat -p android assembleDebug --no-daemon

New-Item -ItemType Directory -Force -Path builds | Out-Null
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "builds\app-debug.apk" -Force
```

*(Hoặc dùng script rút gọn trong `package.json`: `npm run android:build`)*

### Cách 2: Cài trực tiếp file `builds/app-debug.apk` có sẵn

Thay `<DEVICE_ID>` bằng ID đang có trạng thái `device` trong `adb devices -l` (ưu tiên `R5CWA26LE6N`; nếu USB đang `offline` mà Wireless Debugging đang `device` thì dùng ID wireless như `192.168.1.154:46773` hoặc `adb-R5CWA26LE6N-..._adb-tls-connect._tcp`):

```powershell
$adb = "C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$device = "R5CWA26LE6N" # đổi sang ID wireless nếu USB offline

& $adb -s $device install -r "builds\app-debug.apk"
& $adb -s $device shell input keyevent KEYCODE_WAKEUP
& $adb -s $device shell am force-stop com.paperclone.game
& $adb -s $device shell am start -W -n com.paperclone.game/.MainActivity
```

Kiểm tra app đang chạy & xem log lỗi WebView/JS (nếu có):

```powershell
& $adb -s $device shell pidof com.paperclone.game
& $adb -s $device logcat -d -v time *:E Capacitor:D SystemBars:D chromium:I | Select-Object -Last 50
```

---

## 4. Chạy Live Reload (Sửa UI thấy ngay trên điện thoại)

1. Đảm bảo PC và điện thoại kết nối **cùng mạng Wi-Fi**.
2. Kiểm tra Windows Firewall không chặn cổng **5173** (Vite dev server).
3. Chạy lệnh Live Reload:

```powershell
$env:JAVA_HOME = "C:\Users\Admin\.jdks\jbr-21.0.11"
$env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"
npm run android:live
# Hoặc chỉ rõ thiết bị khi có nhiều entry trong adb devices:
npx cap run android -l --external --target R5CWA26LE6N
```

4. **Lưu ý quan trọng sau khi dùng Live Reload:** Live Reload gắn IP dev server (`http://<IP>:5173`) vào `android/app/src/main/assets/capacitor.config.json`. Trước khi gửi file APK chạy độc lập cho người khác, **bắt buộc** chạy lại `npm run build && npx cap sync android` và build lại `builds/app-debug.apk`.

---

## 5. Chụp ảnh màn hình điện thoại chuẩn PNG (Tránh lỗi PowerShell!)

> ⚠️ **Cảnh báo quan trọng trên Windows PowerShell 5.1:**
> **KHÔNG** chạy `& $adb exec-out screencap -p > screenshots\ten_anh.png` trực tiếp trong PowerShell! Toán tử `>` của PowerShell tự chuyển stdout sang text UTF-16LE và đổi `\n` thành `\r\n`, làm **hỏng hoàn toàn file PNG** (không mở được).

Dùng một trong 2 cách chuẩn bên dưới:

### Cách A (Khuyên dùng — gọi `cmd /c` ghi nhị phân nguyên vẹn):
```powershell
New-Item -ItemType Directory -Force -Path screenshots | Out-Null
cmd /c "`"C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe`" -s $device exec-out screencap -p > screenshots\device_screen.png"
```

### Cách B (Chụp vào máy rồi `adb pull` về PC):
```powershell
& $adb -s $device shell screencap -p /sdcard/tmp_screen.png
& $adb -s $device pull /sdcard/tmp_screen.png screenshots\device_screen.png
& $adb -s $device shell rm /sdcard/tmp_screen.png
```

Kiểm tra nhanh file PNG hợp lệ & kích thước pixel (kỳ vọng `1080 x 2408` trên `SM_A236E`):
```powershell
node -e "const fs = require('fs'); const b = fs.readFileSync('screenshots/device_screen.png'); console.log({ bytes: b.length, validPng: b.subarray(0,8).toString('hex') === '89504e470d0a1a0a', width: b.readUInt32BE(16), height: b.readUInt32BE(20) });"
```

---

## 6. Xử lý sự cố khi thiết bị `offline`, `unauthorized` hoặc không thấy máy

> ⛔ **Nguyên tắc bắt buộc:** Nếu `adb devices -l` trống, `offline` toàn bộ hoặc `unauthorized`, **DỪNG** các bước cài APK và xử lý kết nối theo từng trường hợp dưới đây trước khi chạy tiếp.

### Trường hợp A: `unauthorized` (Chưa cấp quyền RSA cho PC)
1. Mở khóa màn hình điện thoại — hộp thoại **"Cho phép gỡ lỗi USB?"** đang chờ bấm **Cho phép**.
2. Nếu không thấy hộp thoại hiện lên:
   - Vào **Developer options** → bấm **Thu hồi ủy quyền gỡ lỗi USB (Revoke USB debugging authorizations)**.
   - Tắt rồi bật lại **USB debugging**.
   - Trên PC chạy:
     ```powershell
     & $adb kill-server
     & $adb start-server
     & $adb devices -l
     ```
   - Rút cáp cắm lại, chọn **Always allow from this computer → Allow**.
3. Lưu ý khóa ADB trên Windows: khóa RSA đang nằm tại `C:\Users\Admin\.android\adbkey` (ngay cả khi `ANDROID_USER_HOME=D:\.android` được thiết lập). Không xóa thư mục `.android` khi đang debug.

### Trường hợp B: `offline` (USB `R5CWA26LE6N offline` hoặc mDNS `offline`)
1. **Kiểm tra xem có transport khác của cùng máy đang `device` không:**
   - Chạy `& $adb devices -l` và `& $adb mdns services`.
   - Đôi khi USB `R5CWA26LE6N` báo `offline` do lỏng cáp/sập cổng USB trong lúc **Wireless Debugging** (`adb-R5CWA26LE6N-..._adb-tls-connect._tcp` hoặc `<IP>:<PORT>`) vẫn ở trạng thái `device`.
   - Nếu `adb mdns services` hiện `<IP>:<PORT>` (ví dụ `192.168.1.154:46773`), chạy `& $adb connect <IP>:<PORT>` rồi xác nhận bằng `& $adb -s <IP>:<PORT> shell getprop ro.serialno` (phải trả về `R5CWA26LE6N`).
2. **Nếu muốn khôi phục kết nối USB `R5CWA26LE6N` về `device`:**
   - Mở khóa điện thoại, đổi chế độ USB sang **Truyền tệp (MTP)** nếu đang ở *Chỉ sạc*.
   - Rút cáp USB và cắm vào cổng USB khác (ưu tiên cổng USB 3.0 trực tiếp trên mainboard, tránh hub chia cổng).
   - Trên điện thoại: tắt và bật lại công tắc **USB debugging**.
   - Trên PC reset ADB server:
     ```powershell
     & $adb kill-server
     Start-Sleep -Seconds 1
     & $adb start-server
     Start-Sleep -Seconds 2
     & $adb devices -l
     ```
3. **Nếu có nhiều dòng trong `adb devices` (ví dụ 1 `offline` + 1 `device`):**
   - Luôn truyền `-s <ID_của_dòng_device>` vào mọi lệnh `adb` (hoặc `--target <ID>` cho `npx cap run android`). Không chạy `adb install` khi chưa chỉ định `-s`.

### Trường hợp C: Không hiện thiết bị nào (`List of devices attached` trống)
1. Kiểm tra Device Manager xem đã nhận **SAMSUNG Android ADB Interface** chưa (nếu có dấu chấm than vàng, cài lại Samsung USB Driver).
2. Thử cáp USB-C khác (nhiều dây sạc giá rẻ chỉ có dây nguồn, không có dây dữ liệu D+/D-).
3. Nếu dùng Wireless Debugging mà chưa ghép nối lần nào:
   - Trên điện thoại vào **Developer options → Wireless debugging → Pair device with pairing code**.
   - Trên PC chạy `& $adb pair <IP>:<PAIR_PORT>`, nhập mã 6 số, sau đó `& $adb connect <IP>:<CONNECT_PORT>`.

### Trường hợp D: Lỗi Gradle `Unable to delete directory ... node_modules\@capacitor\android\capacitor\build`
- Nguyên nhân trên Windows: thư mục `node_modules` nằm trong OneDrive hoặc bị lock từ build cũ.
- Repo đã khắc phục trong `android/build.gradle` bằng cách cô lập `buildDirectory` của các module Capacitor bên ngoài về `android/build/subprojects/`. Luôn giữ cấu hình này và truyền `--no-daemon` khi build từ script tự động trên Windows.
