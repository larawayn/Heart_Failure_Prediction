
# Import our modules
import requests
from pandas.io.json import json_normalize
import pandas as pd
import numpy as np
from flask import Flask, render_template, jsonify
import pymongo
import os

# Create an instance of our Flask app.
app = Flask(__name__)

# Create connection variable
conn = 'mongodb://localhost:27017'
# Pass connection to the pymongo instance.
client = pymongo.MongoClient(conn)

# Connect to a database. 
db = client.deathDB
# Available routes
@app.route("/")
def Index():
    return render_template('index.html')

@app.route("/api/v1.0/Heart_Failure_Records")
def heart():
    # Store collection in a list
    Heart_Failure_Records = db.Heart_Failure_Records.find()   
    # Create empty list and fill with collection records
    data=[]
    for item in Heart_Failure_Records:
        heart_dict={}
        heart_dict['age']=item['age']
        heart_dict['anaemia']=item['anaemia']
        heart_dict['diabetes']=item['diabetes']
        heart_dict['ejection_fraction']=item['ejection_fraction']
        heart_dict['high_blood_pressure']=item['high_blood_pressure']
        heart_dict['platelets']=item['platelets']
        heart_dict['serum_creatinine']=item['serum_creatinine']
        heart_dict['serum_sodium']=item['serum_sodium']
        heart_dict['sex']=item['sex']
        heart_dict['smoking']=item['smoking']
        heart_dict['time']=item['time']
        heart_dict['Death Event']=item['DEATH_EVENT']
        data.append(heart_dict)

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
