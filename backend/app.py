from flask import Flask, jsonify, send_from_directory
import os

# 1. จัดการเรื่อง Path อ้างอิงให้เป๊ะที่สุด
current_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(current_dir)
frontend_dir = os.path.join(project_dir, 'frontend')
data_dir = os.path.join(project_dir, 'data')
config_path = os.path.join(data_dir, 'satellites.json')

app = Flask(__name__, static_folder=frontend_dir, static_url_path='')

# 2. นำเข้าและเปิดระบบ Tracker
try:
    from satellite import SatelliteTracker
    print("[System] Initializing SPU SATELLITE OPERATIONS CENTER...")
    tracker = SatelliteTracker(config_path)
    TRACKER_ONLINE = True
except Exception as e:
    print(f"[CRITICAL ERROR] Could not start SatelliteTracker: {e}")
    TRACKER_ONLINE = False

# 3. กำหนดหน้าเว็บ
@app.route('/')
def index():
    return send_from_directory(frontend_dir, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(frontend_dir, path)

@app.route('/api/satellites')
def get_satellites():
    if TRACKER_ONLINE:
        return jsonify(tracker.get_tracking_info())
    else:
        return jsonify({"error": "Tracker is offline"}), 500

if __name__ == '__main__':
    # ดึงค่า Port จากระบบของ Server (ถ้าไม่มีให้ใช้ 5000)
    port = int(os.environ.get("PORT", 5000))
    # ต้องตั้ง host เป็น '0.0.0.0' เพื่อให้คนภายนอกเข้าถึงได้
    app.run(host='0.0.0.0', port=port)