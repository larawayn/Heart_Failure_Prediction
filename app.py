
# Import our modules

from pandas.io.json import json_normalize
import pandas as pd
import numpy as np
from flask import Flask, render_template, jsonify, request
import pymongo
import os
import joblib

# Create an instance of our Flask app.
app = Flask(__name__)

# Create connection variable
#conn = "mongodb+srv://power_user:{os.environ.get('mongo_pw')}@heroku-cluster.hdjnt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
conn = "mongodb+srv://poweruser1:{os.environ.get('mongo_pw')}@cluster0.lnuvl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

# Pass connection to the pymongo instance.
client = pymongo.MongoClient(f'{conn}')

# Connect to a database.
db = client.HeartFailureDB
# Available routes


@app.route("/")
def Index():
    return render_template('index.html')


@app.route("/api/v1.0/Heart_Failure_Records")
def heart():
    # Store collection in a list
    Heart_Failure_Records = db.Heart_Failure_Records.find()
    # Create empty list and fill with collection records
    data = []
    for item in Heart_Failure_Records:
        heart_dict = {}
        heart_dict['age'] = item['age']
        heart_dict['anaemia'] = item['anaemia']
        heart_dict['diabetes'] = item['diabetes']
        heart_dict['ejection_fraction'] = item['ejection_fraction']
        heart_dict['high_blood_pressure'] = item['high_blood_pressure']
        heart_dict['platelets'] = item['platelets']
        heart_dict['serum_creatinine'] = item['serum_creatinine']
        heart_dict['serum_sodium'] = item['serum_sodium']
        heart_dict['sex'] = item['sex']
        heart_dict['smoking'] = item['smoking']
        heart_dict['time'] = item['time']
        heart_dict['Death Event'] = item['DEATH_EVENT']
        data.append(heart_dict)

    return jsonify(data)

# prediction function


def valuePredictor(to_predict_list):
    to_predict = np.array(to_predict_list)  # .reshape(1, 9)
    print(to_predict)
    loaded_model = joblib.load("Model/random_forest_model_tuned.sav")
    loaded_scaler = joblib.load("Model/scaler_tuned.sav")
    scaled_values = loaded_scaler.transform([to_predict])
    print(f" scaled values: {scaled_values}")
    result = loaded_model.predict(scaled_values)
    return result[0]


@app.route('/result', methods=['GET', 'POST'])
def result():
    if request.method == 'POST':
        to_predict_list = request.form.to_dict()
        to_predict_list = list(to_predict_list.values())
        to_predict_list = list(map(float, to_predict_list))

        result = valuePredictor(to_predict_list)
        if int(result) == 1:
            prediction = 'You are at risk of heart failure!'
        else:
            prediction = 'You are not at risk of heart failure.'
    return render_template("result.html", prediction=prediction)


if __name__ == "__main__":
    app.run(debug=True)
