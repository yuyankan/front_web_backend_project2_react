import React from 'react';
import '../css/ImageDisplay.css';

interface PlaybackControlsProps {
    imageAlt: string;
    playbackIndex: number;
    playbackListLength: number;
    onNext: () => void;
    onStop: () => void;
    // 新增：时间条相关的 Props
    playbackTimeLabels: string[]; // 所有时间标签的列表
    onTimeChange: (index: number) => void; // 拖动时间条的回调
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
    imageAlt,
    playbackIndex,
    playbackListLength,
    onNext,
    onStop,
    playbackTimeLabels,
    onTimeChange
}) => {
    
    // 处理时间条滑动或点击
    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newIndex = parseInt(event.target.value, 10);
        onTimeChange(newIndex);
    };

    // 格式化当前时间显示
    const currentTimeLabel = playbackTimeLabels[playbackIndex] || 'N/A';




    return (
        <div className='controlsContainer'>
            {/* 时间信息 */}
            <p className='infoText'>{imageAlt}</p>
            
            {/* 2. 时间条 (Slider) */}
            <div style={{ width: '80%', margin: '10px 0' }}>
                <input
                    type="range"
                    min="0"
                    max={playbackListLength > 0 ? playbackListLength - 1 : 0}
                    value={playbackIndex}
                    onChange={handleSliderChange}
                    style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>{playbackTimeLabels[0] || ''}</span>
                    <span>{currentTimeLabel}</span>
                    <span>{playbackTimeLabels[playbackListLength - 1] || ''}</span>
                </div>
            </div>

            {/* 1. 按钮组 */}
            <div className='buttonGroup'>
                <button onClick={onNext} disabled={playbackListLength === 0}>
                    下一帧 ({playbackIndex + 1}/{playbackListLength})
                </button>
                <button onClick={onStop}>
                    停止回放
                </button>
            </div>
        </div>
    );
};

export default PlaybackControls;