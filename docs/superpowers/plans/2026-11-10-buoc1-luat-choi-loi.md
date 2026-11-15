# Kế Hoạch BƯỚC 1: Khung Dự Án + Luật Chơi Lõi + Bot (Vẽ Tạm Đơn Giản, Chạy Trực Tiếp Trên Android APK)

**Mục tiêu:** Hoàn thiện và chuẩn hóa 100% luật chơi lõi theo đặc tả Paper.io 2, đảm bảo toàn bộ tests Vitest vượt qua, đóng gói thành file APK hoàn chỉnh bằng Capacitor, cài đặt trực tiếp qua ADB lên điện thoại Android thật để người dùng chơi thử mượt mà bằng cảm ứng.

**Spec Luật Chơi Lõi (Bước 1):**
1. **Khép vòng:** Trong đất không có đuôi; ra ngoài đất kéo đuôi; quay về đất khép kín vòng, toàn bộ diện tích bên trong (kể cả đất đối thủ) chuyển thành đất của mình.
2. **Ăn dải đất dưới chân:** Khi đầu di chuyển trên đất đối thủ, các ô dưới chân (bán kính 1-2 ô) lập tức chuyển thành đất của mình.
3. **Đuôi và Thân:** Đi xuyên đuôi chính mình không chết; nhân vật đi xuyên qua thân nhau; chỉ có ĐUÔI mới giết người (đầu chạm đuôi đối thủ -> đối thủ chết).
4. **Hai đầu chạm nhau:** Cả hai bị đẩy lùi 1.5 ô trong 0.2s, không ai chết vì chạm đầu. Ai bị lộ đuôi mà bị đầu người kia chạm trước thì chết; cùng tick thì cả hai chết; chuyển động đẩy lùi dừng ở sát mép nếu rơi vào ô đuôi địch.
5. **Hạ gục ăn toàn bộ đất:** Khi hạ gục nạn nhân, toàn bộ ô đất của nạn nhân chuyển sang kẻ hạ gục (dưới 2ms, không giật frame). Chết không kẻ hạ gục thì đất về trống.
6. **Hết đất thì chết:** Bị ăn sạch đất thì lập tức bị loại.
7. **9 Bot:** 3 tính cách (tham lam, thận trọng, săn mồi), dò tia né tránh, săn mục tiêu nhiều đất, tái sinh sau 2s.

**Kế hoạch Kiểm thử & Triển khai:**
- Chạy Vitest kiểm tra 6 nhóm luật: Khép vòng, Va chạm, Hai đầu chạm nhau, Hạ gục ăn đất, Ăn dải đất dưới chân, Hết đất chết.
- Đóng gói Capacitor APK và nạp ADB lên máy thật `OPPO CPH2471`.
- Chụp ảnh thiết bị và dừng lại cho người dùng chơi thử.

