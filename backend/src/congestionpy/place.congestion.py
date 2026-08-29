import pandas as pd
from neuralprophet import NeuralProphet

def predict_place_congestion(
    data: pd.DataFrame,
    forecast_months=12
):

    all_results = []

    for _, row in data.iterrows():

        place_name = row["name"]
        region_code = row["region_code"]

        months = pd.date_range(
            start="2020-01-01",
            periods=12,
            freq="MS"
        )

        visitors = [
            row["1month"],
            row["2month"],
            row["3month"],
            row["4month"],
            row["5month"],
            row["6month"],
            row["7month"],
            row["8month"],
            row["9month"],
            row["10month"],
            row["11month"],
            row["12month"]
        ]

        train_data = pd.DataFrame({
            "ds": months,
            "y": visitors
        })

        model = NeuralProphet(
            n_lags=2,
            n_forecasts=1,
            epochs=100,

            weekly_seasonality=False,
            yearly_seasonality=False,
            daily_seasonality=False
        )

        model.fit(
            train_data,
            freq="MS",
            progress="bar"
        )

        future = model.make_future_dataframe(
            train_data,
            periods=forecast_months
        )

        forecast = model.predict(future)

        result = forecast[
            forecast["ds"] > train_data["ds"].max()
        ][["ds", "yhat1"]].copy()

        result.rename(
            columns={
                "yhat1": "predicted_visitors"
            },
            inplace=True
        )

        result["region_code"] = region_code
        result["place_name"] = place_name

        v_min = train_data["y"].min()
        v_max = train_data["y"].max()

        if v_max == v_min:

            result["congestion_score"] = 0

        else:

            result["congestion_score"] = (
                (result["predicted_visitors"] - v_min)
                / (v_max - v_min)
            ) * 100

        result["congestion_score"] = (
            result["congestion_score"]
            .clip(0, 100)
            .round(2)
        )

        all_results.append(result)


    if not all_results:
        return pd.DataFrame()

    result_df = pd.concat(
        all_results,
        ignore_index=True
    )

    q20 = result_df["congestion_score"].quantile(0.2)
    q40 = result_df["congestion_score"].quantile(0.4)
    q60 = result_df["congestion_score"].quantile(0.6)
    q80 = result_df["congestion_score"].quantile(0.8)

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
        result_df["congestion_score"]
        .apply(get_congestion_level)
    )

    return result_df