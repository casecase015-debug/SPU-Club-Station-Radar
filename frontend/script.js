const canvas = document.getElementById('radarCanvas');
const ctx = canvas.getContext('2d');
const telemetryDiv = document.getElementById('telemetryData');
const clockDiv = document.getElementById('liveClock');

const width = canvas.width;
const height = canvas.height;
const cx = width / 2;
const cy = height / 2;
const maxRadius = 240;

let angle = 0;
let satellites = [];
let prevRanges = {}; // ตัวแปรสำหรับเก็บระยะห่างก่อนหน้า เพื่อคำนวณว่าวิ่งเข้าหรือวิ่งออก

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockDiv.textContent = `${hours}:${minutes}:${seconds} ICT`;
}

function drawRadarBackground() {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * (i / 3), 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.stroke();
}

function drawSweep() {
    ctx.fillStyle = 'rgba(1, 11, 1, 0.08)';
    ctx.fillRect(0, 0, width, height);
    drawRadarBackground();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -maxRadius);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    const gradient = ctx.createLinearGradient(0, 0, maxRadius, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, -Math.PI/2, -Math.PI/2 + 0.5);
    ctx.lineTo(0, 0);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
    angle += 0.05;
}

function drawSatellites() {
    satellites.forEach(sat => {
        if (sat.elevation > 0) {
            const r = maxRadius * ((90 - sat.elevation) / 90);
            const theta = (sat.azimuth - 90) * (Math.PI / 180);
            
            const x = cx + r * Math.cos(theta);
            const y = cy + r * Math.sin(theta);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffff00';
            ctx.fill();

            ctx.fillStyle = '#00ff00';
            ctx.font = '12px Courier New';
            ctx.fillText(sat.name, x + 8, y + 4);
        }
    });
}

function animate() {
    drawSweep();
    drawSatellites();
    requestAnimationFrame(animate);
}

// อัปเดตตารางให้แสดงความถี่ Doppler
async function fetchTelemetry() {
    try {
        const response = await fetch('/api/satellites');
        satellites = await response.json();
        
        telemetryDiv.innerHTML = '';
        
        // แก้ไขส่วนหัวตารางชั่วคราวด้วย JS ถ้าไม่อยากแก้ไฟล์ HTML
        const tableHeader = document.querySelector('.table-header');
        if(tableHeader) {
            tableHeader.style.gridTemplateColumns = '1.5fr 1fr 1fr 1fr 1.2fr 1fr';
            tableHeader.innerHTML = `
                <span>SAT</span>
                <span>AZ</span>
                <span>EL</span>
                <span>RANGE</span>
                <span>RX FREQ</span>
                <span>STATUS</span>
            `;
        }
        
        satellites.forEach(sat => {
            let rxFreq = "STANDBY";
            const isVisible = sat.elevation > 0;
            
            // คำนวณลอจิก Doppler ตามแนวทาง E25YMZ
            if (isVisible) {
                const prevDist = prevRanges[sat.name] || sat.range_km;
                const isApproaching = sat.range_km < prevDist; // ถ้าระยะน้อยลง แปลว่ากำลังวิ่งเข้าหา
                
                if (isApproaching) {
                    if (sat.elevation < 45) rxFreq = "437.810";
                    else if (sat.elevation >= 45 && sat.elevation < 60) rxFreq = "437.805";
                    else rxFreq = "437.800"; // เข้าใกล้จุดสูงสุด
                } else { // กำลังวิ่งออก
                    if (sat.elevation >= 45) rxFreq = "437.795";
                    else rxFreq = "437.790"; // กำลังลับขอบฟ้า
                }
                
                prevRanges[sat.name] = sat.range_km; // บันทึกระยะปัจจุบันไว้เทียบลูปรอบหน้า
            }

            const row = document.createElement('div');
            row.style.display = 'grid';
            row.style.gridTemplateColumns = '1.5fr 1fr 1fr 1fr 1.2fr 1fr';
            row.style.padding = '8px 0';
            row.style.borderBottom = '1px dotted rgba(0, 255, 0, 0.3)';
            row.className = `sat-row ${isVisible ? 'alert' : 'danger'}`;
            
            const status = isVisible ? 'AOS' : 'LOS';
            
            row.innerHTML = `
                <span>${sat.name}</span>
                <span>${sat.azimuth.toFixed(1)}°</span>
                <span>${sat.elevation.toFixed(1)}°</span>
                <span>${sat.range_km.toFixed(0)}km</span>
                <span style="color: ${isVisible ? '#00ffff' : 'inherit'}; font-weight: bold;">${rxFreq}</span>
                <span>${status}</span>
            `;
            telemetryDiv.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

animate();
setInterval(updateClock, 1000);
setInterval(fetchTelemetry, 1000);
updateClock();
fetchTelemetry();