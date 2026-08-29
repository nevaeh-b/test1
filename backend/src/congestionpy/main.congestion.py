from db import load_training_data, save_prediction
from congestion_predict import predict_congestion

REGION_CODES = [
    "30110",  # 동구
    "30140",  # 중구
    "30170",  # 서구
    "30200",  # 유성구
    "30230",  # 대덕구
]

def main():
    for region_code in REGION_CODES:
        print(
            f"=== [지역 코드: {region_code}] "
            f"혼잡도 예측 시작 ==="
        )

        data = load_training_data(region_code=region_code)
        final_result = predict_congestion(data=data, forecast_days=30)
        save_prediction(region_code=region_code, result=final_result)

        print(f"=== [지역 코드: {region_code}] 완료 ===")

if __name__ == "__main__":
    main()