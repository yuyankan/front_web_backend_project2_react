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
      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' , width:'30%', border:'2px solid blue'}}>
          <h2>Current status:</h2>
          
          {/* 将时间放在 H2 旁边，但作为普通文本/p 标签 */}
          <p style={{ marginLeft: '15px', fontSize: '1.2em' }}>
              <b></b> {latestinfodata?.createtime_cn}
          </p>
      </div>
      {/* ---------------------------------------------- */}
      {/*whole div for below:*/}
      <div className="status-grid">
        < Currentstate />
      </div>
       {/* ---------------------------------------------- */}
      <hr style={{ margin: '20px 0' }} />
      {/* 2 speed */}
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