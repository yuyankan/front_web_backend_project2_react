import React from 'react';

import { useGlobalContext } from '../GlobalContext';
import '../css/speedchart.css';

// 2. 将组件定义为 React.FC (Function Component)
const CurrentState: React.FC = () => {

  // 获取最新的数据点用于状态显示
  const {latestinfodata} = useGlobalContext();

  return (
   <>
        {/*whole div for below:*/}

            {/* 外部容器：应用 .status-grid 样式 */}
                
                    <p className="status-item">
                        <b>Current product:</b> {latestinfodata?.product_name}
                    </p>

                    <p className="status-item">
                        <b>Status:</b> {latestinfodata?.detection_result}
                    </p>

                    <p className="status-item">
                        <b>speed_spec:</b> {latestinfodata?.linespeed_spec}
                    </p>

                    <p className="status-item">
                        <b>speed_real:</b> {latestinfodata?.linespeed_real}
                    </p>
 
        </>

 
    );
}
export default CurrentState