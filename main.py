import requests
import json
import pandas as pd
import time
from flask import Flask, request, jsonify

app = Flask(__name__)

if __name__ == '__main__':
    app.run(debug=True)

response = requests.get('https://api.quran.com/api/v4/chapters?language=en')

print(response.json()['chapters'])

def chapters():
    for data in response.json()['chapters']:
        print(data['name_simple'])
        print(data['name_arabic'])
        print(data['revelation_place'])
        
@app.route('/')
def home():
    return chapters()






 

