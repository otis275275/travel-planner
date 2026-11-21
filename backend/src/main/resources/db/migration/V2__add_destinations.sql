-- ============================================================
-- V2__add_destinations.sql — Destinations Table & Seed Data
-- ============================================================

CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

CREATE TABLE destinations (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id           VARCHAR(255) NOT NULL UNIQUE,  -- slug: "phan-thiet-binh-thuan"
    name               VARCHAR(100) NOT NULL,
    state              VARCHAR(100),                  -- Province / State (e.g. "Lào Cai", "Bình Thuận")
    country            VARCHAR(100) DEFAULT 'Việt Nam', -- Country
    summary            TEXT,
    pros               TEXT[],
    cons               TEXT[],
    best_time_to_visit VARCHAR(100),
    specialty_dishes   TEXT[],                        -- AI-generated local food
    estimated_budget   VARCHAR(100),                  -- AI-generated cost range
    theme_tags         TEXT[],
    photo_urls         TEXT[],                        -- from Unsplash
    latitude           DOUBLE PRECISION,
    longitude          DOUBLE PRECISION,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_destinations_place_id ON destinations(place_id);
CREATE INDEX idx_destinations_tags     ON destinations USING GIN (theme_tags);

-- Curated seed data (6 popular destinations with high-res Unsplash photos)
INSERT INTO destinations
  (place_id, name, state, country, theme_tags, summary, best_time_to_visit,
   pros, cons, specialty_dishes, estimated_budget,
   photo_urls, latitude, longitude)
VALUES
(
  'sa-pa-lao-cai', 'Sa Pa', 'Lào Cai', 'Việt Nam',
  ARRAY['Thiên nhiên','Chụp ảnh','Núi'],
  'Sa Pa là thị trấn mù sương nằm trên dãy Hoàng Liên Sơn, nổi tiếng với ruộng bậc thang tuyệt đẹp và văn hóa dân tộc thiểu số phong phú. Vào mùa lúa chín, những thửa ruộng vàng óng trải dài tạo nên khung cảnh như tranh vẽ. Đây cũng là điểm khởi đầu lý tưởng để chinh phục đỉnh Fansipan, nóc nhà của Đông Dương.',
  'Tháng 9 – 11 (lúa chín)',
  ARRAY['Phong cảnh ruộng bậc thang tuyệt đẹp','Khí hậu mát mẻ quanh năm','Văn hóa H''Mông đặc sắc'],
  ARRAY['Dễ đông đúc vào cuối tuần','Đường lên dốc, khó di chuyển'],
  ARRAY['Thắng cố','Cơm lam','Cá hồi nướng'],
  '1.500.000 – 3.000.000 ₫/người/ngày',
  ARRAY[
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'
  ],
  22.3364, 103.8438
),
(
  'da-nang', 'Đà Nẵng', 'Đà Nẵng', 'Việt Nam',
  ARRAY['Biển','Ẩm thực','Thành phố'],
  'Đà Nẵng là thành phố biển năng động với những bãi biển cát trắng dài và ẩm thực đường phố phong phú. Thành phố nằm ở vị trí trung điểm của đất nước, thuận tiện ghé thăm Hội An và Huế. Ban đêm, cầu Rồng phun lửa và nước trở thành biểu tượng không thể bỏ qua.',
  'Tháng 3 – 8 (khô ráo)',
  ARRAY['Bãi biển Mỹ Khê nổi tiếng thế giới','Ẩm thực đa dạng','Cơ sở hạ tầng hiện đại'],
  ARRAY['Nắng gắt vào mùa hè','Mưa lớn tháng 10-11'],
  ARRAY['Mì Quảng','Bánh mì Đà Nẵng','Bún chả cá'],
  '1.200.000 – 2.500.000 ₫/người/ngày',
  ARRAY[
    'https://images.unsplash.com/photo-1564596823821-79b87b89e6a8?w=1200',
    'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200',
    'https://images.unsplash.com/photo-1533900534-52c9e1b8be36?w=1200'
  ],
  16.0545, 108.2022
),
(
  'phu-quoc-kien-giang', 'Phú Quốc', 'Kiên Giang', 'Việt Nam',
  ARRAY['Biển','Thiên nhiên','Nghỉ dưỡng'],
  'Phú Quốc là đảo ngọc phía Tây Nam với bãi biển trong vắt và rừng nguyên sinh được UNESCO công nhận. Hòn đảo nổi danh với nước mắm truyền thống và hoàng hôn tuyệt đẹp ở Dinh Cậu. Cáp treo Hòn Thơm là cáp treo vượt biển dài nhất thế giới.',
  'Tháng 11 – 4 (mùa khô)',
  ARRAY['Biển xanh trong vắt','Resort 5 sao chất lượng cao','Hoạt động lặn biển phong phú'],
  ARRAY['Giá cao hơn đất liền','Mưa nhiều tháng 5-10'],
  ARRAY['Gỏi cá trích','Nhum biển nướng','Bún quậy Phú Quốc'],
  '2.000.000 – 5.000.000 ₫/người/ngày',
  ARRAY[
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200',
    'https://images.unsplash.com/photo-1589394815349-6d5b12c17099?w=1200',
    'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1200'
  ],
  10.2899, 103.9840
),
(
  'hoi-an-quang-nam', 'Hội An', 'Quảng Nam', 'Việt Nam',
  ARRAY['Lịch sử','Ẩm thực','Chụp ảnh'],
  'Hội An là phố cổ được UNESCO công nhận với những ngôi nhà rêu phong và đèn lồng rực rỡ. Thành phố giữ gìn kiến trúc thương cảng cổ xưa hơn 500 năm như một bảo tàng sống. Mỗi đêm rằm, phố cổ tắt điện thắp đèn lồng tạo không gian huyền diệu khó quên.',
  'Tháng 2 – 4 (ít mưa)',
  ARRAY['Di sản UNESCO độc đáo','Ẩm thực nổi tiếng cả nước','Gần biển Cửa Đại'],
  ARRAY['Đông khách du lịch','Nóng vào mùa hè'],
  ARRAY['Cao lầu','Mì Quảng','Bánh mì Phượng','Hoành thánh'],
  '800.000 – 2.000.000 ₫/người/ngày',
  ARRAY[
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
    'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=1200',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200'
  ],
  15.8801, 108.3380
),
(
  'ha-noi', 'Hà Nội', 'Hà Nội', 'Việt Nam',
  ARRAY['Lịch sử','Ẩm thực','Thành phố'],
  'Hà Nội là thủ đô nghìn năm văn hiến với kiến trúc Pháp thuộc, đền chùa cổ kính và hồ Hoàn Kiếm thơ mộng. Phố cổ 36 phường nghề gìn giữ hơi thở Hà Nội xưa giữa lòng đô thị hiện đại. Ẩm thực đường phố Hà Nội được CNN bình chọn là một trong những điểm ăn đường phố tốt nhất thế giới.',
  'Tháng 10 – 12 (mát mẻ)',
  ARRAY['Trung tâm văn hóa lịch sử','Ẩm thực đường phố đỉnh cao','Nhiều bảo tàng, di tích'],
  ARRAY['Kẹt xe giờ cao điểm','Ô nhiễm không khí'],
  ARRAY['Phở Hà Nội','Bún chả','Chả cá Lã Vọng','Bún riêu'],
  '700.000 – 1.800.000 ₫/người/ngày',
  ARRAY[
    'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1200',
    'https://images.unsplash.com/photo-1571989804257-4d8b3f84b5e1?w=1200',
    'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=1200'
  ],
  21.0285, 105.8542
),
(
  'ninh-binh', 'Ninh Bình', 'Ninh Bình', 'Việt Nam',
  ARRAY['Thiên nhiên','Chụp ảnh','Lịch sử'],
  'Ninh Bình được mệnh danh là "Hạ Long trên cạn" với những dãy núi đá vôi hùng vĩ và dòng sông uốn lượn qua hang động. Tràng An là di sản hỗn hợp tự nhiên - văn hóa đầu tiên của Đông Nam Á được UNESCO công nhận. Cố đô Hoa Lư gắn liền với các triều đại Đinh, Lê trong lịch sử dân tộc.',
  'Tháng 4 – 6 (ấm, ít mưa)',
  ARRAY['Cảnh quan thiên nhiên tráng lệ','Gần Hà Nội (2 giờ)','Vé vào cửa hợp lý'],
  ARRAY['Di chuyển trong khu vực khó','Ít hoạt động về đêm'],
  ARRAY['Cơm cháy Ninh Bình','Dê núi','Mắm tép Gia Viễn'],
  '600.000 – 1.500.000 ₫/người/ngày',
  ARRAY[
    'https://images.unsplash.com/photo-1559739117-b4b5e4e6e23b?w=1200',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200',
    'https://images.unsplash.com/photo-1520222984843-df35ebc0f24d?w=1200'
  ],
  20.2539, 105.9750
);

