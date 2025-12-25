import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGlobalContext } from '../GlobalContext';
import PlaybackControls from './PlaybackControls';
import '../css/ImageDisplay.css';

// 假设 speedchartdata 的每一项都可以作为播放列表项
interface PlaybackItem {
    image_url: string; 
    createtime_cn: string;
    object_name?: string; // 假设可能有
}

const ImageDisplayArea: React.FC = () => {
    const { latestinfodata, speedchartdata } = useGlobalContext();

    // --- 状态定义 ---
    const [displayMode, setDisplayMode] = useState<'current' | 'playback'>('current');
    const [playbackIndex, setPlaybackIndex] = useState(0);

    // Ref: 用于追踪用户是否在 15s 周期内进行过交互
    const userInteractionRef = useRef(false);
    // Ref: 用于 15s 无操作返回 'current' 模式的计时器
    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Ref: 用于自动播放下一帧的计时器
    const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // 播放列表数据
    const playbackList: PlaybackItem[] = (speedchartdata || []) as PlaybackItem[];

    // 实时图片 URL
    const currentImageUrl = latestinfodata?.image_url || 'http://googleusercontent.com/image_collection/image_retrieval/7613774466542517976_0';

    // 播放下一张图片 (带循环逻辑)
    const playNextImage = useCallback(() => {
        if (playbackList.length === 0) return;
        setPlaybackIndex(prevIndex => (prevIndex + 1) % playbackList.length);
    }, [playbackList.length]);

    // 重置 15s 闲置计时器
    const resetIdleTimer = useCallback(() => {
        // 清除旧的计时器
        if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
        }
        
        // 设置新的计时器：15秒无操作后切换回 'current' 模式
        idleTimeoutRef.current = setTimeout(() => {
            console.log('15秒无操作，切换回默认 Current 模式');
            // 如果处于回放模式，则切换回去
            setDisplayMode(prevMode => (prevMode === 'playback' ? 'current' : prevMode));
        }, 15000); // 15秒 (您要求的时长)
    }, []);


    // --- 播放模式：切换逻辑 (由用户点击开始回放或时间轴选择触发) ---
    const startPlayback = useCallback(() => {
        if (playbackList.length > 0) {
            setPlaybackIndex(0); // 从第一张开始
            setDisplayMode('playback');
            userInteractionRef.current = true; // 算作一次交互
            resetIdleTimer(); // 启动闲置计时器
        }
    }, [playbackList.length, resetIdleTimer]);
    
    // 停止回放，返回实时模式
    const stopPlayback = useCallback(() => {
        setDisplayMode('current');
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
        }
        if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = null;
        }
    }, []);


    // --- useEffect 自动播放和闲置检测 ---

    useEffect(() => {
        // 1. 自动播放 (仅在 'playback' 模式下)
        if (displayMode === 'playback') {
            // 设置一个间隔，例如每 2 秒播放下一帧
            autoPlayIntervalRef.current = setInterval(playNextImage, 2000); // 2秒自动播放一帧
        } else {
            // 清除自动播放定时器
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
                autoPlayIntervalRef.current = null;
            }
        }
        
        // 2. 闲置检测 (仅在 'playback' 模式下)
        // 每次进入 'playback' 模式或相关状态改变时，启动/重置闲置计时器
        if (displayMode === 'playback') {
            resetIdleTimer();
        } else {
            // 退出 'playback' 模式时清除闲置计时器
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current);
                idleTimeoutRef.current = null;
            }
        }

        // 清理函数：组件卸载或依赖项改变时清除所有计时器
        return () => {
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current);
            }
        };
    }, [displayMode, playNextImage, resetIdleTimer]); // playNextImage, resetIdleTimer 都是 useCallback 包装的

    // --- 渲染数据确定 ---
    let imageUrl = currentImageUrl;
    let imageAlt = `CURRENT IMAGE: ${latestinfodata?.object_name || 'N/A'}`;

    if (displayMode === 'playback' && playbackList.length > 0) {
        const currentItem = playbackList[playbackIndex];
        imageUrl = currentItem.image_url;
        imageAlt = `PLAYBACK TIME: ${currentItem.createtime_cn} (${currentItem.object_name || 'N/A'})`;
    }


        // 🚨 步骤 2B: 实现时间条拖动回调 🚨
    // 用户通过时间条选择新的图片索引
    const handleTimeChange = useCallback((newIndex: number) => {
        if (newIndex >= 0 && newIndex < playbackList.length) {
            setPlaybackIndex(newIndex);
            resetIdleTimer(); // 拖动时间条也算作一次交互，重置计时器
        }
    }, [playbackList.length, resetIdleTimer]); // 依赖 playbackList.length 和 resetIdleTimer


    // 🚨 步骤 2A: 计算时间标签数组 🚨
    // 准备时间标签列表，作为 props 传递给 PlaybackControls
    const playbackTimeLabels = useMemo(() => 
        playbackList.map(item => item.createtime_cn), 
    [playbackList]); // 依赖 playbackList

    // --- 渲染部分 ---
    return (
        <div 
            className='image_container'
            // 任何交互都重置 15s 闲置计时器
            onMouseMove={resetIdleTimer}
            onClick={resetIdleTimer}
            onWheel={resetIdleTimer}
        >
            <div >
            {/* 图片展示 */}
            <img 
                src={imageUrl} 
                alt={imageAlt}
                className='image_image' // 使用外部样式
            />
        
    

            {/* 播放模式下的控制 UI */}
            {displayMode === 'playback' && playbackList.length > 0 && (
                            // 内部的 PlaybackControls 组件将在下一步修改
                <PlaybackControls
                        imageAlt={imageAlt}
                        playbackIndex={playbackIndex}
                        playbackListLength={playbackList.length}
                        onNext={() => { playNextImage(); resetIdleTimer(); }}
                        onStop={stopPlayback}
                        
                        // 🎯 关键传入点：将数据和回调函数作为 Props 传递 🎯
                        playbackTimeLabels={playbackTimeLabels}
                        onTimeChange={handleTimeChange}
                    />
                            )}

            {/* 进入回放模式的按钮 */}
            {displayMode === 'current' && playbackList.length > 0 && (
                <button 
                    onClick={startPlayback} 
                    style={{ position: 'absolute', top: 10, right: 10 }}
                >
                    开始历史回放 ({playbackList.length} 帧)
                </button>
            )}
            
            {/* 当前模式提示 */}
            <div style={{ position: 'absolute', top: 10, left: 10, padding: '5px', background: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>
                当前模式: {displayMode === 'current' ? '实时' : '历史回放'}
            </div>
            
            </div>
           </div> 

      
    );
};

export default ImageDisplayArea;