import React, { useEffect, useState, useMemo } from 'react';
import { useGlobalContext } from '../GlobalContext';

const ImageDisplayArea: React.FC = () => {
    const { latestinfodata, selectedPoint, default_pic_minio_url } = useGlobalContext();
    const API_BASE = "http://localhost:8000";
    
    // --- 状态与性能优化 ---
    // 增加一个过渡状态，防止图片切换瞬间内存峰值
    const [isChanging, setIsChanging] = useState(false);
    const [activeImageUrl, setActiveImageUrl] = useState<string>("");

    // 1. 确定当前应该显示的 URL (计算逻辑保持不变)
    // 1. 计算当前生效的 Object Key
    const activeKey = useMemo(() => {
        return selectedPoint?.image_url || latestinfodata?.image_url;
    }, [selectedPoint, latestinfodata]);

    useEffect(() => {
        let isCancelled = false;
        
    // 在 ImageDisplayArea 内部的 useEffect 中
    const fetchUrl = async () => {
        if (!activeKey) {
            setActiveImageUrl(default_pic_minio_url);
            return;
        }

        setIsChanging(true);
        try {
            // 使用绝对路径，并确保 Key 编码正确
            const response = await fetch(`${API_BASE}/api/get_url?object_name=${encodeURIComponent(activeKey)}`);
            
            if (!response.ok) throw new Error("Network response was not ok");
            
            const data = await response.json();
            
            if (!isCancelled) {
                setActiveImageUrl(data.url);
                // 给浏览器一个微小的喘息时间来处理 DOM 切换
                setTimeout(() => setIsChanging(false), 30);
            }
        } catch (err) {
            console.error("Fetch URL Error:", err);
            if (!isCancelled) {
                setActiveImageUrl(default_pic_minio_url);
                setIsChanging(false);
            }
        }
    };

        fetchUrl();
        return () => { isCancelled = true; };
    }, [activeKey, default_pic_minio_url]);

    // 2. 内存清理与 DOM 强制刷新
    useEffect(() => {
        // 当 URL 准备改变时，先设置切换状态
        setIsChanging(true);
        
        const timer = setTimeout(() => {
            setIsChanging(false);
        }, 50); // 极短的延迟有助于浏览器释放上一个 img 对象的显存

        return () => {
            clearTimeout(timer);
            console.log("清理旧图片引用，当前 URL:", activeImageUrl);
        };
    }, [activeImageUrl]);

    // 3. 业务数据逻辑封装 (useMemo 优化减少重复计算)
    const { displayData, statusLabel } = useMemo(() => ({
        displayData: selectedPoint || latestinfodata,
        statusLabel: selectedPoint ? "Historical Detail" : "Live Detail"
    }), [selectedPoint, latestinfodata]);

    const allowedKeys = ['production_line', 'product_name', 'linespeed_spec', 'linespeed_real', 'detection_result'];

    return (
        <>
            <h3 style={{ position: 'relative', color: '#fc0707ff', padding: '4px 0px', borderBottom: 'solid red 1px', marginBottom: '10px' }}>
                IMAGE INSPECTION: 
            </h3>
               
            <div className='right_panel_image_sub' style={{ display: 'flex', gap: '20px' }}>
                <div className="image_wrapper" style={{ position: 'relative', flex: 2, background: '#000', minHeight: '300px',  alignItems: 'center', justifyContent: 'center' }}>
                    
                    {/* 状态提示：历史记录模式 */}
                    {selectedPoint && (
                        <div style={{ position: 'relative', top: 0, left: 0, zIndex: 10, background: 'rgba(252, 7, 7, 0.8)', color: '#fff', padding: '4px 12px', fontSize: '12px' }}>
                            HISTORY MODE (Auto-return in 5s)
                        </div>
                    )}

                    {/* 图片渲染核心：使用 key 强制回收 
                    key={imageUrl} 起到的核心作用。
                    普通切换：如果你只改 src 而不改 key，React 会保留同一个 <img> 节点。浏览器在后台下载新图时，旧图的数据往往还“缓存”在当前的渲染实例中。
                    使用 Key 切换：React 会直接将旧的 DOM 节点从内存中彻底抹除，然后创建一个全新的节点。这种“先破坏再重建”的操作是强制浏览器释放旧节点关联的显存（VRAM）最有效的方法。             
                    */}
                    {activeImageUrl && !isChanging ? (
                        <img 
                            key={activeImageUrl} // 关键优化：URL 变了，整个 img 标签会被物理销毁并重建，释放显存
                            src={activeImageUrl} 
                            className='image_image'
                            alt="Inspection Target"
                            loading="lazy"
                            style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                        />
                    ) : (
                        <div className="loader">
                            <span style={{ color: '#fff' }}>🔄 Switching Stream...</span>
                        </div>
                    )}
                </div>

                <div className="image_detail_panel" style={{ flex: 1, padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <h4 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>{statusLabel}:</h4>
                    {displayData ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {allowedKeys.map((key) => {
                                const value = (displayData as any)[key];
                                if (value === undefined || value === null) return null;

                                return (
                                    <li key={key} style={{ display: 'flex', alignItems: 'baseline', marginBottom: '12px', fontSize: '14px' }}>
                                        <strong style={{ color: '#666', minWidth: '100px', fontSize: '12px' }}>
                                            {key.replace('_', ' ').toUpperCase()}:
                                        </strong> 
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            color: key === 'detection_result' && value === 'NOK' ? 'red' : '#333' 
                                        }}>
                                            {String(value)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p>Waiting for data signal...</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default ImageDisplayArea;