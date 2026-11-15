# Kế Hoạch ĐỢT 4: Menu Chính & Hệ Thống Meta - Giao Diện Khớp 100% Ảnh Tham Chiếu

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng toàn bộ menu chính và hệ thống meta hoàn chỉnh (Home, Missions, Heroes, Shop, World, Results) khớp 100% với 9 ảnh tham chiếu gốc về bố cục, tỉ lệ, màu sắc, bóng đổ 3D, viền xanh đậm, kiểu chữ và hiệu ứng nhún (scale 0.95), tự vẽ toàn bộ asset SVG nguyên bản, lưu trữ vĩnh viễn không phụ thuộc DOM, có test Vitest.

**Architecture:** 
- Lớp Meta (`src/meta/`): Logic dữ liệu thuần túy (Storage, Currency, Missions, Heroes, Countries, Skins), zero DOM dependencies, kiểm thử 100% bằng Vitest.
- Lớp Dữ liệu tĩnh (`src/meta/data/`): `countries.json` (56 quốc gia/vùng trên 7 châu lục), `heroes.json` (6 heroes với stats & nâng cấp), `missions.json` (hàng ngày & trọn đời), `skins.json` (100 skins 4 cấp độ hiếm).
- Lớp UI DOM/CSS (`src/ui/`): Overlay nằm trên Canvas 2D, phong cách Paper.io 2 hoạt hình tươi sáng (Sky Blue `#1890FF`, viền `#1A3B8B` 3-4px, bóng 3D 4-6px, bo góc 18-24px, text shadow đậm viền xanh, icon SVG tự vẽ 100%).
- Khung nhìn chuẩn: Portrait mobile 390x844 (tỉ lệ tương đương ảnh gốc 924x2000) và tương thích 360x800.

**Tech Stack:** TypeScript, Vite, CSS Modules / scoped CSS, SVG vector art tự vẽ, Vitest, Puppeteer-core (chụp & đối chiếu ảnh).

**Spec & Reference Images:**
- Thư mục ảnh tham chiếu: `c:\Users\Admin\OneDrive\Desktop\paper.io adr\reference_screens/` (9 ảnh gốc).
- Luật bản quyền: Tự vẽ lại 100% SVG/code (khối vuông mắt to, rương gỗ vòm, đá quý lục giác hồng, xu vàng, lá cờ, xe chibi), tuyệt đối không chép tài nguyên đồ họa bản quyền của Voodoo.

## Global Constraints
- Khung nhìn chuẩn di động: 390x844 (chụp và đối chiếu trực quan sau mỗi màn hình).
- Mọi con số cấu hình đặt trong `config.ts` hoặc các file JSON.
- Logic meta đặt trong `src/meta/`, không phụ thuộc DOM, có test Vitest.
- Giao diện DOM/CSS mượt mà, nút bấm có hiệu ứng squash (`scale(0.95)` khi bấm + âm thanh hook).
- Hỏi ý kiến người dùng trước khi cài đặt package font mới (hiện tại dùng font hệ thống đậm bo tròn làm fallback).

---

### Task 1: Dữ Liệu Tĩnh JSON (Countries, Heroes, Missions, Skins)

**Files:**
- Create: `src/meta/data/countries.json`
- Create: `src/meta/data/heroes.json`
- Create: `src/meta/data/missions.json`
- Create: `src/meta/data/skins.json`
- Test: `tests/meta/StaticData.test.ts`

**Interfaces:**
- Produces: 
  - `CountryData[]` (56 quốc gia thuộc 7 lục địa: Châu Á, Châu Âu, Châu Phi, Bắc Mỹ, Nam Mỹ, Châu Đại Dương, Nam Cực; mỗi nước gồm id, name, continent, targetPercent, flagSvg/colors, difficulty).
  - `HeroData[]` (6 heroes: Dash, Shield, Magnet, Pulse, Wide Trail, Grow; gồm id, name, rarity, maxLevel, cardsReq, baseStats, abilityDesc, iconSvg).
  - `MissionsConfig` (daily mission pools, lifetime milestone tiers, rewards).
  - `SkinData[]` (100 skins chia 4 độ hiếm: Common, Rare, Epic, Legendary, gồm id, name, rarity, primaryColor, pattern, eyeStyle, priceCoins, priceGems).

- [ ] **Step 1: Viết test kiểm tra cấu trúc dữ liệu tĩnh**
- [ ] **Step 2: Chạy test xác nhận FAIL (chưa có file dữ liệu)**
- [ ] **Step 3: Tạo `countries.json` (56 nước, 7 châu lục, gồm Nicaragua làm nước khởi đầu)**
- [ ] **Step 4: Tạo `heroes.json` (6 heroes cân bằng chỉ số và kỹ năng)**
- [ ] **Step 5: Tạo `missions.json` (Daily nhiệm vụ quay vòng + Lifetime 5 cột mốc lớn)**
- [ ] **Step 6: Tạo `skins.json` (100 skins độc đáo phân loại 4 nhóm hiếm)**
- [ ] **Step 7: Chạy test xác nhận PASS 100%**

