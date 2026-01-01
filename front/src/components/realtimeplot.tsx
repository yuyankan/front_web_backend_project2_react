import React from 'react';

import { useGlobalContext } from '../GlobalContext';
import '../css/speedchart.css';
import Currentstate from './currentstate';
import Speedchart from './speedchart';
import ImageDisplayArea from './picurl';

// 2. 将组件定义为 React.FC (Function Component)
export const RealTimeStatusChart: React.FC = () => {
  // 获取最新的数据点用于状态显示
  const {latestinfodata} = useGlobalContext();

  return (
    <>
  
      {/* ---------------------------------------------- */}
      <div style={{ 
            margin: '0 5%',
           
           
            minHeight:'160px',
            height: '20%', 
            //border: '2px solid blue',

            /* 核心修改：从中心纯黑向四周 100% 透明渐变 */
            background: 'radial-gradient(circle, rgba(85, 73, 73, 0.55) 0%, rgba(4, 1, 17, 0.95) 70%)'
          }}>
            {/*, border:'2px solid blue'*/}
            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0px' , height:"60%",width:'100%'}}>
                <h2 style={{ margin: "0", fontSize: "40px", color: "#f5f6f9ff" ,textAlign: "center", padding: "0px 0px 0px 30px"}}>CURRENT STATE:</h2>
                {/* 将时间放在 H2 旁边，但作为普通文本/p 标签 */}
                <p style={{ marginLeft: '25px', fontSize: '30px',color:'darkorange'}}>
                    <b></b> {latestinfodata?.createtime_cn}
                </p>
            </div>
            {/* ---------------------------------------------- */}
            {/*whole div for below:*/}
            <div className="status-grid">
              < Currentstate />
            </div>
      </div>
       {/* ---------------------------------------------- */}
      <hr style={{ margin: '20px 0' }} />
      {/* 2 speed  */}
      <div className='speed-pic'>
          <div className="left_panel_speed">
            < Speedchart />
          </div>
          {/* ---------------------------------------------- */}
          {/* 2 pic */}
          <div className="right_panel_image">
          
            < ImageDisplayArea />
          </div>
          {/* ---------------------------------------------- */}
      </div>
    </>
 
    );
}

export default RealTimeStatusChart;