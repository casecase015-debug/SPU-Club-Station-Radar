from flask import Flask, jsonify, send_from_directory
import os

# 1. จัดการเรื่อง Path อ้างอิงให้เป๊ะที่สุด
current_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(current_dir)
frontend_dir = os.path.join(project_dir, 'frontend')
data_dir = os.path.join(project_dir, 'data')
config_path = os.path.join(data_dir, 'satellites.json')

import os
from flask import Flask, jsonify, send_from_directory

# 1. ตั้งค่าโฟลเดอร์หลักให้อยู่ที่โฟลเดอร์ด้านนอก (Root) เพื่อให้มองเห็นทั้ง frontend และ backend
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
frontend_dir = os.path.join(base_dir, 'frontend')

app = Flask(__name__, static_folder=frontend_dir, static_url_path='')

# 2. ส่งไฟล์หน้าแรก (index.html)
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# 3. ส่งไฟล์อื่นๆ (CSS, JS, JSON) โดยตรวจเช็กและระบุประเภทไฟล์ให้เบราว์เซอร์อ่านเข้าใจถูกต้อง
@app.route('/<path:path>')
def serve_static(path):
    # ส่งไฟล์และให้ Flask จัดการ Mime Type ของ CSS/JS ให้ถูกต้องอัตโนมัติ
    return send_from_directory(app.static_folder, path)

# ส่วนคำนวณวงโคจรดาวเทียม @app.route('/api/satellites') ด้านล่างปล่อยไว้เหมือนเดิมครับ

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
