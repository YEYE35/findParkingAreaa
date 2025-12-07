import pandas as pd
from sklearn.metrics import confusion_matrix, classification_report
import joblib

DATA_PATH = 'ml/data/parking_training_data.csv'
MODEL_PATH = 'ml/models/parking_recommender.joblib'

df = pd.read_csv(DATA_PATH)
bundle = joblib.load(MODEL_PATH)

model = bundle['model']
feature_cols = bundle['feature_cols']

X = df[feature_cols].values
y_true = df['chosen'].values
y_pred = model.predict(X)

print(confusion_matrix(y_true, y_pred))
print(classification_report(y_true, y_pred))
