# py -3.12 -m pip install python-dotenv supabase
import os
import pandas as pd

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# 구별 방문자수

def load_training_data(region_code):

    response = (
        supabase
        .table("population_stat")
        .select("*")
        .eq("region_code", region_code)
        .order("stat_date")
        .execute()
    )

    import pandas as pd

    df = pd.DataFrame(response.data)

    df["stat_date"] = pd.to_datetime(df["stat_date"])

    df["ds"] = df["stat_date"]

    df["total_visitors"] = (
        df["resident_population"]
        + df["visitor_population"]
    )

    df["y"] = df["total_visitors"]

    return df

def save_prediction(result):
    supabase.table("congestion_history").insert(result).execute()


# 관광지별 방문자수

def load_place_training_data(region_code):

    response = (
        supabase
        .table("congestion_place")
        .select("*")
        .eq("region_code", region_code)
        .execute()
    )

    df = pd.DataFrame(response.data)

    return df