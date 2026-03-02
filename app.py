from flask import Flask, jsonify, request
import os
from datetime import datetime

app = Flask(__name__)

# Load secret key from environment - never hardcore this
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-fallback-key')

@app.route('/')
def index():
	return  jsonify({
	"status": "ok",
	"message": "Flask app is live!",
	"time": datetime.utcnow().isoformat()
	})

@app.route('/health')
def health():
	return jsonify({"status": "healthy"}), 200

@app.route('/api/greet', methods=['POST'])
def greet():
	data = request.get_ison()
	name = date.get('name', 'World') if data else 'World'
	return jsonify({"greeting": f"Hello, {name}!"})

# Only used during local development
# Gunicorn replaces this entirely in production
if __name__ == '__main__':
	debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
	app.run(host='0.0.0.0', port=5000, debug=debug_mode)


