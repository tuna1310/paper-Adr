# PROGRESS.md — Tiến độ 3 Luồng Song Song (A / B / C)

*Cập nhật lần cuối: 2026-11-15 22:15 (GMT+7)*

## Tổng quan trạng thái

| Luồng | Nhánh Git | Trạng thái | Công việc hiện tại | Đã xong | Bị chặn / Điểm chờ PO | Cài máy thật (`R5CWA26LE6N` / `SM_A236E`) |
|---|---|---|---|---|---|---|
| **LUỒNG A** (Kiểm toán, UI, HUD, Luật chơi) | `a-ui` | ⏸️ **Hoàn tất P0 + Màn 1 — Chờ PO duyệt để làm Màn 2** | Đã ghép ảnh thật `SM_A236E` & Chrome `390×844` cạnh khung video `0018.png`, dừng theo quy trình chờ PO duyệt Màn 1 trước khi dựng **Màn 2 (Màn Nhà + NavFrame)** | - Commit `511a4b8`: `FIDELITY_AUDIT.md`, 15 ảnh đối chiếu, `10 files / 40 tests`<br>- Commit `59f30b6`: Sửa P0 `renderJoystick360` + bỏ `|| true` `WorldScreen.ts` (`src/meta/continentUnlock.ts`), `DECISIONS.md`, `12 files / 43 tests`<br>- Commit `d961b43`: **Màn 1 (`Loading + Design Tokens`)** — `src/ui/theme.ts` (27 hạng + `#HEX` + `%W/%H`), `src/ui/screens/LoadingScreen.ts`, font local `@fontsource`, favicon inline SVG, **14 files / 47 tests passed**, Chrome `390×844` (`audit_comparisons/m1_loading_vs_video.png`, `0` lỗi) | Chờ PO duyệt **Màn 1** + xác nhận chuyển sang **Màn 2 (Màn Nhà + NavFrame)** | ✅ Đã cài & xác minh thực tế trên `R5CWA26LE6N` (`0` lỗi JS `logcat`, `0.32%` jank) |
| **LUỒNG B** (Android, Capacitor & ADB Device) | `b-android` (đã gộp vào `main` & `a-ui` ở `2eacea1`) | 🟢 **Hoàn tất M1 + Xác minh P0 trên máy thật** | Sẵn sàng lặp lại quy trình build/install/gfxinfo ngay khi Luồng A hoàn thành Màn 2 | - Commit `c95b396`: Cập nhật `.agent/rules/android-device.md`, `HUONG_DAN_ANDROID.md`, `AndroidManifest.xml` (`hardwareAccelerated`, `largeHeap`), `MainActivity.java`<br>- Commit `2eacea1`: Build `builds/app-debug.apk` (`4,378,399` bytes), cài USB lên `SM_A236E` (`R5CWA26LE6N`), chụp `screenshots/m1_device_loading.png` (`1080×2408`), ghép `screenshots/m1_device_vs_video.png` (`2209×2408`), vào trận test joystick (`screenshots/p0_device_gameplay.png`), viết `screenshots/M1_P0_VERIFICATION_REPORT.md`<br>- Gộp sạch `b-android` vào `main` và `a-ui` (`2eacea1`) | Không bị chặn *(USB `R5CWA26LE6N device` ổn định; Wi-Fi IP `192.168.1.154`, sẵn auto-fallback theo `.agent/rules/android-device.md`)* | ✅ **COLD `1472ms` (gameplay) / `1825ms` (M1)**, fullscreen `[0,0,1080,2408]`, **`623` frames / `2` jank (`0.32%` < `2%`)**, `0` lỗi JS `logcat` |
| **LUỒNG C** (Bộ sinh 100 Skin & Carousel) | `c-skins` (`.worktrees/c-skins`) | 🟢 **Hoàn tất Phase 2 Carousel & Sẵn sàng ghép** | Đã tối ưu cache & chuẩn bị API rương/thành tựu chờ Luồng A hoàn thành màn Anh hùng (Màn 6) | - Commit `f20519b`, `f756ca6`, `ded1642`: 100 skins + Carousel + API<br>- Commit `301c6d4`, `cc66fc5`, `b508619`: Tinh chỉnh băng chuyền khớp `0128.png` (ẩn `<`, `1/100`, badge rarity), thêm `DEFAULT_UNLOCKED_SKIN_IDS` (`14/67`), thành tựu `powerups` (`30/60/120`), `warmupSkinSpriteCache()`, `rollChestSkinDrop()`, **12 files / 51 tests passed** trên `c-skins` | Không bị chặn *(giữ nguyên trên `c-skins` tới khi Luồng A xong màn Anh hùng theo chỉ đạo PO)* | Sẽ gộp & build máy thật cùng Luồng A ở mốc Anh hùng / Cửa hàng |

---

## Lịch sử mốc đã kiểm chứng
1. **21:20** — Tách 3 nhánh & 3 worktree cô lập từ commit gốc `23c9281`.
2. **21:38** — **Luồng A** hoàn tất Bước 0 ([FIDELITY_AUDIT.md](./FIDELITY_AUDIT.md), 15 ảnh đối chiếu, commit `511a4b8`).
3. **21:46** — **Luồng B** hoàn tất thiết lập Android baseline (`17c1079`, `0486916`), chạy fullscreen trên `SM_A236E`, gộp qua `main` (`e9f3843`).
4. **21:47** — **Luồng C** hoàn tất bộ 100 skin gốc + carousel (`f20519b`, `f756ca6`, `ded1642`).
5. **21:55** — PO duyệt `FIDELITY_AUDIT.md` & 4 quyết định sản phẩm; **Luồng A** sửa xong P0 `renderJoystick360` + bỏ `|| true` (`59f30b6`), **Luồng C** hoàn tất polish băng chuyền & API rương/cổ điển (`b508619`), **Luồng B** build APK P0 (`c95b396`).
6. **22:07** — **Luồng A** hoàn tất & commit **Màn 1 (`LoadingScreen` + `theme.ts` Design Tokens)** (`d961b43`, **14 files / 47 tests passed**).
7. **22:15** — **Luồng B** cài & xác minh cả **Màn 1 + trận P0 thực tế** trên `SM_A236E` (`R5CWA26LE6N`, **`0.32%` jank / `623` frames**, `0` lỗi JS `logcat`), gộp sạch `b-android` vào `main` và `a-ui` (`2eacea1`). Dừng chờ PO duyệt **Màn 1**.
