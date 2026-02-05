# Mini Shop - ระบบ E-commerce สำหรับชุมชน

ระบบร้านค้าออนไลน์สเกลชุมชนที่สมบูรณ์แบบ พร้อมระบบชำระเงิน การจัดส่ง และการจัดการที่ครบครัน

## คุณสมบัติหลัก

### สำหรับลูกค้า
- **หน้าแสดงสินค้า** - ดูสินค้าทั้งหมดที่มีจำหน่าย
- **ระบบตะกร้าสินค้า** - เพิ่ม/ลด/ลบสินค้าได้อย่างง่ายดาย (บันทึกใน LocalStorage)
- **ระบบปักหมุดแผนที่** - ระบุตำแหน่งจัดส่งด้วย Google Maps API
- **คำนวณค่าจัดส่ง** - คำนวณอัตโนมัติตามระยะทาง (Haversine Formula)
- **ระบบ Fallback** - พิมพ์ที่อยู่เองได้หากไม่สามารถใช้แผนที่
- **อัปโหลดสลิป** - อัปโหลดและตรวจสอบสลิปอัตโนมัติด้วย Thunder Solution API
- **ติดตามออเดอร์** - ดูสถานะและรายละเอียดออเดอร์

### สำหรับแอดมิน
- **จัดการออเดอร์** - กรองและอัปเดตสถานะออเดอร์
- **จัดการสินค้า** - เปิด/ปิดการขายสินค้าแต่ละรายการ
- **ตั้งค่าร้าน** - แก้ไขพิกัด, ค่าจัดส่ง, เปิด/ปิดร้าน
- **Activity Logs** - ดูประวัติการทำงานของระบบ

## Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand (cart, user, order stores)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: LINE LIFF (optional) / Supabase Auth
- **Storage**: Supabase Storage (payment slips)
- **Maps**: Google Maps API
- **Payment Verification**: Thunder Solution API
- **Notifications**: LINE Notify (via Edge Function)

## โครงสร้างโปรเจกต์

```
src/
├── api/              # API functions
│   ├── logs.ts
│   ├── notifications.ts
│   ├── orders.ts
│   ├── products.ts
│   ├── store.ts
│   └── thunder.ts
├── components/       # React components
│   ├── CartItem.tsx
│   ├── Layout.tsx
│   ├── MapPicker.tsx
│   ├── OrderCard.tsx
│   └── ProductCard.tsx
├── hooks/           # Custom hooks
│   └── useLiff.ts
├── lib/             # Libraries
│   └── supabase.ts
├── pages/           # Page components
│   ├── AdminPage.tsx
│   ├── CheckoutPage.tsx
│   ├── HomePage.tsx
│   ├── OrdersPage.tsx
│   └── ProfilePage.tsx
├── store/           # Zustand stores
│   ├── cartStore.ts
│   ├── orderStore.ts
│   └── userStore.ts
├── types/           # TypeScript types
│   └── index.ts
├── utils/           # Utility functions
│   ├── distance.ts
│   └── format.ts
├── App.tsx
└── main.tsx

supabase/
└── functions/       # Edge Functions
    └── line-notify/
        └── index.ts
```

## Database Schema

### Tables
1. **profiles** - ข้อมูลผู้ใช้
2. **products** - สินค้า
3. **store_settings** - การตั้งค่าร้าน
4. **orders** - ออเดอร์
5. **order_items** - รายการสินค้าในแต่ละออเดอร์
6. **activity_logs** - ประวัติการทำงาน

### RPC Functions
1. **create_order_with_items** - สร้างออเดอร์พร้อมรายการสินค้า (Atomic Transaction)
2. **verify_payment** - ตรวจสอบและยืนยันการชำระเงิน

## การติดตั้ง

