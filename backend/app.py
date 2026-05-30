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

# 1. แก้ไขบรรทัดนี้: ให้ดึงไฟล์จากโฟลเดอร์ frontend โดยตรง
app = Flask(__name__, static_folder='../frontend', static_url_path='')

# 2. เพิ่ม Route ตัวนี้เข้าไปเพื่อให้ส่งไฟล์ HTML หน้าแรกได้ถูกต้อง
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# 3. พิเศษ! เพิ่ม Route ตัวนี้เพื่อให้ Python ยอมส่งไฟล์ CSS และ JS ในโฟลเดอร์ frontend ออกไปหาเบราว์เซอร์
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# ส่วนของ API /api/satellites ด้านล่างปล่อยไว้เหมือนเดิมได้เลยครับ...

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
