import os
from flask import Flask, jsonify, send_from_directory

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
frontend_dir = os.path.join(base_dir, 'frontend')

app = Flask(__name__, static_folder=frontend_dir, static_url_path='')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return jsonify({"error": "Not Found"}), 404

# ========================================================
# วางโค้ดจำลองข้อมูลพิกัด /api/satellites และ TRACKER ของคุณต่อท้ายตรงนี้ได้เลยครับ
# ========================================================
