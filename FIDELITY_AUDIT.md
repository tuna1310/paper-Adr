# FIDELITY_AUDIT.md — Báo cáo Kiểm toán Giao diện & Luật chơi (Bước 0)

> **Phạm vi kiểm toán:** Toàn bộ 2 video tham chiếu chính thức (**Video A** `125.3s`, **Video B** `80.5s`) cùng **Video C** (`156.1s` ghi trận đấu & Game Over), khung chuẩn **720×1558** (tỉ lệ `0.462`), đối chiếu trực tiếp với bản hiện tại của thư mục gốc (`Paper.io 2` / chuẩn bị đổi tên gốc **Paper Territory**) chạy trên Chrome headless ở kích thước `390×844` (kèm ảnh ghép side-by-side trong [audit_comparisons/](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/)).
>
> **Trạng thái quy trình:** Đang ở **Bước 0 — Kiểm toán, CHƯA sửa code Luồng A** (`src/ui/`, `src/render/`, `src/core/`, `src/engine/`, `src/screens/`). Chờ PO duyệt báo cáo này mới tiến hành sửa từng màn một.

---

## 0. Tóm tắt Mức độ Lệch & Lỗi Nghiêm trọng Phát hiện

| Hạng mục | Mức độ lệch | Ảnh đối chiếu |
|---|---|---|
| **Màn 1 — Loading / Splash** | **100% (Thiếu hoàn toàn)** | [01_loading_vs_home.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/01_loading_vs_home.png) |
| **Khung Điều hướng (Top Bar + Bottom Nav)** | **Cao (~60%)** | [02_home_screen.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/02_home_screen.png) |
| **Màn 2 — Màn Nhà (Home)** | **Nghiêm trọng (~75%)** | [02_home_screen.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/02_home_screen.png) |
| **Màn 3 — Thang Hạng (27 bậc Rank Ladder)** | **100% (Chưa dựng — bấm nút không mở gì)** | [03_rank_ladder_missing.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/03_rank_ladder_missing.png) |
| **Màn 4 — Bảng Xếp Hạng Giải Đấu (Leaderboard)** | **100% (Chưa dựng)** | [04_tournament_leaderboard_missing.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/04_tournament_leaderboard_missing.png) |
| **Màn 5 — Cửa Hàng (Shop)** | **Nghiêm trọng (~80%)** | [05_shop_top.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/05_shop_top.png), [06_shop_gems_coins.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/06_shop_gems_coins.png) |
| **Màn 6 — Anh Hùng & Trang Phục Cổ Điển** | **Nghiêm trọng (~75%)** | [07_heroes_grid.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/07_heroes_grid.png), [08_classic_skins.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/08_classic_skins.png) |
| **Màn 7 — Băng Chuyền Xem Trước Skin** | **Cao (~55%)** | [09_skin_carousel.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/09_skin_carousel.png) |
| **Màn 8 — Nhiệm Vụ (Hàng ngày + Trọn đời)** | **Nghiêm trọng (~70%)** | [10_missions_daily.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/10_missions_daily.png), [11_missions_lifetime.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/11_missions_lifetime.png) |
| **Màn 9 — Bản Đồ Thế Giới (World Map)** | **Nghiêm trọng (~85%)** | [12_world_map.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/12_world_map.png) |
| **Màn 10 — Trong Trận (Arena + HUD + KO + Orb)** | **Nghiêm trọng (~90% + Crash runtime!)** | [13_gameplay_hud_arena.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/13_gameplay_hud_arena.png), [14_gameplay_ko_orb.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/14_gameplay_ko_orb.png) |
| **Màn 11 — Game Over / Hồi Sinh Tim Đếm Ngược** | **100% (Sai hoàn toàn + không bật được trên loop crash)** | [15_game_over_revive.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/15_game_over_revive.png) |

