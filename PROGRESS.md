# PROGRESS.md — Tiến độ 3 Luồng Song Song (A / B / C)

*Cập nhật lần cuối: 2026-11-15 21:21 (GMT+7)*

## Tổng quan trạng thái

| Luồng | Nhánh Git | Trạng thái | Công việc đang làm | Đã xong | Bị chặn / Rủi ro | Đã cài lên máy thật (`R5CWA26LE6N`) |
|---|---|---|---|---|---|---|
| **LUỒNG A** (UI, HUD, Luật chơi, Audit) | `a-ui` | 🟡 Đang chạy | Bước 0: Xuất ảnh đối chiếu `[Video Gốc \| Bản Hiện Tại]` và hoàn thiện `FIDELITY_AUDIT.md` (màu hex, tọa độ %W/%H, 27 bậc rank, luật chơi) | Đã tách toàn bộ frame 2fps từ Video A (2p05s) & Video B (1p20s) + video trận đấu | Chờ PO duyệt `FIDELITY_AUDIT.md` trước khi sửa code UI/Luật chơi theo yêu cầu Bước 0 | Bản hiện tại đang chạy trên máy |
| **LUỒNG B** (Android & Device Build) | `b-android` | 🟡 Đang chạy | Viết `.agent/rules/android-device.md`, `HUONG_DAN_ANDROID.md`, cấu hình Capacitor Android chuẩn cho repo gốc, build `builds/app-debug.apk` và cài lên `R5CWA26LE6N` (`SM_A236E`) | Đã xác nhận `adb devices` nhận thiết bị `R5CWA26LE6N` (`SM_A236E`), JDK 21 & Android SDK sẵn sàng | Có 1 entry mDNS `offline` phụ trong `adb devices`, cần luôn truyền `-s R5CWA26LE6N` | Đang build bản đồng bộ mới từ repo gốc |
| **LUỒNG C** (Bộ sinh 100 Skin & Carousel) | `c-skins` | 🟡 Đang chạy | Xây dựng `src/skins/skinFactory.ts` (15+ hình khối tham số, họa tiết đất cache `CanvasPattern`, cache sprite `OffscreenCanvas`), `data/skins.json` (100 skin: 67 Cổ điển, 15 Hiếm, 12 Sử thi, 6 Huyền thoại), `src/screens/skinPreview/`, và `tests/skins/skinFactory.test.ts` | Đã khởi tạo nhánh `c-skins` và đặc tả trong `COORDINATION.md` | Không bị chặn | Chờ xong unit test 100 skin sẽ chuyển Luồng B build lên máy |
