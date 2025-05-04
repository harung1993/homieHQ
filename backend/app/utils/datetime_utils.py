# app/utils/datetime_utils.py
from datetime import datetime
import pytz

def convert_to_user_timezone(utc_datetime, timezone='UTC'):
    """Convert UTC datetime to user's timezone"""
    if not utc_datetime:
        return None
    
    utc_dt = utc_datetime.replace(tzinfo=pytz.UTC)
    user_tz = pytz.timezone(timezone)
    return utc_dt.astimezone(user_tz)