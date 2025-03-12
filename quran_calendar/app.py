from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///calendar.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
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
    selections = CalendarSelection.query.all()
    result = [{'day': s.day, 'item': s.item, 'value': s.value} for s in selections]
    return jsonify(result)

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

if __name__ == '__main__':
    app.run(debug=True)