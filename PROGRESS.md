# PROGRESS.md — Tiến độ 3 Luồng Song Song (A / B / C)

*Cập nhật lần cuối: 2026-11-15 23:05 (GMT+7)*

## Tổng quan trạng thái

| Luồng | Nhánh Git | Trạng thái | Công việc hiện tại | Đã xong | Bị chặn / Điểm chờ PO | Cài máy thật (`R5CWA26LE6N` / `SM_A236E`) |
|---|---|---|---|---|---|---|
| **LUỒNG A** (Kiểm toán, UI, HUD, Luật chơi) | `a-ui` | 🔄 **Xong Màn 2 trên Chrome — Chuyển Luồng B test máy thật** | Đã hoàn tất **Màn 2 (`NavFrame` + `HomeScreen` + `FloatingIsland3D`)**, sai số `< 1%` so với `0038.png` ở cả `390×844` & `360×800`; bàn giao Luồng B build/chụp/đo jank trên `SM_A236E` trước khi dừng xin duyệt Màn 2 | - Commit `511a4b8`..`67c7b4f`: `FIDELITY_AUDIT.md`, P0, **Màn 1 (`Loading + Design Tokens`)**, dọn đĩa<br>- **Màn 2 (`NavFrame` + `HomeScreen` + `FloatingIsland3D`)**: tái cấu trúc `NAV_THEME`, bỏ chi tiết thừa (`1n 14g`, `Dưa Hấu`, `Bắt đầu x5`), thêm watermark bản đồ + hào quang `#4DF3E0` + nút Tủ đồ `3g 43p` + `KHÔNG CÓ QUẢNG CÁO` + popup `CÀI ĐẶT` + toast đăng nhập + spotlight active tab + **`15 files / 50 tests passed`**, Chrome `< 1%` sai lệch (`audit_comparisons/m2_home_vs_video.png`) | Chờ kết quả cài & đo máy thật **Màn 2** từ Luồng B rồi dừng xin PO duyệt Màn 2 | ⏳ Đang chuyển Luồng B build & xác minh Màn 2 trên `R5CWA26LE6N` |
| **LUỒNG B** (Android, Capacitor & ADB Device) | `b-android` | 🔄 **Chuẩn bị gộp `a-ui` cho Màn 2** | Nhận bàn giao Màn 2 từ Luồng A: merge `a-ui`, build `builds/app-debug.apk`, cài `SM_A236E`, chụp `m2_device_home.png` + `m2_device_vs_video.png`, đo `logcat` & `dumpsys gfxinfo` (`< 2%` jank) | - Đã xong M1 + P0 trên `SM_A236E` (`R5CWA26LE6N`, `0.32%` jank, `2eacea1`) | Không bị chặn | 🔄 Sẵn sàng build/install Màn 2 lên `R5CWA26LE6N` |
| **LUỒNG C** (Bộ sinh 100 Skin & Carousel) | `c-skins` (`.worktrees/c-skins`) | 🟢 **Hoàn tất Phase 2 Carousel & Sẵn sàng ghép** | Giữ ổn định trên `c-skins` tới mốc Màn 6 (Anh hùng) | - `b508619`: 100 skins + Carousel khớp `0128.png` + `DEFAULT_UNLOCKED_SKIN_IDS` (`14/67`) + rương/thành tựu, **12 files / 51 tests passed** | Không bị chặn *(gộp sau Màn 6 theo chỉ đạo PO)* | Sẽ gộp & build máy thật ở mốc Anh hùng / Cửa hàng |

---

## Lịch sử mốc đã kiểm chứng
1. **21:20** — Tách 3 nhánh & 3 worktree cô lập từ commit gốc `23c9281`.
2. **21:38** — **Luồng A** hoàn tất Bước 0 ([FIDELITY_AUDIT.md](./FIDELITY_AUDIT.md), 15 ảnh đối chiếu, commit `511a4b8`).
3. **21:46** — **Luồng B** hoàn tất thiết lập Android baseline (`17c1079`, `0486916`), chạy fullscreen trên `SM_A236E`, gộp qua `main` (`e9f3843`).
4. **21:47** — **Luồng C** hoàn tất bộ 100 skin gốc + carousel (`f20519b`, `f756ca6`, `ded1642`).
5. **21:55** — PO duyệt `FIDELITY_AUDIT.md` & 4 quyết định sản phẩm; **Luồng A** sửa xong P0 `renderJoystick360` + bỏ `|| true` (`59f30b6`), **Luồng C** hoàn tất polish băng chuyền & API rương/cổ điển (`b508619`), **Luồng B** build APK P0 (`c95b396`).
6. **22:07** — **Luồng A** hoàn tất & commit **Màn 1 (`LoadingScreen` + `theme.ts` Design Tokens)** (`d961b43`, **14 files / 47 tests passed**).
7. **22:15** — **Luồng B** cài & xác minh cả **Màn 1 + trận P0 thực tế** trên `SM_A236E` (`R5CWA26LE6N`, **`0.32%` jank / `623` frames**, `0` lỗi JS `logcat`), gộp sạch `b-android` vào `main` và `a-ui` (`2eacea1`).
8. **23:05** — **Luồng A** hoàn tất **Màn 2 (`NavFrame` + `HomeScreen` + `FloatingIsland3D`)** trên Chrome (`390×844` & `360×800`, **15 files / 50 tests passed**, sai số bố cục `< 1%` so với `0038.png`), sẵn sàng bàn giao Luồng B xác minh trên `SM_A236E`.
