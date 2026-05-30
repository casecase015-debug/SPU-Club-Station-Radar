const canvas = document.getElementById('radarCanvas');
const ctx = canvas.getContext('2d');
const telemetryData = document.getElementById('telemetryData');

// ตั้งค่าขนาดหน้าจอเรดาร์ให้คงที่สวยงาม
canvas.width = 500;
canvas.height = 500;

const cx = canvas.width / 2;
const cy = canvas.height / 2;
const maxRadius = 240;
let angle = 0;
let satellites = [];

// ฟังก์ชันอัปเดตนาฬิกาให้วิ่งแบบ Real-Time
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    // อัปเดตเวลาลงส่วนต่างๆ ถ้ามี element รองรับ
}

// ฟังก์ชันวาดเส้นเป้าเรดาร์สีเขียว
function drawRadarBackground() {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    
    // วาดวงกลมรัศมีชั้นต่างๆ
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * (i / 3), 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // วาดเส้นกากบาทแกน Azimuth
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.stroke();
}

// ฟังก์ชันวาดลำแสงเรดาร์หมุน (Sweep)
function drawSweep() {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    
    let gradient = ctx.createLinearGradient(0, 0, maxRadius, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0.4)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, -Math.PI / 6, 0);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();
    
    angle += 0.02;
}

// ฟังก์ชันวาดจุดพิกัดดาวเทียมบนจอเรดาร์
function drawSatellites() {
    satellites.forEach(sat => {
        if (sat.elevation > 0) {
            // แปลงค่า Azimuth และ Elevation เป็นพิกัด X, Y บนจอเรดาร์ (Polar Coords)
            const r = maxRadius * ((90 - sat.elevation) / 90);
            const theta = (sat.azimuth - 90) * (Math.PI / 180);
            const x = cx + r * Math.cos(theta);
            const y = cy + r * Math.sin(theta);
            
            // วาดเป้าดาวเทียม
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // เขียนชื่อกำกับดาวเทียม
            ctx.fillStyle = '#00ff00';
            ctx.font = '12px Courier New';
            ctx.fillText(sat.name, x + 10, y + 4);
        }
    });
}

// 📡 ฟังก์ชันหลัก: ดึงข้อมูลพิกัด Telemetry จากหลังบ้าน (Python Flask API)
async function fetchTelemetry() {
    try {
        // ดึงข้อมูลแบบ Relative Path ปลอดภัยและรองรับ Render 100%
        const response = await fetch('/api/satellites');
        satellites = await response.json();
        
        // ล้างข้อมูลเก่าในตารางออกก่อนเพื่อเตรียมหยอดข้อมูลใหม่
        telemetryData.innerHTML = '';
        
        satellites.forEach(sat => {
            const row = document.createElement('tr');
            
            // คัดกรองสถานะและสีสันให้สวยงามตามแบบฉบับหน้าจอ SOC
            let statusText = sat.elevation > 0 ? 'IN_PASS' : 'BELOW_HORIZON';
            let statusClass = sat.elevation > 0 ? 'alert' : 'danger';
            
            // ยิงข้อมูลใส่แถวตารางคู่กับตัวแปรที่รับมาจาก Python หลังบ้าน
            row.innerHTML = `
                <td><strong>${sat.name}</strong></td>
                <td>${sat.azimuth.toFixed(1)}°</td>
                <td>${sat.elevation.toFixed(1)}°</td>
                <td>${Math.round(sat.range_km)}km</td>
                <td>${sat.doppler_khz.toFixed(2)}kHz</td>
                <td class="${statusClass}">${statusText}</td>
            `;
            
            // แปะแถวข้อมูลลงในตารางหลักอย่างถูกต้อง ปลอดภัย ไม่เบี้ยวแน่นอน
            telemetryData.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching telemetry data:", error);
    }
}

// ฟังก์ชัน Loop รันกราฟิกเรดาร์ (60 FPS)
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRadarBackground();
    drawSweep();
    drawSatellites();
    requestAnimationFrame(animate);
}

// สั่งให้ระบบเริ่มทำงานทั้งหมดเมื่อโหลดหน้าจอ
animate();
setInterval(updateClock, 1000);
setInterval(fetchTelemetry, 1000); // อัปเดตข้อมูลพิกัดสดๆ ทุกๆ 1 วินาที
updateClock();
fetchTelemetry();