> **P0 Crash tìm thấy trong code hiện tại (`HudRenderer.ts`):** Khi bấm Play và render khung hình trận đấu, Chrome Headless ghi nhận lỗi runtime liên tục:
> `PAGEERROR: this.renderJoystick360 is not a function` tại [HudRenderer.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/HudRenderer.ts#L94) (gọi `this.renderJoystick360(...)` trong ngữ cảnh mà `renderJoystick360` khai báo `private static`). Lỗi này làm vòng lặp render HUD gãy ngay frame đầu, nhân vật đứng yên (`x=1200, y=1911.3`), không cập nhật % và không hiện màn Game Over khi gọi `player.die()`.

---

## 1. Kiểm toán Chi tiết Từng Màn hình, Popup, Toast & Chuyển cảnh

### 1.1 Icon App & Màn Loading / Splash (`Video B [01:18–01:20]`, `Video A [00:00–00:09]`)
- **Tham chiếu video:**
  - Icon màn hình chính iOS: khối Donut phủ cốm hồng vát 3D trượt để lại vệt hồng trên nền xanh ngọc. (Bản remake tự vẽ theo phong cách khối tương tự với tên **Paper Territory**, không dùng chữ/nhãn `Paper.io 2` hay `Voodoo`.)
  - Màn Loading (`frame 0018`, ảnh [01_loading_vs_home.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/01_loading_vs_home.png)):
    - Nền chuyển sắc dọc rực rỡ từ trời xanh (`#208DF0`), tâm tỏa sáng ngọc-trắng (`#01FDFC`), xuống đồi lá thu vàng cam (`#FDA600` -> `#FCAE01`).
    - Phần trên (`y ~ 10–28%H`): chữ nhà phát hành nhỏ + **Logo 3D viền xanh đậm nghiêng nhẹ**.
    - Giữa (`y ~ 28–80%H`): cụm linh vật khối 3D bay lượn với vệt màu (khối gà vàng khổng lồ tiền cảnh, khối thỏ/hồng, dơi xanh, miếng dưa hấu).
    - Đáy (`y ~ 90–94%H`): vòng quay tải hình khuyên trong suốt xoay đều trước khi fade sang Màn Nhà.
- **Bản hiện tại đang lệch:**
  - Vào thẳng Màn Nhà, **không có màn Loading**.
  - `index.html` và `capacitor.config.ts` vẫn ghi tên `Paper.io 2` thay vì tên gốc `Paper Territory`.

### 1.2 Khung Điều hướng Chung (`NavFrame`, xuyên suốt các màn Menu — `Video A [00:17–01:19]`)
- **Thông số đo được từ khung chuẩn `720×1558`:**
  - **Thanh trên (`Top Bar`):**
    - Avatar tròn trái: `x ~ 5.5%W`, đường kính `~10.5%W` (`~41px @ 390`), nền trắng viền xanh đậm `#071A75`. **Xuất hiện trên MỌI màn menu** (hoặc mờ/giữ vị trí nút tròn đều).
    - Hai viên thuốc tiền tệ giữa (`y = 8.3%..11.3%H`, cao `3.0%H`): nền xanh navy `#183BA1`, biểu tượng **Xu vàng viền `+` xanh lá** (`13,78K`) và **Đá quý hồng viền `+` xanh lá** (`44`). Dấu phẩy kiểu Việt `13,78K`.
    - Nút bánh răng Cài đặt phải: icon răng cưa trắng tinh viền xanh đậm (`#FFFFFF` / `#071A75`), nổi bật trên mọi nền.
    - **Toast đăng nhập (`Video A [00:19–00:22]`):** Pill đen bo tròn nổi ngay dưới status bar (`"Đã đăng nhập dưới tên ĐệTửĐàNẵng66"`).
  - **Thanh đáy (`Bottom Nav`):**
    - Đo chính xác: bắt đầu ở `y = 89.1%H`, cao **`10.9%H`** (`~92px @ 844`), nền xanh-trắng nhạt **`#D4E8FD` / `#EAF4FD`**, viền đỉnh gợn sóng xanh đậm.
    - **5 tab cân đối:** `Cửa hàng` (cửa tiệm + chấm đỏ `!`), `Anh hùng` (2 khối mặt vàng nháy mắt), `Nhà` (nút tròn vàng nhô cao hẳn lên đường sóng — đường kính **`29.4%W`**, ở trang Nhà biến thành nút **Play `▶`**, ở trang con thu nhỏ nhẹ thành nút **`🏠` về Nhà**), `Nhiệm vụ` (bảng tick xanh), `Thế giới` (quả địa cầu có mây trắng).
    - Tab con đang chọn có dải nền xanh dương tràn xuống đáy + chữ Việt có viền đậm ở dưới icon (`Cửa hàng`, `Anh hùng`, `Nhiệm vụ`, `Thế giới`).
- **Bản hiện tại ([NavFrame.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/NavFrame.ts)) đang lệch:**
  - Ẩn hoàn toàn nút Avatar và Cài đặt khi sang 4 tab phụ (`Cửa hàng`, `Anh hùng`, `Nhiệm vụ`, `Thế giới`).
  - Nút Cài đặt ở trang Nhà bị tối màu xanh mờ thay vì trắng sáng viền xanh.
  - Thanh đáy quá mỏng (`~68px` vs `~92px`), nền xanh đậm đơn sắc thay vì dải sáng `#D4E8FD`, thiếu hiệu ứng gợn sóng mượt ôm lấy nút tròn giữa, và hình SVG icon khác tỉ lệ/độ dày nét viền so với video.

### 1.3 Màn Nhà — Home (`Video A [00:17–00:19]`, so sánh [02_home_screen.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/02_home_screen.png))
- **Tham chiếu video (frame `0038`):**
  - Nền: Gradient xanh dương tươi **`#1DAEFB`** với quầng sáng ngọc cyan ở giữa **`#48E9EE`** và **bóng mờ hình bản đồ lục địa thế giới** trải sau đảo nổi (KHÔNG dùng watermark chữ `∞`).
  - Cột phải (`x ~ 82–96%W`):
    - Nút tròn **`Skin / Hero xem trước hàng ngày` + icon móc áo + đồng hồ `3g 43p`** nằm phía **PHẢI** dưới nút Settings (`y ~ 15–22%H`).
    - Dưới đó (`y ~ 23–31%H`): vòng tròn đỏ vàng `AD` gạch chéo + khung trắng **`KHÔNG CÓ QUẢNG CÁO`**.
  - Trung tâm (`y ~ 21–58%H`):
    - Pill tên quốc gia **`Panama`** + thanh tiến độ **`74%`** (`#4F39AA` trên nền `#051B86` chấm sao) + **lá cờ Panama** nghiêng góc phải + đuôi bong bóng thoại chĩa xuống (`y ~ 22–27%H`).
    - Đảo 3D bậc đá **tím sẫm (màu theo lãnh thổ/skin đang chọn)**, linh vật đứng nổi khối trên đảo, phía sau uốn một dải **đuôi trắng dày phát sáng** vòng qua phải.
  - Cụm đáy hai bên nút **Play** (`#FFE804` viền xanh):
    - Cánh trái nhọn (`#3EBEFE`, họa tiết dấu `?` mờ): ổ khóa + **`SẮP RA MẮT`**.
    - Cánh phải nhọn (`#F8A254` chuyển cam, họa tiết sao mờ): huy hiệu hạng **`ĐỒNG III`** (3 sao) + thanh tím **`⭐ 1588`**. Bấm vào cánh này mở màn Thang Hạng.
- **Bản hiện tại ([HomeScreen.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/screens/HomeScreen.ts)) đang lệch:**
  - Đặt ô sự kiện `"1n 14g"` sai sang bên **TRÁI** dưới avatar.
  - Hình nền dùng watermark `∞` thay vì bóng lục địa thế giới.
  - Đảo 3D tô màu xám/trắng nhạt phẳng, dựng hình ô tô xanh thay vì khối nhân vật đồng bộ skin đang chọn + đuôi cong phát sáng.
  - Thêm 2 cụm KHÔNG CÓ trong video: pill `"⬜ Dưa Hấu"` dưới đảo và bong bóng xanh lá `"Bắt đầu x5 Lớn hơn"` đè lên trên nút Play.
  - Nút Play sai tỉ lệ (`W=29.4%W`, `y=83.1%..95.2%H` ở video nhưng ở code hiện tại chưa chuẩn hóa vùng tương ứng) và cánh phải `#btn-rank` **bấm vào chỉ phát âm thanh, không mở màn Thang Hạng**.

### 1.4 Màn Thang Hạng — Rank Ladder (`Video A [00:20–00:34]`, [03_rank_ladder_missing.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/03_rank_ladder_missing.png))
- **Tham chiếu video (frames `0041–0066`):**
  - **Hoàn toàn chưa có trong bản hiện tại (`100% Missing`).**
  - Nền chia nửa: phần bậc đã mở sáng (`#0CA0FE` / `#503AAD` tùy vùng), phần bậc khóa trên tối (`#002C71`), họa tiết sao mờ trôi nhẹ.
  - Cạnh trái dọc suốt danh sách có **thanh cột tiến độ vàng** đánh dấu mức sao hiện tại của người chơi.
  - **27 bậc hạng (9 cấp × I, II, III)** với mốc sao và tỷ lệ Top% đo nguyên văn từ video:
    1. `ĐỒNG I`, `ĐỒNG II` *(mốc dưới cuộn không hiện hết số trong video — xem mục Câu hỏi mở)*, `ĐỒNG III` (`1588⭐`, `HÀNG ĐẦU 91% CỦA NGƯỜI CHƠI`)
    2. `BẠC I` (`2620` / `88%`), `BẠC II` (`3860` / `84%`), `BẠC III` (`5350` / `80%`)
    3. `VÀNG I` (`7140` / `76%`), `VÀNG II` (`9290` / `73%`), `VÀNG III` (`11.870` / `69%`)
    4. `BẠCH KIM I` (`14.970` / `65%`), `BẠCH KIM II` (`18.690` / `61%`), `BẠCH KIM III` (`23.150` / `58%`)
    5. `KIM CƯƠNG I` (`28.500` / `54%`), `KIM CƯƠNG II` (`34.920` / `50%`), `KIM CƯƠNG III` (`42.620` / `46%`)
    6. `ƯU TÚ I` (`51.860` / `42%`), `ƯU TÚ II` (`62.950` / `39%`), `ƯU TÚ III` (`76.260` / `35%`)
    7. `BẬC THẦY I` (`92.230` / `31%`), `BẬC THẦY II` (`111.400` / `27%`), `BẬC THẦY III` (`134.400` / `24%`)
    8. `NHÀ VÔ ĐỊCH I` (`162.000` / `20%`), `NHÀ VÔ ĐỊCH II` (`195.120` / `16%`), `NHÀ VÔ ĐỊCH III` (`234.870` / `12%`)
    9. `HUYỀN THOẠI I` (`282.570` / `9%`), `HUYỀN THOẠI II` (`339.810` / `5%`), `HUYỀN THOẠI III` (`408.490` / `1%`)
  - Cụm nút nổi đáy màn: Trái = nút **Bảng xếp hạng Podium** (`🏆`), Giữa = nút tròn trắng **`X`** đóng, Phải (khi cuộn lên trên) = nút **`v`** cuộn nhanh về vị trí hiện tại.
- **Bản hiện tại đang lệch:**
  - `MetaManager.ts` dùng thang bậc rút gọn tự chế (`0, 200, 500, 1000, 1500, 2000, 3000`) hoàn toàn sai dữ liệu video; không có UI Thang Hạng.

### 1.5 Bảng Xếp Hạng Giải Đấu — Tournament Leaderboard (`Video A [00:46–00:50]`, [04_tournament_leaderboard_missing.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/04_tournament_leaderboard_missing.png))
- **Tham chiếu video (frames `0088–0096`):**
  - **Hoàn toàn chưa có trong bản hiện tại (`100% Missing`).**
  - Nền trời xanh nhạt có mây (`#629FFD`) trên top 35% màn hình: **Bục Podium Top 3**:
    - Hạng `#2` trái (bục bạc `#AEBCE9`, huy chương `2`, `FRMhndshk - 2517⭐`),
    - Hạng `#1` giữa cao nhất (bục vàng `#F6AC19`, vương miện trên avatar + vòng nguyệt quế huy chương `1`, `MinhDepTrai - 2520⭐`),
    - Hạng `#3` phải (bục đồng cam `#E05D22`, huy chương `3`, `Outlandish - 2515⭐`).
  - Khung tiêu đề navy đậm (`#063DC5` / `#001368`): **`GIẢI ĐẤU ĐỒNG`** (lỗi font gốc in thiếu dấu ô thành `Đ NG` — bản làm lại sửa đúng chính tả Việt **`GIẢI ĐẤU ĐỒNG`**).
  - Bảng cuộn danh sách dài hàng trăm người chơi (`#216`..`#354` xuất hiện khi cuộn): mỗi dòng pill xanh sáng (`#B9EBFF`), chứa `[Số hạng] [Avatar tròn] [Tên] [Huy hiệu cấp 3 sao] [Số sao ⭐]`.
  - Dưới giữa: nút tròn trắng **`X`** quay lại Thang Hạng.

### 1.6 Cửa Hàng — Shop (`Video A [00:51–01:00]`, [05_shop_top.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/05_shop_top.png), [06_shop_gems_coins.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/06_shop_gems_coins.png))
- **Tham chiếu video (frames `0110, 0112, 0114, 0118`):**
  - Mái hiên sọc **xanh đậm - trắng** bo tròn đáy đổ bóng ở đỉnh màn hình (`Top 14%`).
  - Thứ tự các mục cuộn dọc (nền `#115AEB`):
    1. **Hàng thẻ đặc biệt trên cùng + Thẻ Trang phục nổi bật (`Droid / Cubey`)**: tag đỏ `"MIỄN PHÍ"` kẹp góc trái, đồng hồ **`Chỉ trong 03g 42p`** góc phải, icon móc áo, nút chữ nhật rộng **`Miễn phí`** ở đáy thẻ.
    2. **Mục `Rương Anh Hùng`** kèm nút **`?`** (bấm mở popup tỷ lệ rương): Lưới 2×2 thẻ có lỗ móc treo:
       - `Phổ biến` (`10+` thẻ) = **`20💎`**
       - `Hiếm` (`70+` thẻ) = **`50💎`**
       - `Sử thi` (`170+` thẻ) = **`120💎`**
       - `Huyền thoại` (`240+` thẻ) = **`300💎`**
    3. **Mục `Đá quý`** (`#F77BFC` tím hồng): Lưới 2×2: **`20`** (`29.000`), **`110`** (`149.000`), **`500`** (`599.000`), **`1100`** (`1.199.000` gắn nhãn đỏ nghiêng **`GIÁ TRỊ TỐT NHẤT`**).
    4. **Mục `Xu`** (`#FAC82B` vàng rực): Lưới 2×2: **`3500`** (`20💎`), **`22000`** (`100💎`), **`70000`** (`300💎` gắn nhãn đỏ nghiêng **`PHỔ BIẾN NHẤT`**), **`225000`** (`900💎`).
- **Bản hiện tại ([ShopScreen.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/screens/ShopScreen.ts)) đang lệch:**
  - Chèn sai cả bộ lọc `"Trang phục theo độ hiếm"` + **lưới 100 skin ngay trong Shop** (trong video, toàn bộ skin nằm ở tab **Anh hùng**, KHÔNG nằm trong Shop!).
  - Thiếu mái hiên bo cong đổ bóng, thiếu thẻ `Droid / Cubey` miễn phí theo giờ, thiếu nút `?` và rương 4 cấp có lỗ móc treo, sai hoàn toàn giá & số lượng gói Đá quý/Xu (`100/250/650/1400` thay vì `20/110/500/1100`), thiếu tag nghiêng `GIÁ TRỊ TỐT NHẤT` / `PHỔ BIẾN NHẤT`.

### 1.7 Anh Hùng & Trang Phục Cổ Điển — Heroes & Classic Skins (`Video A [01:00–01:08]`, `Video B [00:46–01:02]`, [07_heroes_grid.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/07_heroes_grid.png), [08_classic_skins.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/08_classic_skins.png))
- **Tham chiếu video (frames `0122, 0133, 0140, 0142`):**
  - Thanh header từng nhóm kéo ngang có nền màu theo độ hiếm (`Phổ biến 1/7` xanh cyan `#06AFFC`, `Hiếm 0/4` vàng, `Sử thi`, `Huyền thoại`, `Cổ điển`).
  - Lưới 3 cột:
    - Hero đang dùng: khung trắng bo dày viền phát sáng xanh lá, nhãn **`Cấp 1`** lồng đáy thẻ + **pill tiến độ thẻ tách rời bên dưới (`🃏 1/40`)**, có huy hiệu kỹ năng tròn nhỏ ở góc trên trái (tốc độ, khiên, mắt...).
    - Hero bị khóa: bóng hình mờ đậm trong thẻ xanh + ổ khóa trắng + chữ `Bị khóa`.
    - Phần **Trang phục Cổ điển (`0133.png`)**: chứa 100 skin trong đó các skin đã mở (như `Wizard`, `Dưa Hấu`) có nền trắng sáng + tick xanh góc phải dưới; các **skin khóa theo thành tựu** hiển thị rõ tiến độ thanh xanh lá ngay trong thẻ tối:
      - `Chơi 3 ngày liên tiếp` (`1/3`), `Chơi 7 ngày liên tiếp` (`1/7`), `Giết 300 đối thủ` (`77/300`), `Mở 24 rương` (`13/24`), `Sử dụng 50 quả cầu` (`25/50`), `Sử dụng 150 quả cầu` (`25/150`), `Hoàn thành 10 quốc gia nữa` (`3/10`), `Sử dụng 30 / 60 / 120 vật phẩm tăng sức mạnh` (`0/30`, `0/60`, `0/120`).
  - Hai nút tròn nổi góc dưới phải (`x ~ 88%W`): nút chuyển nhóm lên/xuống (`^v`) và nút sắp xếp (`↑↓`).
- **Bản hiện tại ([HeroesScreen.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/screens/HeroesScreen.ts)) đang lệch:**
  - Số lượng Hero ít (`1/1, 0/2, 0/2, 0/1` thay vì `1/7, 0/4...`), thanh tiêu đề chỉ là viên thuốc tối nhỏ ở giữa thay vì băng dải rộng.
  - Phần Classic Skins chỉ hiện giá Xu/Miễn phí chung, hoàn toàn **thiếu cơ chế và thanh tiến độ mở khóa thành tựu** (3/7 ngày, 300 kills, 24 rương, 50/150 quả cầu, 10 quốc gia, 30/60/120 power-up).
  - Thiếu nút nhảy mục thứ 2 ở góc dưới phải.

### 1.8 Băng Chuyền Xem Trước Skin (`Video B [01:03–01:10]`, `video_b80_frames/0128.png`, [09_skin_carousel.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/09_skin_carousel.png))
- **Tham chiếu video:**
  - Nền trời chuyển sắc xanh `#175AF8 -> #97F1FC` nối với **sàn đấu phối cảnh 3D đường kẻ trắng góc nhìn xa** (`#1094FC`) cùng bục spotlight tròn phát sáng trắng `#FAFBFE` ở giữa.
  - Đỉnh màn: icon tick tròn xanh lá bên trái + dải bảng tên cong bo viền trắng/vàng/xanh (`Wizard`) căn giữa (`y ~ 15%H`). **KHÔNG có** bộ lọc `Tất cả / Đã sở hữu`, `PHỔ BIẾN`, hay số đếm `1/100`.
  - Hai mũi tên `<` và `>` mảnh gọn ở hai mép màn hình (`y ~ 45%H`), bệ phát sáng xoay/trượt ngang các skin hàng xóm hai bên.
  - Đáy màn: nút lớn **`Đang dùng` / `Dùng`** màu cyan bóng (`#46D4FA`) + nút tròn **`X`** đóng nằm phía dưới.
- **Bản hiện tại ([SkinPickerModal.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/components/SkinPickerModal.ts)) đang lệch:**
  - Thêm tab lọc `Tất cả (100) / Đã sở hữu (1)` và dòng chữ không tồn tại trong video; nền trơn thiếu sàn phối cảnh 3D & đường chân trời sáng; bệ ellipse tối đơn giản thiếu hào quang; nút `Đang dùng` màu xám tối viền mảnh thay vì nút 3D xanh cyan. *(Màn này sẽ do **Luồng C** dựng lại chuẩn trong `src/screens/skinPreview/`).*

### 1.9 Nhiệm Vụ — Missions (`Video A [01:11–01:16]`, [10_missions_daily.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/10_missions_daily.png), [11_missions_lifetime.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/11_missions_lifetime.png))
- **Tham chiếu video (frames `0147, 0149`):**
  - Nền tím hồng rực rỡ (`#7F25F5` -> `#FADBFC` quầng trắng sáng ở phần trên).
  - Khu vực thưởng 3/3 (`y ~ 19–44%H`): bong bóng xanh **`📋 0/3`** phía trên **đống Đá quý hồng có số `15` lớn** đặt trên bệ sáng trắng/cyan (KHÔNG phải rương gỗ!).
  - **Khung bảng xanh dương đậm (`#003BD2`, `y ~ 47–90%H`)** bọc cả thanh chuyển tab (`Hàng ngày` nút vàng sáng `#FDF8C3` vs `Trọn đời`), đồng hồ **`⏱ Nhiệm vụ mới sau 3g 42p`**, và 3 thẻ nhiệm vụ trắng viền xanh có góc nêm xanh nhạt chứa **chồng tiền xu + số vàng (`550 / 300 / 450`)** + nút **đổi nhiệm vụ `↻`** gắn ở góc trên trái mỗi thẻ:
    - `Hoàn thành 3 quốc gia nữa` (`0/3`, `550 xu`)
    - `Ở ngoài khu vực sơn của mình 6 giây liên tiếp` (`0/6`, `300 xu`)
    - `Ở trong khu vực sơn của đối thủ 3 giây liên tiếp` (`0/3`, `450 xu`)
  - Tab **Trọn đời** (`0149.png`): 5 thẻ trong khung xanh dương đậm, mỗi thẻ có **hình thoi cấp độ (`1`)**, thanh tiến độ **xanh lá neon (`67/75`)**, góc phải là **chồng sao vàng `500`**:
    - `Chơi 75 trò chơi`, `Giết 300 đối thủ`, `Hoàn thành 10 quốc gia`, `Thu thập 20 Nhân vật`, `Đạt 5 Trò chơi Thưởng`.
- **Bản hiện tại ([MissionsScreen.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/screens/MissionsScreen.ts)) đang lệch:**
  - Dùng nền xanh dương `∞` giống trang khác, thay đống đá quý `15` bằng cái rương gỗ kèm chữ `"80% Vàng • 10% Ruby • 10% Skin"`, khung bảng dưới dùng nền trắng tách rời, thiếu màu vàng tab active/đồng hồ lồng khung, nội dung 3 nhiệm vụ hàng ngày bị chế lại (`Chơi 5 trận đấu`, `Hạ gục 15 đối thủ`, `Chiếm 20% bản đồ`) khác hẳn video.

### 1.10 Bản Đồ Thế Giới — World Map (`Video A [01:17–01:21]`, `Video B [00:00–00:40]`, [12_world_map.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/12_world_map.png))
- **Tham chiếu video (frame `0155`):**
  - Toàn màn hình là đại dương xanh tươi (`#00ACFD`) có **vân sóng mờ lượn** và vùng nước nông viền bờ biển sáng (`#FBFCFF` / `#8DE5FF`).
  - Lục địa và ranh giới quốc gia là **vector hình khối thật (Nam Mỹ, Bắc Mỹ, Âu, Á, Phi...) có độ dày thành đá trắng 2.5D**, quốc gia đã chinh phục phủ xanh lá (`#2DBF3A`), quốc gia đang chơi cắm **cờ phướn + nhân vật đang chọn đứng trực tiếp trên đất nước với vệt sơn trắng**.
  - Cho phép vuốt kéo tự do đi khắp bản đồ thế giới và phóng to/thu nhỏ mượt.
  - Chỉ có 2 lớp phủ nhỏ gọn:
    - Góc trên trái (`y ~ 14–21%H`): ô trạng thái **`Mở khóa NAM MỸ / 3/8 🏳`**.
    - Góc dưới trái phía trên Bottom Nav (`y ~ 73–85%H`): **bong bóng tròn viền trắng chứa ảnh nhân vật hiện tại**.
- **Bản hiện tại ([WorldScreen.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/screens/WorldScreen.ts), [WorldMapCanvas.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/components/WorldMapCanvas.ts)) đang lệch:**
  - Vẽ châu lục bằng **đa giác lục/bát giác thô sơ** ([WorldMapData.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/components/WorldMapData.ts)), không có bờ biển vector thật, không vân sóng đại dương, không độ dày 2.5D đồng bộ, không cột cờ & nhân vật đứng trên bản đồ.
  - Chèn hàng loạt UI thừa che mất bản đồ: thanh chips `"BẮC MỸ 2/8 | NAM MỸ 0/8..."` ở trên, toàn bộ hộp bottom dock `"Nicaragua • Chơi ngay"` ở dưới.
  - Trong code có `|| true` ép mở khóa toàn bộ các châu lục ([WorldScreen.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/screens/WorldScreen.ts#L51)), phá vỡ logic tiến trình mở từng khu vực (`3/8`, `10 quốc gia`).

### 1.11 Trong Trận Đấu — Gameplay Arena & HUD (`Video A [01:21–02:04]`, `Video C [01:40–02:25]`, [13_gameplay_hud_arena.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/13_gameplay_hud_arena.png), [14_gameplay_ko_orb.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/14_gameplay_ko_orb.png))
- **Tham chiếu video (frames `0179, 0180, 0198, 0201–0215, 0230–0238`):**
  - **Hình dáng Đấu trường:** Đảo hình **Boomerang uốn cong** có vách thành 2.5D trắng-xanh nổi trên nền trời xanh/biển, mặt đất trống xanh ngọc phấn `#E2FBEF` có họa tiết chấm cỏ nhỏ rải nhẹ.
  - **Thanh `%` đỉnh (`x = 8.9%..92.5%W, y = 9.1%..12.4%H`):** Nền `#1D1391`, có các **vạch mốc đồng xu nổi** bên trên (`~6.8%, 17.3%, 27.9%, 81.4%` ở trận Video C) và **Ngôi sao vương miện `100%`** rực rỡ ở đầu phải; đạt tới mốc xu sẽ nảy lên cộng tiền trực tiếp!
  - **Pill Số mạng hạ gục (Top-left `y ~ 16–20%H`):** Đầu lâu viền xanh đậm + con số (`1, 2, 3, 4, 5...`), chớp hào quang cyan mỗi lần có kill.
  - **Bảng Xếp Hạng Live (Top-right `x ~ 70–100%W, y ~ 14–36%H`):** Dính sát mép phải màn hình, hiển thị Top 3 (`#1` vàng + vương miện trên avatar, `#2` bạc, `#3` đồng cam); nếu người chơi đứng hạng `>= 4` (`#4, #5, #9...`) thì **tách 1 khe hở nhỏ rồi ghim thêm thẻ của người chơi ngay bên dưới `#3`**, còn khi vào Top 3 thì gộp đúng 3 dòng.
  - **Bản đồ nhỏ Minimap (Bottom-left `x ~ 5–38%W, y ~ 73–82%H`):** Đúng hình dáng **Boomerang đảo**, tô trực tiếp màu lãnh thổ theo thời gian thực + chấm tròn vị trí bot + **mũi tên tam giác trắng** chỉ hướng đầu người chơi.
  - **Hiệu ứng Chiến đấu & Linh thú đi theo:**
    - Đuôi kẻ địch bị cắt / người chơi hạ gục biến thành **khối mini của nạn nhân chạy nối đuôi sau lưng người thắng** (tối đa thành 1 hàng dài!).
    - Dải băng **KO Streak ngang màn hình** chói sáng (`KO ĐÔI!`, `CHUỖI KO!`, `MULTI KO!`) + chữ nổi ngay trên nhân vật (`VÔ ĐỊCH!`, `BÙNG NỔ!`, `XUẤT SẮC!`).
    - Bot mang avatar tròn + tên có viền đậm (`BinMinh99`, `QuarterAnimal`, `Dilar`).
    - **Quả cầu Ánh sáng (`Orb`):** Hình cầu ngọc xà cừ to phát sáng với vòng tròn định vị; nhặt vào nổ ra **vòng sóng xung kích lan rộng trong ~2.5s**, tự động **sơn chiếm toàn bộ vùng đất trống & cướp đất địch bên trong vòng nổ** đồng thời tiêu diệt mọi đối thủ nằm trong vùng ảnh hưởng!
  - **Joystick điều khiển:** **Vô hình** khi rảnh (vuốt từ bất kỳ điểm nào để lái, không vẽ vòng tròn to xám che mất tầm nhìn đấu trường).
- **Bản hiện tại ([GameRenderer.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/GameRenderer.ts), [HudRenderer.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/HudRenderer.ts), [TerritoryRenderer.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/TerritoryRenderer.ts)) đang lệch:**
  - Hình tròn đơn điệu thay vì đảo Boomerang 2.5D + không có minimap.
  - Không có Bảng xếp hạng Top 3 + Hạng người chơi bên phải, không có Pill đầu lâu bên trái, không có các mốc Xu/Sao trên thanh `%`, không có banner `KO ĐÔI!/CHUỖI KO!`, không có đàn linh thú mini theo sau.
  - **Đang lỗi runtime (`this.renderJoystick360 is not a function`)** khiến trận đấu bị treo cứng hình ảnh ngay frame đầu.

### 1.12 Màn Game Over & Hồi Sinh (`Video C [02:27–02:34]`, frame `0308.png`, [15_game_over_revive.png](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/15_game_over_revive.png))
- **Tham chiếu video:**
  - Phủ xanh dương radial (`#014FD8` viền ngoài -> `#084587` quầng tâm) kèm **sóng trái tim mờ khổng lồ phập phồng** phía sau.
  - Phía trên giữ thanh tiến độ `%` của ván (làm mờ nhẹ).
  - Pill báo kẻ hạ gục: `[Avatar kẻ giết] Bị giết bởi Gro [Đầu lâu trắng]`.
  - Tiêu đề nghiêng trắng đậm viền navy: **`Trò chơi kết thúc!`**.
  - Chính giữa: **Trái tim khổng lồ đếm ngược `3 -> 2 -> 1`**, mực đỏ (`#FB3738`) tụt dần từ trên xuống nền navy đậm (`#084587`), chấm phản sáng góc trái tim.
  - Nút xanh lá 3D **`Hồi sinh`** kèm icon cuộn phim quảng cáo ở góc trên phải nút + dòng chữ bấm bỏ qua **`Không, cảm ơn`** ở dưới.
- **Bản hiện tại đang lệch:**
  - Hoàn toàn không có UI Tim đếm ngược hồi sinh hay báo người hạ gục; do crash `renderJoystick360` ở `HudRenderer`, màn chụp `12_game_over.png` thậm chí vẫn kẹt ở `0.2%` và không bật nổi hộp Game Over.

---

## 2. Đối chiếu Luật Chơi & Hệ thống (Video vs Code hiện tại)

| Cơ chế / Luật | Hành vi Quan sát trong Video A / B / C | Trạng thái trong Code Hiện tại | Mức lệch & Cần sửa |
|---|---|---|---|
| **1. Hình dạng đấu trường** | Đảo **Boomerang uốn cong** viền vách 2.5D; đi sát mép đảo lướt dọc bờ an toàn. | Hình tròn tâm `(1200,1200)`, bán kính `110` ô ([config.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/config.ts)). | **Khác hình dạng** -> Chuyển lưới/mặt nạ hợp lệ sang Boomerang island mask + vẫn giữ trượt rìa bứt tốc mượt (Rule 4). |
| **2. Số lượng thực thể & hồi sinh Bot** | Thấy tới hạng `#9+` đồng thời (`#1–3` + nhiều bot roaming); giết 5 mạng nhưng đấu trường vẫn đông bot. | 1 người chơi + 9 bot ([config.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/config.ts)), [BotController.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ai/BotController.ts#L206-L227) có hồi sinh bot sau `respawnTimer`. | **Tạm ổn về respawn**, cần tăng tổng đối thủ lên `~12–15` thực thể hoặc spawn dày hơn cho khớp mật độ đấu trường và `#9+`. |
| **3. Quả cầu Ánh sáng (`Orb`)** | Nhặt Quả cầu ngọc phát nổ **vòng sóng xung kích lan rộng ~2.5s** tại chỗ nhặt: **tự động sơn chiếm toàn bộ đất trống & đất địch trong bán kính nổ** + giết kẻ địch lọt vào vòng nổ (`24.31% -> 31.96%`, `+1 kill`). Không thấy hộp tăng tốc cam riêng lẻ trong 2 video đấu. | [PowerUpManager.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/engine/PowerUpManager.ts) sinh lẫn `damage_aura` & hộp `speed`; nhặt chỉ bật vòng `50px` di chuyển theo người **không sơn chiếm bất kỳ ô đất nào**! | **SAI CƠ CHẾ HOÀN TOÀN** -> Làm lại `BlastOrb`: kích hoạt sóng xung kích nở to tại tâm nhặt, sơn chiếm ô theo bán kính dãn nở theo từng tick + giết địch trong sóng! |
| **4. Ăn đất khi đi ngang đất địch (`Carve`)** | Frame `0235`: Khi phi ngang qua vùng đất vàng của đối thủ (`QuarterAnimal`), nhân vật chỉ vẽ **vệt đuôi viền trắng đè lên mặt đất địch** — CHƯA ăn đất ngay dọc đường đi cho tới khi khép vòng quay về lãnh thổ mình hoặc nổ Orb! | [GameEngine.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/engine/GameEngine.ts) tự động khoét bán kính `1` ô đất địch trực tiếp dưới chân khi đang đi qua. | **Lệch luật** -> Tắt pre-carve trực tiếp trên đất địch; chỉ chiếm toàn bộ vùng (kể cả đất địch nằm trong vòng) khi khép vòng `FloodFill` hoặc từ `BlastOrb` / chuyển đất khi giết địch! |
| **5. Cướp đất khi Hạ gục (`Kill Transfer`)** | Frame `0210 -> 0211`: Hạ gục `Dilar` (`6.95%`), màu cam trên minimap biến mất và `%` người chơi tăng vọt (`25.19% -> 31.96%`), đồng thời nhận **linh thú mini nạn nhân chạy theo đuôi**. | `transferTerritory(victimId, killerId)` đã tồn tại trong [GridMap.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/engine/GridMap.ts#L182) & `TerritoryClaiming.test.ts` pass, nhưng **thiếu hoàn toàn** đàn mini victim pets + banner KO streak! | Bổ sung hàng đợi `capturedMinis[]` và hệ thống tính chuỗi KO (`<= 5s` giữa 2 kill -> `KO ĐÔI / KO BA / CHUỖI KO!`). |
| **6. Điều kiện Thắng & Bản đồ Quốc gia** | Thanh tiến độ đi tới **`100%`** (ngôi sao vương miện); mỗi trận cộng tiến độ `%` vào quốc gia đang chọn (vd `Panama 74%`). Đạt `100%` mở khóa sang quốc gia / châu lục tiếp theo. | [GameEngine.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/engine/GameEngine.ts#L237) thắng sớm ở `60.0%`; [WorldScreen.ts](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/src/ui/screens/WorldScreen.ts#L51) mở sẵn hết châu lục bằng `|| true`. | Đưa ngưỡng thắng chinh phục bản đồ chuẩn hoặc cấu hình đúng tiến độ `%` tích lũy quốc gia (trao đổi lại ngưỡng cụ thể với PO ở mục 3) & bỏ `|| true` ép mở châu lục. |
| **7. Thang Hạng & Đếm Tiến Độ Thành Tựu** | 27 bậc hạng có sao từ `ĐỒNG I` tới `HUYỀN THOẠI III (408.490⭐)`; đếm chính xác số ngày chơi liên tiếp, rương đã mở, quả cầu đã nổ, quốc gia đã xong, power-up đã dùng. | `MetaManager.ts` mới có 7 bậc (`0..3000⭐`) và thiếu các bộ đếm `orbsUsed`, `chestsOpened`, `streakDays`. | Mở rộng `MetaManager` đủ 27 bậc rank + 6 bộ đếm thành tựu đồng bộ với Luồng C (`100 skins`). |

---

## 3. Các Điểm Không Hiện Rõ trong Video Cần PO Xác nhận trước khi Code

Theo quy tắc (*"Chỗ nào video không thấy rõ thì giữ theo mô tả của tôi và báo lại cho tôi"*), đây là **4 điểm chi tiết** không xuất hiện đầy đủ trong khung hình của 3 video:

1. **Màn hình sau nút `"Không, cảm ơn"` lúc Game Over (`Video C [02:34]`):** Video dừng quay đúng lúc đang đếm ngược trái tim (`1`) nên chưa thấy màn tổng kết xu/sao sau trận (cộng `+X Xu`, `+Y ⭐`, thanh tiến độ quốc gia tăng lên bao nhiêu trước khi về Nhà). Đề xuất giữ flow: Sau `"Không, cảm ơn"` (hoặc hết 3 giây) -> hiện thẻ tổng kết trận gọn (Xu nhặt được + Thưởng `%` + Sao hạng + Nút `Tiếp tục` về Nhà / tăng `%` quốc gia).
2. **Mốc sao & Top% của `ĐỒNG I` và `ĐỒNG II` (`Video A [00:20]`):** Thanh cuộn mở ngay tại `ĐỒNG III (1588⭐ / Top 91%)` nên không cuộn xuống 2 bậc đáy `ĐỒNG II` và `ĐỒNG I`. Đề xuất nội suy đều theo cấp số nhân từ bậc trên: `ĐỒNG I = 0⭐ (Top 99%)`, `ĐỒNG II = 650⭐ (Top 95%)`, `ĐỒNG III = 1588⭐ (Top 91% - đúng video)`.
3. **Ngưỡng phần trăm Thắng trận (`60%` vs `100%`) và Cách cộng `%` Quốc gia:** Trong video thanh bar có mốc `100%` gắn vương miện ngôi sao, và ở màn Nhà ghi `Panama 74%`. Khi người chơi đạt 35% rồi chết ở trận sau, `%` quốc gia ngoài màn Nhà có cộng dồn / lấy mức cao nhất (`max(cũ, mới)`) không? Cần PO xác nhận:
   - Ngưỡng chiến thắng 1 ván là **100%** (hay vẫn giữ **60%** để đỡ chán trên mobile)?
   - Chỉ số `%` của một quốc gia là **cộng dồn qua nhiều ván** (về tới 100% là hoàn thành nước đó) hay **kỷ lục % cao nhất**?
4. **Dữ liệu Vector Biên giới Các Quốc gia (`World Map`):** Bản hiện tại tự vẽ lục giác đơn giản. Để vẽ 56+ quốc gia thật chuẩn như video (Mỹ, Brazil, Pháp, Việt Nam, Nhật...), **khi làm tới Màn 9 (World Map)** chúng ta có thể dùng file GeoJSON công cộng gọn nhẹ (Natural Earth 110m simplified ~60KB nhúng nội bộ tĩnh, hoàn toàn miễn phí không cần cài thêm thư viện npm). Xin PO xác nhận trước.

---

> **Trạng thái Bước 0:** Đã hoàn tất 100% đo đạc màu `#HEX`, tỉ lệ `%W/%H`, chụp 12 màn hình hiện tại và ghép đủ 15 ảnh đối chiếu tại [audit_comparisons/](file:///c:/Users/Admin/OneDrive/Desktop/paper.io%20adr/audit_comparisons/). Xin PO duyệt báo cáo `FIDELITY_AUDIT.md` và xác nhận 4 điểm ở Mục 3 để Luồng A bắt đầu dựng bộ **Design Tokens** và làm lại từng màn từ Màn 1!
