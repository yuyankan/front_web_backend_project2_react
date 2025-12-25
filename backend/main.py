
import myquery_db as query_db
from my_minio import get_image_url_boto3
import pandas as pd
import datetime
from fastapi import FastAPI, WebSocket,WebSocketDisconnect

import asyncio


from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()




app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 生产环境建议指定具体的端口，如 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    )

table =  {'raw_data':'ks_project_yyk.EHS.ods_raw_data' }
default_pic= 'default_empty.png'

from starlette.concurrency import run_in_threadpool

# ... 现有导入保持不变 ...

def get_sqldata(last_time=None, production_line='C11', cameraid=4):
    """
    last_time: 格式为 '2023-01-01 12:00:00'，用于增量查询
    """
    utcnow = datetime.datetime.utcnow() - datetime.timedelta(days=1)
    utcday = utcnow.strftime('%Y-%m-%d')
    partition_key = f"{production_line}_{cameraid}_{utcnow.year}{(utcnow.month - 1) // 3 + 1}"

    # 1. 增量 SQL 逻辑
    time_filter = f"AND createtime_utc > '{last_time}'" if last_time else f"AND createtime_utc >= '{utcday}'"
    
    query = f"""
        SELECT * FROM {table['raw_data']}
        WHERE partition_key = '{partition_key}'
        {time_filter}
        ORDER BY createtime_utc ASC
    """
    
    df_raw = query_db.query_ksdata(query)
    default_pic_minio_url = get_image_url_boto3(default_pic)

    if not df_raw.empty:
        # 2. 转换时间（仅转换新增部分）
        df_raw['createtime_cn'] = df_raw['createtime_utc'].dt.tz_localize(None) + pd.Timedelta(hours=8)
        # 记录最后一条数据的原始时间，用于下次查询
        new_last_time = df_raw['createtime_utc'].max().strftime('%Y-%m-%d %H:%M:%S')
        
        df_raw['createtime_cn'] = df_raw['createtime_cn'].dt.strftime('%Y-%m-%d %H:%M:%S')
        df_raw.drop(['createtime_utc', 'date_day'], axis=1, inplace=True, errors='ignore')
        
        # 3. 批量处理 URL (MinIO URL 生成较慢，增量处理极大减轻负担)
        df_raw['image_url'] = 'detected' + df_raw['object_name']
        df_raw.loc[df_raw['detection_result'] == 'OK_EMPTY', 'image_url'] = df_raw['object_name']
        df_raw.loc[df_raw['photo2check_bool'] == 0, 'image_url'] = default_pic

        #get from fronend
        #df_raw['image_url'] = df_raw['image_url'].apply(get_image_url_boto3)
        
        return df_raw, default_pic_minio_url, new_last_time
    
    return pd.DataFrame(), default_pic_minio_url, last_time

@app.websocket("/ws/realtime")
async def realtime_ws(websocket: WebSocket):
    await websocket.accept()
    last_time = None  # 追踪上次读取到的位置
    try:
        while True:
            # 使用线程池执行同步阻塞的数据库操作
            df_raw, pic_url, current_last_time = await run_in_threadpool(get_sqldata, last_time)
            
            if not df_raw.empty:
                last_time = current_last_time
                await websocket.send_json({
                    "is_incremental": True,
                    "info": df_raw.to_dict(orient='records'),
                    'default_pic_minio_url': pic_url
                })
            
            await asyncio.sleep(60)
    except WebSocketDisconnect:
        pass



@app.get("/api/get_url")
async def get_url(object_name: str):
    # 调用你现有的函数生成临时 URL
    url = get_image_url_boto3(object_name)
    return {"url": url}