### 1. Clone และติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` และกำหนดค่าต่อไปนี้:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_THUNDER_API_URL=https://api.thunder-solution.com/verify
VITE_LINE_LIFF_ID=your_line_liff_id (optional)
```

### 3. ตั้งค่า Supabase

Database migrations ได้ถูกสร้างไว้แล้วใน Supabase โดยอัตโนมัติ

สิ่งที่ต้องทำเพิ่มเติม:

#### สร้าง Storage Bucket สำหรับสลิปการโอนเงิน

1. ไปที่ Supabase Dashboard > Storage
2. สร้าง bucket ชื่อ `payments`
3. ตั้งค่าเป็น Public bucket
4. กำหนด Storage policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payments');

-- Allow public to view
CREATE POLICY "Allow public to view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payments');
```

#### ตั้งค่า Store Settings

เข้าไปที่ตาราง `store_settings` และอัปเดตข้อมูล:

```sql
UPDATE store_settings SET
  store_name = 'ชื่อร้านของคุณ',
  store_latitude = 13.7563,  -- ละติจูดร้าน
  store_longitude = 100.5018, -- ลองจิจูดร้าน
  shipping_rate_per_km = 10.00,
  flat_rate_shipping = 50.00,
  free_shipping_distance = 3.00,
  line_notify_token = 'your_line_notify_token',
  thunder_api_key = 'your_thunder_api_key',
  is_store_open = true
WHERE id = '00000000-0000-0000-0000-000000000001';
```

#### สร้าง Admin User

```sql
-- อัปเดต role ของ user เป็น admin
UPDATE profiles
SET role = 'admin'
WHERE id = 'user_id_here';
```

### 4. รัน Development Server

```bash
npm run dev
```

### 5. Build สำหรับ Production

```bash
npm run build
```

## ระบบการทำงาน

### การสั่งซื้อสินค้า (Customer Flow)

1. **เลือกสินค้า** - ลูกค้าเลือกสินค้าและเพิ่มลงตะกร้า
2. **Checkout** - กดดำเนินการต่อ
3. **ระบุตำแหน่ง** - ใช้ GPS หรือพิมพ์ที่อยู่เอง
4. **คำนวณค่าจัดส่ง** - ระบบคำนวณอัตโนมัติ
5. **ยืนยันคำสั่งซื้อ** - ตรวจสอบรายการและยืนยัน
6. **อัปโหลดสลิป** - อัปโหลดสลิปการโอนเงิน
7. **ตรวจสอบสลิป** - ระบบตรวจสอบด้วย Thunder API อัตโนมัติ
8. **รอจัดส่ง** - ร้านค้าดำเนินการจัดส่ง

### การจัดการออเดอร์ (Admin Flow)

1. **รับแจ้งเตือน** - LINE Notify แจ้งออเดอร์ใหม่
2. **ตรวจสอบออเดอร์** - ดูรายละเอียดในหน้า Admin
3. **กรองออเดอร์** - กรองตามสถานะ (Paid, Shipping, etc.)
4. **อัปเดตสถานะ** - เปลี่ยนสถานะออเดอร์
5. **จัดการสินค้า** - เปิด/ปิดการขายสินค้า
6. **ดู Activity Logs** - ตรวจสอบประวัติการทำงาน

## การคำนวณค่าจัดส่ง

### แบบที่ 1: คำนวณจากระยะทาง (มีพิกัดร้าน)

```typescript
distance = Haversine(store_lat, store_lng, customer_lat, customer_lng)
shipping_fee = distance <= free_shipping_distance ? 0 : distance * rate_per_km
```

### แบบที่ 2: ค่าจัดส่งเหมา (ไม่มีพิกัดร้านหรือลูกค้าพิมพ์ที่อยู่เอง)

```typescript
shipping_fee = flat_rate_shipping
```

## การตรวจสอบสลิป (Thunder Solution API)

เมื่อลูกค้าอัปโหลดสลิป ระบบจะ:

1. อัปโหลดภาพไปยัง Supabase Storage
2. ส่ง URL ไปยัง Thunder API เพื่อตรวจสอบ
3. ตรวจสอบเงื่อนไข:
   - ยอดเงินตรงกับยอดสั่งซื้อ (±0.01 บาท)
   - สถานะการโอน = success
   - `trans_ref` ไม่ซ้ำกับออเดอร์อื่น