---

### Task 2: Meta Storage & State Manager (`src/meta/`)

**Files:**
- Create: `src/meta/storage.ts`
- Create: `src/meta/MetaManager.ts`
- Create: `src/meta/types.ts`
- Test: `tests/meta/MetaManager.test.ts`

**Interfaces:**
- Produces:
  - `MetaManager`: Quản lý Coins, Gems, Trophies, Rank ("Đồng II 1090"), Active Country, Conquered %, Active Skin/Hero, Hero Card Inventory, Daily Mission Status, Settings (Audio/Music/Vibration).
  - Persistence qua `localStorage` (có memory fallback cho môi trường test/node), migration phiên bản an toàn.

- [ ] **Step 1: Viết test cho MetaManager (thêm coin, gem, mở hero, tăng tiến độ nước, nhận thưởng)**
- [ ] **Step 2: Chạy test xác nhận FAIL**
- [ ] **Step 3: Viết `storage.ts` với Safe Storage Engine có fallback & versioning**
- [ ] **Step 4: Viết `MetaManager.ts` cài đặt toàn bộ business logic kinh tế và nhiệm vụ**
- [ ] **Step 5: Chạy test xác nhận PASS 100%**

---

### Task 3: Hệ Thống Giao Diện Nền & Thư Viện SVG Nguyên Bản (`src/ui/`)

**Files:**
- Create: `src/ui/theme.css`
- Create: `src/ui/svgIcons.ts`
- Create: `src/ui/uiSound.ts`
- Test: `tests/ui/SvgIcons.test.ts`

**Interfaces:**
- Produces:
  - CSS Design Tokens: Bảng màu chuẩn ảnh tham chiếu (`#1890FF`, `#1E3799`, `#FFD200`, `#2ED573`, `#FF4757`, `#A55EEA`), bo góc 18-24px, viền 3-4px xanh đậm, bóng đổ 3D bevel 4-6px, text stroke/shadow.
  - Bộ icon SVG tự vẽ 100%: Coin vàng lấp lánh, Hex Gem hồng, Rương báu gỗ vòm có dây đai sắt, Bánh răng cài đặt, Cúp vàng/Ngôi sao, Khóa trắng, Dấu tích xanh, Quả địa cầu 3D, Mái che sọc trắng đỏ/xanh, Cờ các nước.
  - Hiệu ứng squash cảm ứng (`active: scale(0.95)` + Web Audio click/pop sound nhẹ).

- [ ] **Step 1: Viết test render SVG icon hợp lệ (chuỗi SVG hợp lệ, viewBox chuẩn)**
- [ ] **Step 2: Tạo `theme.css` thiết lập toàn bộ biến giao diện, animation nhún, gradient nền trời và bóng 3D**
- [ ] **Step 3: Viết `svgIcons.ts` chứa toàn bộ vector assets nguyên bản chuẩn phong cách**
- [ ] **Step 4: Viết `uiSound.ts` tạo âm thanh Web Audio tự sinh không cần file mp3 ngoài**
- [ ] **Step 5: Chạy test xác nhận PASS**

---

### Task 4: Khung Điều Hướng Dùng Chung (Top Bar & Bottom Navigation)

**Files:**
- Create: `src/ui/NavFrame.ts`
- Modify: `src/ui/theme.css`
- Modify: `src/main.ts`

**Interfaces:**
- Produces:
  - `NavFrame`: Component quản lý Top Bar cố định và Bottom Bar 5 Tab.
  - Top Bar: Avatar tròn góc trái, Viên thuốc Xu vàng (`10,51K` + nút `+` xanh), Viên thuốc Đá quý hồng (`44` + nút `+` xanh), Nút Cài đặt tròn góc phải.
  - Bottom Bar: 5 tab (Shop, Heroes, Home, Missions, World) với tab active nâng cao dạng thẻ xanh nổi bật, nhãn chữ trắng viền đậm bên dưới, chấm đỏ thông báo '!' trên Heroes và Missions khi có quà.

- [ ] **Step 1: Viết component `NavFrame.ts` kết nối với `MetaManager`**
- [ ] **Step 2: Gắn `NavFrame` vào DOM bên trên canvas game**
- [ ] **Step 3: Thiết lập routing chuyển đổi mượt giữa 5 màn hình**
- [ ] **Step 4: Chụp ảnh headless 390x844 kiểm tra tỉ lệ khung điều hướng**

