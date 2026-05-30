import os
from flask import Flask, jsonify, send_from_directory

# กำหนด Path ให้ชี้ไปที่โฟลเดอร์ frontend ด้านนอกให้ถูกต้องเด็ดขาด
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
frontend_dir = os.path.join(base_dir, 'frontend')

app = Flask(__name__, static_folder=frontend_dir, static_url_path='')

@app.route('/')
def index():
    # ส่งไฟล์หน้าแรก
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # ปลอดภัย 100%: เช็กก่อนว่ามีไฟล์นั้นอยู่ในโฟลเดอร์ frontend จริงไหม
    # ถ้าไม่มี หรือใครพยายามจะเข้าถึงไฟล์ระบบหลังบ้าน ให้ดีดกลับเป็น 404 ทันที ไม่พ่นโค้ดมั่วซั่ว
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return jsonify({"error": "Not Found"}), 404

# ==========================================
# โค้ดส่วนล่างของคุณ (ดึงของเดิมมาวางต่อได้เลย)
# ==========================================
@app.route('/api/satellites')
def get_satellites():
    if TRACKER_ONLINE:
        return jsonify(tracker.get_tracking_info())
    else:
        return jsonify({"error": "Tracker is offline"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
