// useDataSelections.ts

import type { RawDataMeta } from "../types";

import { useCallback, useEffect, useRef } from 'react';
import { useGlobalContext } from '../GlobalContext';


export const useInitializeMeta = () => {
    const { 
        setisLoading, setMeta, setlatestinfo, 
        setspeedchart, selectedPoint, setselectedPoint, setdefault_pic_minio_url 
    } = useGlobalContext();

    // 优化的处理逻辑
    const processIncomingData = useCallback((newData: RawDataMeta[], pic_url: string) => {
        if (!newData || newData.length === 0) return;
        
        setdefault_pic_minio_url(pic_url);

        // 1. 更新全量元数据 (用于详情查看等)
        setMeta(prevMeta => {
            const combined = [...prevMeta, ...newData];
            const latestTs = new Date(newData[newData.length - 1].createtime_cn).getTime();
            const threshold = latestTs - (8 * 60 * 60 * 1000);
            // 滑动窗口：只保留 8 小时内的数据
            return combined.filter(item => new Date(item.createtime_cn).getTime() >= threshold);
        });

        // 2. 增量更新图表数据 (核心优化：只对 newData 进行 map)
        const newChartPoints = newData.map(item => ({
            createtime_cn: item.createtime_cn,
            linespeed_real: item.linespeed_real,
            linespeed_spec: item.linespeed_spec,
            product_name: item.product_name,
            detection_result: item.detection_result,
            object_name: item.object_name,
            production_line: item.production_line,
            image_url: item.image_url,

            // 只提取图表渲染必须的字段，减少对象体积
        }));

        setspeedchart(prevChartData => {
            const combinedChart = [...prevChartData, ...newChartPoints];
            
            // 如果数据量超过预设（比如 2000 条），剔除旧数据
            // 使用 slice 比 filter 性能更高，因为它不涉及日期转换逻辑
            if (combinedChart.length > 480) {
                return combinedChart.slice(-480); 
            }
            return combinedChart;
        });

        // 3. 更新最新单条状态
        setlatestinfo(newData[newData.length - 1]);
        setisLoading(false);
}, [setisLoading, setlatestinfo, setMeta, setspeedchart, setdefault_pic_minio_url]);

    // WebSocket 连接保持不变，但 processIncomingData 的依赖更干净
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/realtime");
        ws.onopen = () => setisLoading(true);
        ws.onmessage = (event) => {
            try {
                const res = JSON.parse(event.data);
                processIncomingData(res.info, res.default_pic_minio_url);
            } catch (err) {
                console.error("WS Parse Error:", err);
            }
        };
        ws.onerror = () => setisLoading(false);
        return () => ws.close();
    }, [processIncomingData, setisLoading]);

    // --- 3. 闲置计时器逻辑封装 ---
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        if (selectedPoint) {
            idleTimerRef.current = setTimeout(() => {
                setselectedPoint(undefined); 
            }, 5000);
        }
    }, [selectedPoint, setselectedPoint]);

    useEffect(() => {
        if (selectedPoint) {
            resetIdleTimer();
        }
        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [selectedPoint, resetIdleTimer]);
};