---

### Task 5: Màn Hình 1 - MÀN HÌNH NHÀ (Home Screen)

**Files:**
- Create: `src/ui/screens/HomeScreen.ts`
- Create: `src/ui/components/FloatingIsland3D.ts`
- Modify: `src/ui/NavFrame.ts`

**Interfaces:**
- Produces:
  - Bố cục khớp 100% với ảnh gốc `1794278295307_...cb5802b8...jpg`:
    - Banner phía trên: Tên quốc gia "NICARAGUA", cờ Nicaragua nghiêng 3D, viên thuốc tiến độ "63%".
    - Trung tâm: Lát cắt đảo quốc gia 3D nổi trên nền trời, bề mặt có phần đất xanh ngọc của người chơi + phần trắng chưa chiếm, đổ bóng giấy cắt 3D.
    - Nhân vật khối tròn/xe chibi đứng trên đảo.
    - Nút "CHƠI" vàng rực khổng lồ ở giữa dưới đảo, có viền 3D bevel dày, phía trên có bóng thoại xanh lá "Bắt đầu x5 Lớn hơn".
    - Nút trái: Thẻ xanh "SẮP RA MẮT" kèm biểu tượng ổ khóa.
    - Nút phải: Thẻ đồng "ĐỒNG II" với thanh tiến độ sao "(1090)".
- [ ] **Step 1: Xây dựng `FloatingIsland3D.ts` vẽ lát cắt lãnh thổ 3D bằng Canvas/CSS 3D**
- [ ] **Step 2: Hoàn thiện toàn bộ layout và các nút của `HomeScreen.ts`**
- [ ] **Step 3: Chụp ảnh màn hình 390x844 bằng Puppeteer**
- [ ] **Step 4: Tự đối chiếu từng pixel với ảnh tham chiếu 1, chỉ ra điểm lệch và tinh chỉnh CSS đến khi khớp 100%**
- [ ] **Step 5: DỪNG lại, hiển thị ảnh đối chiếu cho người dùng kiểm tra**

---

### Task 6: Màn Hình 2 - MÀN HÌNH NHIỆM VỤ (Missions Screen)

**Files:**
- Create: `src/ui/screens/MissionsScreen.ts`

**Interfaces:**
- Produces:
  - Bố cục khớp 100% với ảnh gốc `1794278295369_...c4f0333f...jpg` và `1794278295391_...0bebb164...jpg`:
    - Tab chuyển đổi: "Hàng ngày" vs "Trọn đời".
    - Tab Hàng ngày:
      - Đếm ngược: "Nhiệm vụ mới sau 14g 31p" kèm icon đồng hồ.
      - Thẻ Rương Báu trên bệ đá có hào quang tỏa tia, viên thuốc đếm "2/3", nút Mở quà rực rỡ.
      - Danh sách 3 thẻ nhiệm vụ ngày: Thanh tiến độ bo tròn ("0/15"), huy hiệu 250 xu, nút Nhận xanh lá khi hoàn thành.
    - Tab Trọn đời:
      - Danh sách 5 thẻ cột mốc lớn (Chơi 75 trận, Hạ 300, Mở 10 nước, Thu thập 20 trang phục...), thưởng 500 sao, thanh tiến độ xanh lá đậm.
- [ ] **Step 1: Viết `MissionsScreen.ts` kết nối trực tiếp tiến độ từ `MetaManager`**
- [ ] **Step 2: Chụp ảnh 390x844 tab Hàng ngày & tab Trọn đời**
- [ ] **Step 3: Tự đối chiếu với ảnh tham chiếu 3 và 4, sửa lỗi căn chỉnh, viền, khoảng cách**
- [ ] **Step 4: DỪNG lại, hiển thị ảnh cho người dùng kiểm tra**

---

### Task 7: Màn Hình 3 - MÀN HÌNH ANH HÙNG (Heroes Screen)

**Files:**
- Create: `src/ui/screens/HeroesScreen.ts`
- Create: `src/ui/components/HeroDetailModal.ts`

**Interfaces:**
- Produces:
  - Bố cục khớp 100% với ảnh gốc `1794278295413_...766d7f35...jpg`:
    - Dải ruy băng lượn sóng màu xanh biển: "Phổ biến 1/7".
    - Lưới thẻ 3 cột:
      - Thẻ đã mở: Hình avatar hero mắt to đáng yêu, nhãn "MỚI" màu cam nổi bật, thanh nạp thẻ "1/40" màu xanh lá, icon kỹ năng đặc biệt.
      - Thẻ bị khóa: Hình mờ có ổ khóa trắng nổi khối, thanh gom mảnh thẻ "0/20".
      - Nút sắp xếp/lọc hero.
    - Popup chi tiết Hero khi nhấn: Chỉ số Tốc độ, Quay xe, Vệt vẽ, Kỹ năng và nút Nâng cấp bằng Xu.
