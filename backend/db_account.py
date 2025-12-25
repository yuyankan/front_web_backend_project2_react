
db = {
    'sqlserver':{
        'mars':{
            'server':'10.12.47.236',  # SQL Server 服务器名称或 IP 地址
            'database':'ARS_MFGPRO_Interface',  # 数据库名称
            'username' : 'MARS_Logbook_BI_Query',  # SQL Server 用户名
            'password' : '8IWysnaAkxSFtjJP',  # SQL Server 密码
            'driver' : '{ODBC Driver 17 for SQL Server}',  # 推荐使用最新的 ODBC 驱动
        },
        'ksdata':{
            'server':'147.121.165.38',  # SQL Server 服务器名称或 IP 地址
            'database':'ks_project_yyk',  # 数据库名称
            'username' : 'OT_CN_LGM_User',  # SQL Server 用户名
            'password' : 'Kunshan&Shanghai',  # SQL Server 密码
            'driver' : '{ODBC Driver 18 for SQL Server}',  # 推荐使用最新的 ODBC 驱动
            "TrustServerCertificate": "yes",  # 信任服务器证书
        },
        
        'ems_gz':{
            'server':'V0MKSP1C12',#'10.161.17.10',  # SQL Server 服务器名称或 IP 地址
            'database':'nw3db',  # 数据库名称
            'username' : 'GZEMSUser',  # SQL Server 用户名
            'password' : 'Guang@Zhou765432',  # SQL Server 密码
            'driver' : '{ODBC Driver 17 for SQL Server}',  # 推荐使用最新的 ODBC 驱动
        },
    },
    'postgresssql':
        {
        'ems_ks':{
            'server':'10.161.81.14',#server
            'port':5433,
            'database':'tb31',  # 数据库名称
            'username' : 'postgres',  # SQL Server 用户名
            'password' : 'sddt8888',  # SQL Server 密码
            }
        }
}