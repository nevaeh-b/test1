import pandas as pd
from neural_prophet import run_neural_prophet

def predict_congestion(
    data: pd.DataFrame,
    forecast_days=30
):

    v_min = data["y"].min()
    v_max = data["y"].max()

    result_df = run_neural_prophet(
        data=data,
        forecast_days=forecast_days
    )

    result_df["avg_congestion"] = (
        (result_df["predicted_visitors"] - v_min)
        / (v_max - v_min)
    ) * 100

    result_df["avg_congestion"] = (
        result_df["avg_congestion"]
        .clip(0, 100)
        .round(2)
    )

    historical = data.copy()
    historical["avg_congestion"] = ((historical["y"] - v_min) / (v_max - v_min)) * 100
    historical["avg_congestion"] = (historical["avg_congestion"].clip(0, 100))

    all_scores = pd.concat([historical["avg_congestion"],result_df["avg_congestion"]])

    q20 = all_scores.quantile(0.2)
    q40 = all_scores.quantile(0.4)
    q60 = all_scores.quantile(0.6)
    q80 = all_scores.quantile(0.8)

    def get_congestion_level(score):
        if score <= q20:
            return "매우낮음"
        
        elif score <= q40:
            return "낮음"

        elif score <= q60:
            return "보통"

        elif score <= q80:
            return "높음"

        else:
            return "매우높음"

    result_df["congestion_level"] = (
        result_df["avg_congestion"]
        .apply(get_congestion_level)
    )

    return result_df