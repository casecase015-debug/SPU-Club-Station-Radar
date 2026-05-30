from flask import Flask, render_template, Response
import urllib.request
import json
import math
import time

app = Flask(__name__)

# พิกัด มหาวิทยาลัยศรีปทุม บางเขน (Latitude, Longitude)
SPU_LAT = 13.8582
SPU_LON = 100.5824

def calculate_bearing_distance(lat1, lon1, lat2, lon2):
    # สูตร Haversine คำนวณระยะทางและมุมทิศทางบนพื้นผิวโลก
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    distance = 6371 * c # ระยะทางเป็นกิโลเมตร

    y = math.sin(dlon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    bearing = math.atan2(y, x)
    bearing = math.degrees(bearing)
    bearing = (bearing + 360) % 360 # ทำให้องศาอยู่ในช่วง 0-360

    return distance, bearing

def fetch_iss_data():
    try:
        # ดึงพิกัดจริงของสถานีอวกาศนานาชาติ (ISS)
        url = "http://api.open-notify.org/iss-now.json"
        response = urllib.request.urlopen(url)
        data = json.loads(response.read())
        
        iss_lat = float(data['iss_position']['latitude'])
        iss_lon = float(data['iss_position']['longitude'])
        
        # คำนวณระยะทางและทิศทางเทียบกับ ม.ศรีปทุม
        distance, bearing = calculate_bearing_distance(SPU_LAT, SPU_LON, iss_lat, iss_lon)

        return json.dumps({
            "name": "ISS (International Space Station)",
            "lat": iss_lat,
            "lon": iss_lon,
            "distance_km": distance,
            "bearing_deg": bearing
        })
    except Exception as e:
        return json.dumps({"error": str(e)})

@app.route('/')
def index():
    # ส่งหน้าเว็บ index.html ไปแสดงผล
    return render_template('index.html')

@app.route('/stream')
def stream():
    # ระบบส่งข้อมูลต่อเนื่องแบบ Real-time (Server-Sent Events)
    def generate():
        while True:
            yield f"data: {fetch_iss_data()}\n\n"
            # หน่วงเวลา 1.2 วินาที เพื่อป้องกันการดึงข้อมูลถี่เกินไปจนโดนแบน API
            time.sleep(1.2) 
            
    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    # รันเซิร์ฟเวอร์ โหมด threaded ช่วยให้รองรับการสตรีมมิ่งได้ลื่นไหล
    app.run(debug=True, threaded=True, port=5050)