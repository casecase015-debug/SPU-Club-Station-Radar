# 📡 SPU Club Station Radar (ISS Tracker)

ระบบเรดาร์จำลองสำหรับฐานปฏิบัติการ ชมรมวิทยุสมัครเล่น มหาวิทยาลัยศรีปทุม (Sripatum University Amateur Radio Club) ระบบนี้พัฒนาขึ้นเพื่อแสดงพิกัด ทิศทาง และระยะทางของสถานีอวกาศนานาชาติ (ISS) แบบ Real-time บนหน้าจอ UI รูปแบบเรดาร์

## ✨ Features (คุณสมบัติเด่น)
* **Real-time Tracking:** ดึงข้อมูลพิกัดของ ISS ผ่าน Public API แบบสดๆ
* **Server-Sent Events (SSE):** ส่งข้อมูลจาก Backend ไปยัง Frontend อย่างต่อเนื่องโดยไม่ต้องรีเฟรชหน้าเว็บ
* **Dynamic Radar UI:** หน้าจอเรดาร์สไตล์ศูนย์บัญชาการ สร้างด้วย HTML5 Canvas และ CSS Animations
* **Bearing & Distance Calculation:** คำนวณระยะห่าง (กิโลเมตร) และทิศทาง (องศา) เทียบกับพิกัดที่ตั้งของมหาวิทยาลัยศรีปทุมโดยอัตโนมัติ

## 🛠️ Tech Stack (เครื่องมือที่ใช้พัฒนา)
* **Backend:** Python 3, Flask
* **Frontend:** HTML5, CSS3, JavaScript (Canvas API)
* **API:** Open-Notify ISS Location API

## 🚀 How to Run (วิธีเปิดใช้งาน)

1. **Clone Repository นี้ลงเครื่อง:**
   ```bash
   git clone [https://github.com/ช](https://github.com/ช)ื่อผู้ใช้ของคุณ/ชื่อโปรเจกต์.git
   cd ชื่อโฟลเดอร์โปรเจกต์
