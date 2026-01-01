import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

import { useGlobalContext } from '../GlobalContext';
import '../css/speedchart.css';


// 定义类型
interface StatusColorMap {
  [key: string]: string; // 允许使用任何字符串作为索引
  NOK: string;
  OK_EMPTY: string;
  OK_DETECTED: string;
  na: string;
  default: string;
}


const formatTimeTick = (tickItem: string): string => {
    // 尝试解析日期时间字符串
    const date = new Date(tickItem);

    // 检查日期对象是否有效
    if (isNaN(date.getTime())) {
        return tickItem; // 如果解析失败，返回原始字符串
    }

    // 获取小时和分钟，并确保两位数格式 (例如 8 -> 08)
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
};

    // 2. 将组件定义为 React.FC (Function Component)
const Speedchart: React.FC = () => {
    // 获取最新的数据点用于状态显示
    const {speedchartdata,setselectedPoint} = useGlobalContext();

    // 2. 点击事件处理函数
    const handlePointClick = (state: any) => {
        if (state && state.activeTooltipIndex !== undefined) {
            // 1. 获取点击的索引 (转换为数字)
            const index = Number(state.activeTooltipIndex);
            
            // 2. 从原始数据源中直接通过下标取值
            const clickedData = speedchartdata[index];
            
            if (clickedData) {
                console.log("成功获取点数据:", clickedData);
                setselectedPoint(clickedData);
            }
        }
    };


    const STATUS_COLORS:StatusColorMap = {
                'NOK': '#FF0000',           // 红色
                'OK_EMPTY': '#00008B',      // 深蓝色
                'OK_DETECTED': "#90f405e6" ,   // 绿色
                'na': '#808080',            // 灰色
                'default': '#0b057dff'      // 默认颜色
                };
                
    return (
        <>
                {/* 2 HEAD */}
                <div style={{ display: 'flex', alignItems: 'baseline', padding: '5px 0px 0px 50px' , border:'2 solid red'}}>
                    <h3 style={{ color:"black", fontSize:"30px"}}>LINE SPEED IN RECENT 8 HOURS:</h3>
                </div>
                {/* 2 CHART */}
                <div className="chart-container-wrapper">
                {/* 1. 外部 Div 应用 CSS 类 */}
                {/* 2. ResponsiveContainer 确保充满外部 Div */}
                <ResponsiveContainer width="100%" height="90%" >
                    <LineChart
                        data={speedchartdata}
                        margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
                        onClick={handlePointClick}
                     
                    >
                       
                        {/* 3. 网格层：降低透明度，增强通透感 */}
                        <CartesianGrid strokeDasharray="5 5" strokeOpacity={0.2} />

                        {/* 4. 坐标轴层 */}
                        <XAxis
                        dataKey="createtime_cn"
                        label={{ value: 'TIME', position: 'insideBottom', offset: 0, fontSize: 20, fontWeight: 'bold',fill:'#444242ff' }}
                        tick={{ fontSize: 12, fill: '#444242ff' }}
                        interval={20}
                        tickFormatter={formatTimeTick}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        dx={-5}
                        />
                        <YAxis 
                        label={{ value: 'LINE SPEED', angle: -90, position: 'insideLeft', fontSize: '20', fontWeight: 'bold',offset:0 ,fill:'#444242ff'}}
                        tick={{ fontSize: 16, fill: '#444242ff' }} 
                      
                        />

                        {/* 5. 交互层 */}
                        <Tooltip
                        labelFormatter={(label) => `TIME: ${label}`}
                        formatter={(value, name) => {
                            let displayName = name;
                            if (name === 'product_name') displayName = 'PRODUCT';
                            return [`${value}`, displayName];
                        }}
                        />

                        <Line 
                            type="monotone" 
                            dataKey="product_name" 
                            stroke="none"      // 不显示线
                            dot={false}        // 不显示点
                            activeDot={false}  // 也不显示活跃点
                            legendType="none"  // 也不显示在图例里
                        />


                        <Line 
                            type="monotone" 
                            dataKey="detection_result" 
                            stroke="none"      // 不显示线
                            dot={false}        // 不显示点
                            activeDot={false}  // 也不显示活跃点
                            legendType="none"  // 也不显示在图例里
                        />

                        {/* 6. 数据折线层 */}
                        <Line
                        type="monotone"
                        dataKey="linespeed_real"
                        name="LINE SPEED"
                        stroke={STATUS_COLORS.default}
                        strokeWidth={2}
                        dot={(props) => {
                            const { cx, cy, payload } = props;
                            if (cx === undefined || cy === undefined) return null;
                            const status = payload.detection_result;
                            const color = STATUS_COLORS[status] || STATUS_COLORS.default;
                            const isError = status === 'NOK';
                            return (
                            <circle
                                key={`dot-${payload.createtime_cn}`}
                                cx={cx}
                                cy={cy}
                                r={isError ? 6 : 3.5}
                                fill={color}
                                stroke={isError ? "#fff" : "none"}
                                strokeWidth={1}
                            />
                            );
                        }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                        />

                        <Line
                        type="monotone"
                        dataKey="linespeed_spec"
                        name="SPEC"
                        stroke="#05d235e6"
                        strokeWidth={4}
                        dot={false}
                        />
                      
                        




                        {/* 7. 虚拟线（用于 Legend 映射） */}
                        <Line name="Detection: NOK" dataKey="none" stroke={STATUS_COLORS.NOK} legendType="circle" />
                        <Line name="Detection: OK" dataKey="none" stroke={STATUS_COLORS.OK_DETECTED} legendType="circle" />
                        <Line name="Detection: OK (no people)" dataKey="none" stroke={STATUS_COLORS.OK_EMPTY} legendType="circle" />
                        <Line name="N/A" dataKey="none" stroke={STATUS_COLORS.na} legendType="circle" />

                        


                        

                        <Legend
                        verticalAlign="top"
                        align="right"
                        layout="horizontal"
                        iconSize={12}
                        wrapperStyle={{
                            paddingBottom: '20px',
                            paddingLeft: '20px',
                            fontSize: '15px'
                        }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>

    );
}

export default Speedchart;
