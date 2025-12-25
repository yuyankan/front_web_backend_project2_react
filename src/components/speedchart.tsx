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
                <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px' }}>
                    <h3>LINE SPEED IN RECENT 8 HOURS:</h3>
                </div>
                {/* 2 CHART */}
                <div className="chart-container-wrapper">
                {/* 1. 外部 Div 应用 CSS 类 */}
                {/* 2. ResponsiveContainer 确保充满外部 Div */}
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                        data={speedchartdata}
                        // 移除 margin 属性，如果它已经在 CSS 中处理
                        // 如果您需要精确的内部边距，可以保留 margin prop
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }} 
                        onClick={handlePointClick} // 在图表层捕获点击
                    >
                        {/* 内部 Recharts 元素样式保持不变 (使用 props) */}
                        <CartesianGrid strokeDasharray="5 5" /> 
                        
                        <XAxis 
                            dataKey="createtime_cn" 
                            label={{ value: 'TIME', position: 'insideBottomRight', offset: -5, fontSize:'12', fontWeight: 'bold' }} 
                            tick={{ fontSize: 12, fill: '#888' }}
                            interval={10}
                            // 引入 tickFormatter
                            tickFormatter={formatTimeTick}
                            // 2. 旋转角度：正数顺时针，负数逆时针
                            angle={-45} 
                            // 3. 偏移对齐：旋转后文字中心点会偏，需要调整 textAnchor
                            textAnchor="end" 
                            // 4. 增加高度：旋转文字后，底部需要更多空间防止文字被切断
                            height={60} 
                            // 5. 间距：文字与轴线之间的距离
                            dx={-5}
                        />
                        
                        <YAxis label={{ value: 'LINE SPEED', angle: -90, position: 'insideLeft', fontSize:'12', fontWeight: 'bold' }} />

                        <Tooltip 
                            labelFormatter={(label) => `TIME: ${label}`}
                            formatter={(value, name) => {
                            let displayName = name;
                            
                            // 逻辑判断映射
                            if (name === 'linespeed_real') {
                                displayName = 'LINE SPEED';
                            } else if (name === 'linespeed_spec') {
                                displayName = 'SPEC SPEED';
                            } else if (name === 'product_name') {
                                displayName = 'PRODUCT';
                            }

                            return [`${value}`, displayName];
                            }}
                        />

     

                        {/* 实时速度折线：使用 stroke/strokeWidth props */}
                    <Line 
                            type="monotone" 
                            dataKey="linespeed_real" 
                            name="LINE SPEED"
                            stroke={STATUS_COLORS.default} 
                            strokeWidth={2}
                            // 核心优化：动态渲染数据点
                            dot={(props) => {
                                const { cx, cy, payload } = props;
                                if (cx === undefined || cy === undefined) return null;

                                const status = payload.detection_result;
                                const color = STATUS_COLORS[status] || STATUS_COLORS.default;
                                
                                // NOK 状态的点加大，起到警示作用
                                const isError = status === 'NOK';
                                
                                return (
                                <circle 
                                    key={`dot-${payload.createtime_cn}`}
                                    cx={cx} 
                                    cy={cy} 
                                    r={isError ? 6 : 3.5} 
                                    fill={color} 
                                    stroke={isError ? "#fff" : "none"} // NOK 增加白边，层次感更强
                                    strokeWidth={1}
                                />
                                );
                            }}
                            // 悬停效果优化
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        
                        {/* 规格速度参考线：使用 stroke/strokeDasharray props strokeDasharray="5 5" */}
                        <Line 
                            type="monotone" 
                            dataKey="linespeed_spec" 
                            name="SPEC"
                            stroke="#c1c403e6" 
                            
                            strokeWidth={4}
                            dot={false} 
                        />

                        {/* 虚拟线：仅用于生成 Legend */}
                        <Line name="Detection: NOK" dataKey="none" stroke={STATUS_COLORS.NOK} legendType="circle" />
                        <Line name="Detection: OK" dataKey="none" stroke={STATUS_COLORS.OK_DETECTED} legendType="circle" />
                        <Line name="Detection: OK (no people)" dataKey="none" stroke={STATUS_COLORS.OK_EMPTY} legendType="circle" />
                        <Line name="N/A" dataKey="none" stroke={STATUS_COLORS.na} legendType="circle" />

                        <Legend 
                            verticalAlign="top"   // 垂直方向：顶部
                            align="right"          // 水平方向：右侧
                            layout="horizontal"    // 布局方向：水平排列（也可以选 vertical）
                            iconSize={10}          // 图标大小
                            wrapperStyle={{
                                paddingBottom: '20px', // 与下方图表的间距
                                paddingLeft: '10px',
                                fontSize: '12px'
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>

    );
}

export default Speedchart;
