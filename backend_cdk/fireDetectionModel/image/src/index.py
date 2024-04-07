
import json
import joblib
import os
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

def handler(event, context):
  print('received event:')
  print(event)

  this_dir = os.path.dirname(__file__)
  model_file = os.path.join(this_dir, 'model.sav')
  scaler_file = os.path.join(this_dir, 'std_scaler.sav')
  model = joblib.load(model_file)
  std_scaler = joblib.load(scaler_file)

  input_data = np.array(event).reshape(1,-1)
  input_data = std_scaler.transform(input_data)

  result = model.predict(input_data)
  print(result)
  

  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      'body': json.dumps(result.tolist()[0])
  }