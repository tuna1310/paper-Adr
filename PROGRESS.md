# PROGRESS.md — Tiến độ 3 Luồng Song Song (A / B / C)

*Cập nhật lần cuối: 2026-11-15 22:07 (GMT+7)*

## Tổng quan trạng thái

| Luồng | Nhánh Git | Trạng thái | Công việc hiện tại | Đã xong | Bị chặn / Điểm chờ PO | Cài máy thật (`R5CWA26LE6N` / `SM_A236E`) |
|---|---|---|---|---|---|---|
| **LUỒNG A** (Kiểm toán, UI, HUD, Luật chơi) | `a-ui` | 🟡 **Xong P0 + Màn 1 (Chrome verified)** | Chuẩn bị bàn giao Luồng B cài APK Màn 1 & test trận lên máy thật rồi dừng chờ PO duyệt Màn 1 trước khi làm Màn 2 | - Commit `511a4b8`: `FIDELITY_AUDIT.md`, 15 ảnh đối chiếu, `10 files / 40 tests`<br>- Commit `59f30b6`: Sửa P0 `renderJoystick360` + bỏ cờ `|| true` `WorldScreen.ts` (`src/meta/continentUnlock.ts`), `DECISIONS.md`, `12 files / 43 tests`, verify Chrome trận chơi (`0` lỗi)<br>- **Màn 1 (`Loading + Design Tokens`)**: Tạo `src/ui/theme.ts` (27 hạng + tokens `#HEX`), `src/ui/screens/LoadingScreen.ts`, gắn font local `@fontsource`, sửa favicon & eyes path, đạt **14 files / 47 tests passed**, Chrome `390×844` vs `0018.png` (`audit_comparisons/m1_loading_vs_video.png`, `0` lỗi console/page) | Chờ Luồng B xác nhận APK + ảnh máy thật Màn 1 + test trận P0, sau đó dừng chờ PO duyệt Màn 1 để chuyển sang **Màn 2 (Màn Nhà + NavFrame)** | Đang đẩy bản build P0 + Màn 1 sang Luồng B cài & đo jank trên `R5CWA26LE6N` |
| **LUỒNG B** (Android, Capacitor & ADB Device) | `b-android` (`.worktrees/b-android`) | 🟢 **USB ADB đã kết nối lại — Đang cài P0 + Màn 1** | Merge `a-ui` Màn 1, build APK, cài lên `SM_A236E`, test vào trận (xác nhận hết crash P0), chụp Màn 1 + đo FPS/jank (`dumpsys gfxinfo`) | - Commit `17c1079`, `0486916`: Baseline APK & fullscreen `1080×2408` (`1869ms`)<br>- Commit `c95b396`: Cập nhật `.agent/rules/android-device.md` (USB/Wi-Fi fallback, `< 2%` jank), `AndroidManifest.xml` (`hardwareAccelerated`, `largeHeap`), `MainActivity.java`, build APK P0 `4,372,831` bytes | USB `R5CWA26LE6N` đã `device` trở lại lúc 22:06 | Đang chuẩn bị deploy bản P0 + Màn 1 lên `R5CWA26LE6N` |
| **LUỒNG C** (Bộ sinh 100 Skin & Carousel) | `c-skins` (`.worktrees/c-skins`) | 🟢 **Hoàn tất Phase 2 Carousel & Sẵn sàng ghép** | Đã tối ưu cache & chuẩn bị API rương/thành tựu chờ Luồng A hoàn thành màn Anh hùng | - Commit `f20519b`, `f756ca6`, `ded1642`: 100 skins + Carousel + API<br>- Commit `301c6d4`, `cc66fc5`, `b508619`: Tinh chỉnh băng chuyền khớp `0128.png` (ẩn `<`, `1/100`, badge rarity), thêm `DEFAULT_UNLOCKED_SKIN_IDS` (`14/67`), thành tựu `powerups` (`30/60/120`), `warmupSkinSpriteCache()`, `rollChestSkinDrop()`, **12 files / 51 tests passed** trên `c-skins` | Không bị chặn *(giữ nguyên trên `c-skins` tới khi Luồng A xong màn Anh hùng)* | Sẽ gộp & build máy thật cùng Luồng A ở mốc Anh hùng / Cửa hàng |

---

## Lịch sử mốc đã kiểm chứng
1. **21:20** — Tách 3 nhánh & 3 worktree cô lập từ commit gốc `23c9281`.
2. **21:38** — **Luồng A** hoàn tất Bước 0 ([FIDELITY_AUDIT.md](./FIDELITY_AUDIT.md), 15 ảnh đối chiếu, commit `511a4b8`).
3. **21:46** — **Luồng B** hoàn tất thiết lập Android baseline (`17c1079`, `0486916`), chạy fullscreen trên `SM_A236E`, gộp qua `main` (`e9f3843`).
4. **21:47** — **Luồng C** hoàn tất bộ 100 skin gốc + carousel (`f20519b`, `f756ca6`, `ded1642`).
5. **21:55** — PO duyệt `FIDELITY_AUDIT.md` & 4 quyết định sản phẩm; **Luồng A** sửa xong P0 `renderJoystick360` + bỏ `|| true` (`59f30b6`), **Luồng C** hoàn tất polish băng chuyền & API rương/cổ điển (`b508619`), **Luồng B** build APK P0 (`c95b396`).
6. **22:07** — **Luồng A** hoàn tất **Màn 1 (`LoadingScreen` + `theme.ts` Design Tokens)** trên Chrome (`14 files / 47 tests`), phát hiện USB `R5CWA26LE6N` đã kết nối lại và kích hoạt Luồng B cài & đo jank trên máy thật.
