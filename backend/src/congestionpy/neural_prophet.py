import pandas as pd
from neuralprophet import NeuralProphet, set_log_level

set_log_level("ERROR")

def run_neural_prophet(data: pd.DataFrame, forecast_days=30):
    x_cols = ["resident_population", "visitor_population"]
    model = NeuralProphet(
        n_lags=7, # 과거 30일의 데이터 사용
        n_forecasts=30, # 한 번에 30일 예측
        epochs=100, # 반복수 100 -> 50, 100, 200 등으로 성능 비교 필요

        # seasonality
        weekly_seasonality=True,
        yearly_seasonality=True
    )

    model = model.add_lagged_regressor(names=x_cols, normalize="minmax") #과거 데이터

    model.fit(data, freq="D", progress="bar")

    future = model.make_future_dataframe(data, periods=forecast_days)

    forecast = model.predict(future)

    cutoff = data["ds"].max()

    result_df = forecast[
        forecast["ds"] > cutoff
    ][
        ["ds", "yhat1"]
    ].copy()

    result_df.rename(
        columns={
            "yhat1": "predicted_visitors"
        },
        inplace=True
    )

    return result_df