// types.ts

// types.ts

/**
 * 对应后端数据库或 df_meta 中的一条记录。
 * 包含用于筛选和高层概览的信息。
 */

//meta for tracing
export interface RawDataMeta {
  id: number; 
  object_name: string;
  product_name: string;
  productnameid: number;
  production_line: string;
  linespeed_spec: number;
  linespeed_real: number;
  photo2check_bool: boolean;
  photo2minio_status:boolean;
  cameraid: number;
  topic_name: string;
  partition_id: number;
  detection_result:string;
  //createtime_utc: string; // UTC 时间字符串
  createtime_cn: string; // 转换为中国时间的字符串
  date_day: string; // 仅日期部分，格式为 'YYYY-MM-DD'
  quarid: number;
  partition_key: string;
  image_url: string;

  //country: string;
  [key: string]: string | number | boolean; // This allows indexing by a string key
}

export interface onepointshow {
  object_name: string;
  product_name: string;
  production_line: string;
  linespeed_spec: number;
  linespeed_real: number;
  detection_result:string;
  //createtime_utc: string; // UTC 时间字符串
  createtime_cn: string; // 转换为中国时间的字符串
  image_url: string;

  //country: string;
  [key: string]: string | number | boolean; // This allows indexing by a string key
}

