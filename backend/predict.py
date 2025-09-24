# File: backend/predict.py

import sys
import joblib
import pandas as pd
import json

# Suppress the FutureWarning from pandas for a cleaner output
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

def predict():
    """
    Loads the trained model and makes a price prediction.
    This version only prints the final prediction number.
    """
    try:
        model = joblib.load('./models/xgb_house_price_model.pkl')
        model_columns = joblib.load('./models/model_columns.pkl')
    except FileNotFoundError:
        # Send a clean error message to the server if files are missing
        print("Error: Model files not found.", file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) < 2:
        print("Error: No input data provided.", file=sys.stderr)
        sys.exit(1)

    input_data_json = sys.argv[1]
    
    try:
        input_data = json.loads(input_data_json)
    except json.JSONDecodeError:
        print("Error: Invalid JSON format.", file=sys.stderr)
        sys.exit(1)

    input_df = pd.DataFrame([input_data])

    # Align columns with the training data
    full_input_df = pd.DataFrame(columns=model_columns)
    full_input_df = pd.concat([full_input_df, input_df], ignore_index=True, sort=False).fillna(0)
    full_input_df = full_input_df[model_columns]

    # Make prediction
    try:
        prediction = model.predict(full_input_df)
        # --- THE ONLY OUTPUT ---
        # This is the only line that prints to standard output.
        print(prediction[0])
    except Exception as e:
        print(f"Error during prediction: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    predict()

