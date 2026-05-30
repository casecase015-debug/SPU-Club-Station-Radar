const canvas = document.getElementById('radarCanvas');
const ctx = canvas.getContext('2d');
const telemetryData = document.getElementById('telemetryData');
const commData = document.getElementById('commData');

// ล็อกขนาดเรดาร์ให้สมดุลกับดีไซน์เดิม
canvas.width = 500;
canvas.height = 500;

const cx = canvas.width / 2;
const cy = canvas.height / 2;
const maxRadius = 220;
let angle = 0;
// เปลี่ยนจาก let satellites = []; ด้านบนสุด ให้มีข้อมูลเริ่มต้นดังนี้ครับ:
let satellites = [
    {
        name: "ISS (ZARYA)",
        azimuth: 185.2,
        elevation: 45.1,
        range_km: 652,
        doppler_khz: 4.2
    }
];
// วาดสเกลเรดาร์เชิงมุม (เส้นตรรกศาสตร์ 15° - 330°)
function drawRadarGrid() {
    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 1;
    
    // วาดวงรัศมีวงกลมเข้ม-จาง
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * (i / 4), 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // วาดเส้นรัศมีสแกนรอบทิศ (กากบาทและเส้นทะแยง)
    ctx.beginPath();
    for (let d = 0; d < 360; d += 45) {
        const rad = (d * Math.PI) / 180;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxRadius * Math.cos(rad), cy + maxRadius * Math.sin(rad));
    }
    ctx.stroke();
}

// ลำแสงหมุนสแกน (Sweep)
function drawSweepBeam() {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    
    let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
    grad.addColorStop(0, 'rgba(0, 50, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 255, 0, 0.25)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, -Math.PI / 4, 0);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();
    
    angle += 0.015;
}

// วาดสัญลักษณ์ตัวดาวเทียมบนจอเรดาร์
function drawSatelliteTargets() {
    satellites.forEach(sat => {
        if (sat.elevation > 0) {
            const r = maxRadius * ((90 - sat.elevation) / 90);
            const theta = (sat.azimuth - 90) * (Math.PI / 180);
            const x = cx + r * Math.cos(theta);
            const y = cy + r * Math.sin(theta);
            
            // วาดเป้าพิกัดเด่นชัด
            ctx.fillStyle = '#00ff00';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ff00';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // ล้างเอฟเฟกต์แสงเงา
            
            // ป้ายชื่อกำกับข้างเป้าดาวเทียม
            ctx.fillStyle = '#88ff88';
            ctx.font = 'bold 12px Courier New';
            ctx.fillText(sat.name, x + 10, y + 4);
        }
    });
}

// ดึง Telemetry จาก Python API แปลงลงตาราง SOC ทั้งสอง
async function syncSatelliteData() {
    try {
        const res = await fetch('/api/satellites');
        satellites = await res.json();
        
        let htmlRows = '';
        
        satellites.forEach(sat => {
            const isAOS = sat.elevation > 0;
            const statusText = isAOS ? 'IN_PASS' : 'BELOW_HORIZON';
            const statusClass = isAOS ? 'alert' : 'danger';
            
            htmlRows += `
                <tr>
                    <td><strong>${sat.name}</strong></td>
                    <td>${sat.azimuth.toFixed(1)}°</td>
                    <td>${sat.elevation.toFixed(1)}°</td>
                    <td>${Math.round(sat.range_km)}km</td>
                    <td>${sat.doppler_khz >= 0 ? '+' : ''}${sat.doppler_khz.toFixed(1)}kHz</td>
                    <td class="${statusClass}">${statusText}</td>
                </tr>
            `;
        });
        
        // หยอดข้อมูลลงตารางพร้อมกันทั้งบนและล่างให้ตรงกับดีไซน์รูปดั้งเดิม
        telemetryData.innerHTML = htmlRows;
        commData.innerHTML = htmlRows;
        
    } catch (err) {
        console.error("SOC Sync Error:", err);
    }
}

// ลูปกราฟิกแอนิเมชันเรดาร์
function renderSOC() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRadarGrid();
    drawSweepBeam();
    drawSatelliteTargets();
    requestAnimationFrame(renderSOC);
}

// เริ่มต้นระบบปฏิบัติการหน้าจอ
renderSOC();
setInterval(syncSatelliteData, 1000); // อัปเดตข้อมูลพิกัดสดๆ ทุก 1 วินาที
syncSatelliteData();
