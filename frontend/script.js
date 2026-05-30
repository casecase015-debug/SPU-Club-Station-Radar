const canvas = document.getElementById('radarCanvas');
const ctx = canvas.getContext('2d');
const telemetryData = document.getElementById('telemetryData');
const commData = document.getElementById('commData');

canvas.width = 450;
canvas.height = 450;

const cx = canvas.width / 2;
const cy = canvas.height / 2;
const maxRadius = 200;
let angle = 0;
let satellites = [];

function drawRadarBackground() {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * (i / 3), 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy); ctx.lineTo(cx + maxRadius, cy);
    ctx.moveTo(cx, cy - maxRadius); ctx.lineTo(cx, cy + maxRadius);
    ctx.stroke();
}

function drawSweep() {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    let gradient = ctx.createLinearGradient(0, 0, maxRadius, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0.0)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0.3)');
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, -Math.PI / 4, 0);
    ctx.lineTo(0, 0); ctx.fill();
    ctx.restore();
    angle += 0.015;
}

function drawSatellites() {
    satellites.forEach(sat => {
        if (sat.elevation > 0) {
            const r = maxRadius * ((90 - sat.elevation) / 90);
            const theta = (sat.azimuth - 90) * (Math.PI / 180);
            const x = cx + r * Math.cos(theta);
            const y = cy + r * Math.sin(theta);
            
            ctx.fillStyle = '#00ff00';
            ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
            ctx.font = '12px Courier New';
            ctx.fillText(sat.name, x + 10, y + 4);
        }
    });
}

async function fetchTelemetry() {
    try {
        const response = await fetch('/api/satellites');
        satellites = await response.json();
        
        telemetryData.innerHTML = '';
        commData.innerHTML = '';
        
        satellites.forEach(sat => {
            const isVisible = sat.elevation > 0;
            const statusText = isVisible ? 'IN_PASS' : 'BELOW_HORIZON';
            const statusClass = isVisible ? 'alert' : 'danger';
            
            const rowContent = `
                <td><strong>${sat.name}</strong></td>
                <td>${sat.azimuth.toFixed(1)}°</td>
                <td>${sat.elevation.toFixed(1)}°</td>
                <td>${Math.round(sat.range_km)}km</td>
                <td>${sat.doppler_khz.toFixed(2)}kHz</td>
                <td class="${statusClass}">${statusText}</td>
            `;
            
            const row1 = document.createElement('tr'); row1.innerHTML = rowContent;
            telemetryData.appendChild(row1);
            
            const row2 = document.createElement('tr'); row2.innerHTML = rowContent;
            commData.appendChild(row2);
        });
    } catch (error) {
        console.error("Error fetching telemetry:", error);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRadarBackground();
    drawSweep();
    drawSatellites();
    requestAnimationFrame(animate);
}

animate();
setInterval(fetchTelemetry, 1000);
fetchTelemetry();
