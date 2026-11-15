# COORDINATION.md — Phối hợp Liên Luồng (A / B / C)

## Phân quyền sở hữu thư mục & nhánh Git

| Luồng | Nhánh Git | Thư mục / File sở hữu | Ghi chú |
|---|---|---|---|
| **LUỒNG A** (Giao diện Menu, HUD, Luật chơi, Kiểm toán) | `a-ui` | `FIDELITY_AUDIT.md`, `src/ui/`, `src/render/`, `src/core/`, `src/engine/`, `src/screens/` (trừ skin), `tests/` (trừ skin) | Không sửa trực tiếp `src/skins/`, `src/screens/skinPreview/`, `data/skins.json`, `android/` |
| **LUỒNG B** (Android, Capacitor & Build Điện Thoại) | `b-android` | `android/`, `capacitor.config.ts`, `package.json` (chỉ phần Capacitor/scripts), `builds/`, `screenshots/`, `.agent/rules/android-device.md`, `HUONG_DAN_ANDROID.md` | Chịu trách nhiệm đóng gói APK, cài qua ADB (`R5CWA26LE6N`), chụp màn hình máy thật |
| **LUỒNG C** (Bộ sinh 100 Skin & Băng chuyền Xem trước) | `c-skins` | `src/skins/`, `src/screens/skinPreview/`, `data/skins.json`, `tests/skins/` | Không sửa file của Luồng A/B; ghi yêu cầu tích hợp vào mục dưới |

---

## Yêu cầu tích hợp liên luồng (Cross-Stream Requests)

### Từ Luồng C -> Luồng A
- *(Chưa có — Luồng C sẽ ghi API export của `skinFactory.ts` và `SkinPreviewCarousel` tại đây sau khi hoàn tất trên nhánh `c-skins` để Luồng A nối vào `HeroesScreen`, `HomeScreen` và `TerritoryRenderer`)*

### Từ Luồng A -> Luồng C
- Cần export:
  1. `getAllSkins(): SkinDefinition[]` (đúng 100 skin: 67 Cổ điển, 15 Hiếm, 12 Sử thi, 6 Huyền thoại; kèm điều kiện mở khóa thành tựu: chơi 3/7 ngày liên tiếp, giết 300 đối thủ, mở 24 rương, dùng 50/150 quả cầu, hoàn thành 10 quốc gia).
  2. `renderSkinSprite(skinId: string, size?: number): HTMLCanvasElement | OffscreenCanvas` (có cache OffscreenCanvas để giữ 60 FPS).
  3. `getTerritoryPattern(ctx: CanvasRenderingContext2D, skinId: string): CanvasPattern | null` (cache CanvasPattern: thiên hà tím rune phát sáng, bánh quy cam ô nâu, não hồng, dưa hấu, ngôi sao, chấm bọt, sọc, kim cương...).
  4. Component xem trước băng chuyền `SkinPreviewScreen` / `openSkinPreviewCarousel(skinId, onSelect)` tại `src/screens/skinPreview/`.

### Từ Luồng A & C -> Luồng B
- Mỗi khi nhánh `a-ui` hoặc `c-skins` có mốc hoàn thành và pass `npm test`, Luồng B thực hiện `npm run build && npx cap sync android`, cài lên thiết bị `R5CWA26LE6N` (`SM_A236E`), lưu `builds/app-debug.apk` và chụp màn hình vào `screenshots/`.
