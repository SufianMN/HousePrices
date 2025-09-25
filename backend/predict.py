import sys
import joblib
import pandas as pd
import json
import warnings

# Suppress the FutureWarning from pandas for a cleaner output
warnings.simplefilter(action='ignore', category=FutureWarning)

def predict():
    """
    Loads a country-specific model and makes a price prediction.
    This version only prints the final prediction number.
    """
    # Expects two arguments: country and the JSON data string
    if len(sys.argv) < 3:
        print("Error: Country or input data not provided.", file=sys.stderr)
        sys.exit(1)

    country = sys.argv[1]
    input_data_json = sys.argv[2]

    # Dynamically build the path to the correct model files based on the country
    model_path = f'./models/{country}/xgb_house_price_model.pkl'
    columns_path = f'./models/{country}/model_columns.pkl'

    try:
        model = joblib.load(model_path)
        model_columns = joblib.load(columns_path)
    except FileNotFoundError:
        print(f"Error: Model files for country '{country}' not found.", file=sys.stderr)
        sys.exit(1)

    try:
        input_data = json.loads(input_data_json)
    except json.JSONDecodeError:
        print("Error: Invalid JSON format.", file=sys.stderr)
        sys.exit(1)

    input_df = pd.DataFrame([input_data])

    # Align columns with the training data for the specific country model
    full_input_df = pd.DataFrame(columns=model_columns)
    full_input_df = pd.concat([full_input_df, input_df], ignore_index=True, sort=False).fillna(0)
    full_input_df = full_input_df[model_columns]

    # Make prediction
    try:
        prediction = model.predict(full_input_df)
        # --- THE ONLY OUTPUT ---
        print(prediction[0])
    except Exception as e:
        print(f"Error during prediction: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    predict()

