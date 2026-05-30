# 🛰️ SPU SATELLITE OPERATIONS CENTER (SOC)
ระบบจำลองสถานีภาคพื้นดินเพื่อติดตามตำแหน่งและคำนวณความถี่ดาวเทียมแบบ Real-Time (Satellite Ground Station Tracking & Telemetry Simulator) พัฒนาขึ้นเพื่อจำลองการรับสัญญาณจากดาวเทียมวิทยุสมัครเล่นย่าน UHF ผ่านพิกัดสถานีภาคพื้นดิน

🌐 **Live Demo:** [https://spu-satellite-ops.onrender.com/](https://spu-satellite-ops.onrender.com/)

---

## 📡 วัตถุประสงค์ของโปรเจกต์ (Project Objectives)
* **Real-Time Tracking Simulation:** จำลองการคำนวณตำแหน่งองศาดาวเทียม ได้แก่ มุมทิศ (Azimuth) และมุมเงย (Elevation) ของดาวเทียมเมื่อโคจรผ่านสถานี
* **Doppler Shift Calculation:** คำนวณความถี่วิทยุที่เปลี่ยนแปลงไป (Doppler Effect) ตามความเร็วและทิศทางของดาวเทียม เพื่อระบุความถี่จริงที่สถานีภาคพื้นดินต้องใช้ในการรับสัญญาณ
* **Tactical Dashboard Display:** แสดงผลในรูปแบบหน้าจอควบคุมดิจิทัลสไตล์เรดาร์ทหาร (Retro-Futuristic Radar) ที่มีความปลอดภัยสูงและอัปเดตข้อมูลสดทุก 1 วินาที

---

## 📻 ดาวเทียมและย่านความถี่วิทยุที่รองรับ (Supported Satellites & Frequencies)
ระบบทำการติดตามดาวเทียมวิทยุสมัครเล่นจำลอง 3 ดวงหลัก ในย่านความถี่ UHF:

1. **ISS (International Space Station)**
   * **ความถี่ศูนย์กลาง (Center Frequency):** `437.800 MHz`
   * **การใช้งาน:** สถานีอวกาศนานาชาติ ใช้สื่อสารวิทยุสมัครเล่น (Voice/APRS) กับนักบินอวกาศ
2. **SO-50 (Saudi-OSCAR 50)**
   * **ความถี่ศูนย์กลาง (Center Frequency):** `436.795 MHz`
   * **การใช้งาน:** ดาวเทียมขนาดเล็ก (Cubesat) ยอดนิยมสำหรับติดต่อสื่อสาร FM Voice ทั่วโลก
3. **IO-86 (Indonesia-OSCAR 86)**
   * **ความถี่ศูนย์กลาง (Center Frequency):** `435.880 MHz`
   * **การใช้งาน:** ดาวเทียมสัญชาติอินโดนีเซีย ให้บริการสัญญาณ FM Voice และ APRS ในภูมิภาคอาเซียน

---

## 💻 โครงสร้างสถาปัตยกรรมระบบ (System Architecture)
โปรเจกต์นี้พัฒนาในรูปแบบ **Full-Stack Web Application** โดยแยกส่วนการทำงานอย่างชัดเจนเพื่อประสิทธิภาพและความปลอดภัย:

### 🧠 1. Backend (Python Flask)
* **`backend/app.py` & `satellite.py`:** ทำหน้าที่เป็นสมองกลคำนวณพิกัดดาราศาสตร์และวงโคจรของดาวเทียมจำลอง รวมถึงคำนวณค่า Doppler Shift ($kHz$) ล่าสุด
* **Secure API Endpoints:** ส่งข้อมูลในรูปแบบ JSON ผ่าน `/api/satellites` โดยมีระบบป้องกันความปลอดภัย (Information Disclosure Protection) บล็อกไม่ให้บุคคลภายนอกเข้าถึงโครงสร้างไฟล์หลังบ้านได้

### 🎨 2. Frontend (HTML5 & CSS3)
* **`frontend/index.html` & `style.css`:** โครงสร้างหน้ากากแผงควบคุม (Dashboard) ออกแบบในธีมสีเขียวเรืองแสงบนพื้นดำ (Matrix/Military Style) 
* **Dual Data Panel:** แยกส่วนแสดงผลฝั่งซ้ายเป็นจอเรดาร์ และฝั่งขวาเป็นตารางคู่ขนานแสดงข้อมูลพิกัด (Live Telemetry) และข้อมูลความถี่วิทยุ (Comm Frequency)

### ⚙️ 3. Engine & Graphics (JavaScript)
* **`frontend/script.js`:** เครื่องยนต์ขับเคลื่อนหน้าบ้าน ทำหน้าที่ Fetch ดึงข้อมูลจาก API มาอัปเดตตารางทุกๆ 1 วินาที
* **HTML5 Canvas Radar:** วาดเส้นกวาดสแกนเรดาร์ (Sweep Beam) และพล็อตจุดตำแหน่งดาวเทียมตามมุมองศาจริงแบบ 60 FPS หมุนเคลื่อนไหวอย่างสมจริง

---

