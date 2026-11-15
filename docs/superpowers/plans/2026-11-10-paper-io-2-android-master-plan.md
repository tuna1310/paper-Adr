# Kế hoạch nâng cấp Paper.io 2 Android (5 Đợt)

## Mục tiêu
Nâng cấp trò chơi theo đúng chuẩn luật mới nhất của Paper.io 2 bản gốc, tối ưu chạy mượt 60 FPS trên thiết bị Android tầm trung (RAM 4GB), đóng gói thành APK hoàn chỉnh bằng Capacitor.

---

## 5 ĐỢT TRIỂN KHAI

### ĐỢT 1: SỬA LUẬT (Đang thực hiện)
1. **Bỏ tự đâm đuôi**: Đi qua đuôi mình không chết. Đuôi chỉ bị cắt bởi đầu người khác.
2. **Đi xuyên thân nhau**: Thân người chơi không cản nhau, chỉ đuôi và aura mới gây sát thương.
3. **Đụng đầu nảy lùi**: Đụng đầu không ai chết, bị đẩy lùi nhẹ 1.5 ô trong 0.2s.
4. **Trượt rìa & Tích Boost**: Chạm biên không chết, trượt theo cung tròn, tích lũy boost 2s (tia lửa trắng -> cam -> đỏ), khi rẽ vào trong thì bứt tốc x1.6 trong 1.5s.
5. **Chấm vàng sát thương (Kill Aura)**: Vòng sát thương bán kính 5 ô trong 5s, quét sạch đối thủ chạm vào, nhấp nháy thu nhỏ khi sắp hết.
6. **Lực hút vật phẩm (Magnet)**: Bán kính 4 ô tự hút vật phẩm về người/bot.
7. **Cập nhật toàn bộ Tests**: Cập nhật tests khớp luật mới, đảm bảo 100% pass, render trực quan để test trên điện thoại.

---

### ĐỢT 2: ĐỒ HỌA & GIAO DIỆN (Task 8-10 + Android Visuals)
- Contour blob viền mượt, đổ bóng giấy cắt 3D, cache path theo `dirtyFlag`.
- Đuôi ribbon bóng mờ bo tròn, hiệu ứng sóng lan khi khép đất, đất vỡ vụn khi bị loại.
- HUD viên thuốc tím, thanh boost rìa, thông báo "Great!" (>5%) và "Bạn đã hạ <tên>".
- Camera theo mượt tự zoom out theo % đất, auto-throttle hiệu ứng nếu frame > 20ms.
- Chụp kiểm tra trên 2 khung Android: 390x844 và 360x800.

---

### ĐỢT 3: 6 HEROES NGUYÊN BẢN (ORIGINAL)
- Thiết kế 6 Hero độc quyền tự vẽ bằng Canvas: Dash, Shield, Magnet, Pulse, Wide Trail, Grow.
- Kỹ năng 1 lần mỗi trận, thanh nạp nảy, nút bấm cảm ứng lớn, lưu hero chọn vào Storage.
- Bot chọn hero ngẫu nhiên và dùng khi nguy cấp/tấn công.

---

### ĐỢT 4: KINH TẾ, SKINS & SỰ KIỆN
- `meta/storage.ts` versioned + migrate: gems, skin, hero, stats.
- 12 Skins tự vẽ + Shop.
- Kiếm Gem khi kill / theo % đất / nhặt map. Hồi sinh bằng 10 Gem (1 lần/trận, 3s bất tử).
- Daily reward 7 ngày, Rương mở skin/hero, 3 Daily Quests, Event "Collect to Win", Team Battle 5v5.

---

### ĐỢT 5: ĐÓNG GÓI ANDROID (APK)
- Khởi tạo Capacitor (@capacitor/core, android, haptics, preferences).
- Khóa portrait, immersive fullscreen, keep-awake, xử lý notch và Android back button.
- Tự động pause game loop/âm thanh khi background.
- Icon + Splash screen tự vẽ.
- Tài liệu `HUONG_DAN_ANDROID.md` chi tiết từ debug run đến build release AAB/APK.