4. หากผ่านทุกเงื่อนไข: อัปเดตสถานะเป็น "paid"
5. หากไม่ผ่าน: แจ้งเตือนลูกค้าและตั้งสถานะ "problem"

## Security Features

- **Row Level Security (RLS)** - ทุก table มี RLS policies
- **Atomic Transactions** - การสร้างออเดอร์เป็น transaction เดียว
- **Payment Verification** - ตรวจสอบสลิปทุกครั้ง
- **Duplicate Prevention** - ป้องกันสลิปซ้ำด้วย `trans_ref`
- **Activity Logging** - บันทึกทุก action สำคัญ

## LINE Integration

### LINE LIFF (Optional)

หากต้องการใช้ LINE Login:

1. สร้าง LIFF App ใน LINE Developers Console
2. เพิ่ม `VITE_LINE_LIFF_ID` ใน `.env`
3. ระบบจะใช้ LINE Profile อัตโนมัติ

หากไม่ใช้ LIFF: ระบบจะใช้ Supabase Auth แทน

### LINE Notify

1. สร้าง LINE Notify Token
2. เพิ่ม token ใน `store_settings.line_notify_token`
3. ระบบจะส่งแจ้งเตือนเมื่อมีออเดอร์ใหม่/การชำระเงินใหม่

## Edge Functions

### line-notify

รับส่งการแจ้งเตือนผ่าน LINE Notify API

**Endpoint**: `${SUPABASE_URL}/functions/v1/line-notify`

**Request Body**:
```json
{
  "token": "LINE_NOTIFY_TOKEN",
  "message": "ข้อความที่ต้องการส่ง",
  "imageUrl": "URL รูปภาพ (optional)"
}
```

## การทดสอบ

1. เพิ่มสินค้าลงตะกร้า
2. ทดสอบการ Checkout ด้วยตำแหน่งจริง
3. ทดสอบการ Checkout แบบพิมพ์ที่อยู่เอง
4. อัปโหลดสลิปทดสอบ
5. ทดสอบการกรองออเดอร์ในหน้า Admin
6. ทดสอบการเปิด/ปิดสินค้า
7. ตรวจสอบ Activity Logs

## Production Checklist

- [ ] ตั้งค่า Environment Variables ทั้งหมด
- [ ] สร้าง Storage Bucket และตั้งค่า Policies
- [ ] อัปเดต Store Settings ให้ครบถ้วน
- [ ] เพิ่ม Admin User
- [ ] ทดสอบการสั่งซื้อจริง
- [ ] ทดสอบการตรวจสอบสลิป
- [ ] ทดสอบการแจ้งเตือน LINE
- [ ] ตรวจสอบ RLS Policies
- [ ] รัน `npm run build` และทดสอบ Production build

## Troubleshooting

### ปัญหาที่พบบ่อย

**Q: ไม่สามารถเข้าสู่ระบบได้**
- ตรวจสอบว่ามี user ในตาราง `profiles` หรือไม่
- ตรวจสอบ LIFF ID หรือใช้ระบบ fallback

**Q: สลิปไม่ผ่านการตรวจสอบ**
- ตรวจสอบ Thunder API key
- ตรวจสอบยอดเงินในสลิปว่าตรงกับยอดสั่งซื้อ
- ตรวจสอบว่าสลิปไม่ได้ถูกใช้ซ้ำ

**Q: ไม่ได้รับ LINE notification**
- ตรวจสอบ LINE Notify token
- ตรวจสอบว่า Edge Function deploy แล้ว
- ดู logs ใน Supabase Dashboard

**Q: แผนที่ไม่โหลด**
- ตรวจสอบ Google Maps API key
- ตรวจสอบ API quota
- ระบบจะ fallback ไปใช้พิมพ์ที่อยู่เองอัตโนมัติ

## License

MIT License

## Support

หากพบปัญหาหรือมีคำถาม กรุณาติดต่อผู้พัฒนา