- [ ] **Step 1: Viết `HeroesScreen.ts` và `HeroDetailModal.ts`**
- [ ] **Step 2: Chụp ảnh 390x844**
- [ ] **Step 3: Đối chiếu với ảnh tham chiếu 5, căn chỉnh góc bo, độ dày viền, font chữ**
- [ ] **Step 4: DỪNG lại, hiển thị ảnh cho người dùng kiểm tra**

---

### Task 8: Màn Hình 4 - MÀN HÌNH CỬA HÀNG (Shop Screen)

**Files:**
- Create: `src/ui/screens/ShopScreen.ts`

**Interfaces:**
- Produces:
  - Bố cục khớp 100% với ảnh gốc `1794278295434_...88cde27a...jpg` và `1794278295455_...7dc2a28b...jpg`:
    - Mái che sọc trắng đỏ tươi ở đầu màn hình kèm chữ "CỬA HÀNG" nổi khối.
    - Cuộn dọc mượt gồm 4 khu vực:
      1. Ưu Đãi Đặc Biệt: Banner gói hero giới hạn có đồng hồ đếm lùi ("05n 14g").
      2. Rương Anh Hùng: Rương Phổ biến (20 Gems), Rương Hiếm (50 Gems), Rương Sử thi (150 Gems).
      3. Gói Đá Quý: 20 Gems, 110 Gems, 500 Gems, 1100 Gems (nút test cộng gem ngay).
      4. Gói Xu Vàng: 3.500 Xu (20 Gems), 22.000 Xu (100 Gems), 70.000 Xu (300 Gems), 225.000 Xu (800 Gems).
      5. Trang phục (Skins) độc quyền.
- [ ] **Step 1: Viết `ShopScreen.ts` kết nối mua bán trực tiếp vào `MetaManager`**
- [ ] **Step 2: Chụp ảnh 390x844 các phần của Shop**
- [ ] **Step 3: Đối chiếu với ảnh tham chiếu 6, 7, 8 và tinh chỉnh**
- [ ] **Step 4: DỪNG lại, hiển thị ảnh cho người dùng kiểm tra**

---

### Task 9: Màn Hình 5 - MÀN HÌNH THẾ GIỚI (World Screen)

**Files:**
- Create: `src/ui/screens/WorldScreen.ts`
- Create: `src/ui/components/WorldGlobe3D.ts`

**Interfaces:**
- Produces:
  - Bố cục khớp 100% với ảnh gốc `1794278295345_...8dbe1a1f...jpg`:
    - Bản đồ địa cầu các lục địa nổi 3D phân lớp màu lam đậm và xanh ngọc, các quốc gia đã chinh phục tô xanh lá rực rỡ có cắm cờ.
    - Xe chibi đứng trên quốc gia đang chọn (Nicaragua).
    - Hộp nổi dưới đáy: "Mở khóa NAM MỸ 2/8" với thanh tiến độ lục địa và nút chuyển quốc gia tiếp theo.
- [ ] **Step 1: Viết `WorldGlobe3D.ts` và `WorldScreen.ts`**
- [ ] **Step 2: Chụp ảnh 390x844**
- [ ] **Step 3: Đối chiếu với ảnh tham chiếu 2 và tinh chỉnh**
- [ ] **Step 4: DỪNG lại, hiển thị ảnh cho người dùng kiểm tra**

---

### Task 10: Tích Hợp Game Loop & Màn Hình Kết Quả (Results Screen)

**Files:**
- Create: `src/ui/screens/ResultScreen.ts`
- Modify: `src/main.ts`
- Test: `tests/integration/MetaGameLoop.test.ts`

**Interfaces:**
- Produces:
  - Khi chết hoặc đạt 100%: Hiện `ResultScreen` với thanh chạy % đất, số kill, cộng xu, cộng cúp xếp hạng, tích lũy vào quốc gia hiện tại trong `MetaManager`.
  - Nút "CHƠI LẠI" (vào ngay ván mới) và "TRANG CHỦ" (quay lại HomeScreen).
- [ ] **Step 1: Viết `ResultScreen.ts`**
- [ ] **Step 2: Nối `GameEngine` và `MetaManager` trong `main.ts`**
- [ ] **Step 3: Chạy toàn bộ test Vitest (cả engine và meta), đảm bảo 100% pass**
- [ ] **Step 4: Dừng lại báo cáo hoàn thành toàn diện cho người dùng**

---

