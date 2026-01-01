//import Selectorui,{type Selectordata} from "./Selector";
import {RealTimeStatusChart} from "./components/realtimeplot";
import {useInitializeMeta} from "./components/useDataSelections";
import Header from "./Header"
import './css/main_layout.css';
import './index.css'

  

export default function Dashboard() {
    //initialize
 
  useInitializeMeta();

  console.log('hi-starting')
 
return (
  /* 使用一个根 div 包裹所有内容 */
  <>
    
    {/* 1. 标题/页眉区域：通常放在最上方 */}
    <Header /> 

    {/* 2. 主内容容器 */}
    <div className="overallContainer">
      
      {/* 3. 状态和图表的主容器 */}
      <div className="child1_overallContainer">
        <RealTimeStatusChart />
        {/* ... 其他内容 ... */}
      </div>

    </div>
  </>
);
}