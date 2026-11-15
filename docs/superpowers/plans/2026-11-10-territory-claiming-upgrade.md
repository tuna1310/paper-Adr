# Kế hoạch triển khai 2 Luật Chiếm Đất Mới

## 1. Mục tiêu
1. **Hạ gục ăn hết đất nạn nhân**: Khi A hạ B, toàn bộ đất của B chuyển sang chủ A trong $< 2\text{ ms}$, cache đếm ô cập nhật $O(1)$, dirty flag đánh dấu cho cả hai, hiệu ứng đổi màu lan tỏa $0.5$s, hiện banner "Bạn đã hạ <tên>". Chết vô chủ thì về đất trống.
2. **Ăn đất dọc đường (Carve Underfoot)**: Khi đi trên đất địch, các ô dưới chân (bán kính 1 ô, rộng bằng đuôi) đổi chủ ngay lập tức, cập nhật cache ô từng bước. Nếu nạn nhân bị ăn hết đất thì chết và người đi qua được tính là kẻ hạ gục.
3. **Bot AI săn đất lớn**: Bot ưu tiên săn đối thủ có nhiều đất hơn (trọng số theo % đất nạn nhân).

---

## 2. File thay đổi & Modules
- [`src/config.ts`](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/config.ts): Thêm cấu hình `CARVE_RADIUS_CELLS = 1`, `TERRITORY_TRANSFER_WAVE_DURATION = 0.5`, `KILL_NOTIFICATION_DURATION = 2.5`.
- [`src/engine/GridMap.ts`](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/engine/GridMap.ts):
  - `transferTerritory(victimId, killerId): number` (chuyển bulk mảng 1D, update cache $O(1)$, đo performance).
  - `carveRivalTerritory(carverId, wx, wy, radiusCells): Map<PlayerId, number>`.
- [`src/engine/GameEngine.ts`](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/engine/GameEngine.ts):
  - Hàm `killPlayer(victim, killer?, location?)` thống nhất logic chuyển đất, cộng kill, tạo wave hoạt ảnh và banner thông báo.
  - Tích hợp `carveRivalTerritory` vào vòng lặp di chuyển, kiểm tra nạn nhân mất sạch đất thì tính kill cho người cắt.
- [`src/ai/BotController.ts`](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ai/BotController.ts):
  - Tăng độ hung hãn (aggression) của Bot khi mục tiêu sở hữu % đất lớn.
- [`src/main.ts`](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/main.ts):
  - Vẽ hiệu ứng sóng đổi màu đất lan tỏa từ điểm chết ($0.5$s).
  - Vẽ banner thông báo nổi "Bạn đã hạ <tên>".
- [`tests/engine/TerritoryClaiming.test.ts`](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/tests/engine/TerritoryClaiming.test.ts):
  - Unit tests cho các kịch bản: chuyển đất, cache đếm ô, performance $<2$ms, carve dưới chân, carve cạn đất, damage aura transfer.

