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
                        <span className="status-item-name">
                            Current product:
                        </span>
                        <span className="status-item-value">
                            {latestinfodata?.product_name}
                        </span>
                        
                    </p>


                    <p className="status-item">
                        <span className="status-item-name">
                            Status:
                        </span>
                        <span className="status-item-value">
                            {latestinfodata?.detection_result}
                        </span>
                        
                    </p>


                    <p className="status-item">
                        <span className="status-item-name">
                            Speed_spec(m/min):
                        </span>
                        <span className="status-item-value">
                            {latestinfodata?.linespeed_spec}
                        </span>
                        
                    </p>


                    <p className="status-item">
                        <span className="status-item-name">
                            Speed_real(m/min)
                        </span>
                        <span className="status-item-value">
                            {latestinfodata?.linespeed_real}
                        </span>
                        
                    </p>
 
        </>

 
    );
}
export default CurrentState