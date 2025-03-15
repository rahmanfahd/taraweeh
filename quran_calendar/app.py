import yaml # Ensure the import statement is correct
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import logging  # Add logging for debugging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load configuration
try:
    with open('config.yaml', 'r') as file:
        config = yaml.safe_load(file)
        logger.debug(f"Loaded configuration: {config}")
except Exception as e:
    logger.error(f"Error loading config.yaml: {str(e)}")
    raise

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],  # In production, specify actual allowed origins
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

app.config['SQLALCHEMY_DATABASE_URI'] = config['database']['uri']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = config['database']['track_modifications']
db = SQLAlchemy(app)

class CalendarSelection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.Integer, nullable=False)
    item = db.Column(db.Integer, nullable=False)
    value = db.Column(db.String(50), nullable=False)

with app.app_context():
    db.create_all()

@app.route('/')
def serve_frontend():
    return send_from_directory('../website-project/src', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../website-project/src', path)

@app.route('/get_selections', methods=['GET'])
def get_selections():
    try:
        selections = CalendarSelection.query.all()
        result = [{'day': s.day, 'item': s.item, 'value': s.value} for s in selections]
        logger.debug(f"Fetched selections: {result}")
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching selections: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/save_selection', methods=['POST'])
def save_selection():
    data = request.json
    day = data.get('day')
    item = data.get('item')
    value = data.get('value')
    
    selection = CalendarSelection.query.filter_by(day=day, item=item).first()
    if selection:
        selection.value = value
    else:
        selection = CalendarSelection(day=day, item=item, value=value)
        db.session.add(selection)
    
    db.session.commit()
    return jsonify({'message': 'Selection saved successfully'})

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(
        debug=config['flask']['debug'],
        host=config['flask']['host'],
        port=config['flask']['port']
    )
