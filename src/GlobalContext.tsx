// GlobalContext.ts
import * as React from "react";
import type { RawDataMeta, onepointshow } from "./types";

// ... (GlobalState 接口保持不变)

interface GlobalState {
  cleanButton: boolean;
  setClean: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setisLoading: React.Dispatch<React.SetStateAction<boolean>>; // 目标名称
  allMeta: RawDataMeta[];
  setMeta: React.Dispatch<React.SetStateAction<RawDataMeta[]>>;
  latestinfodata: onepointshow | undefined;
  setlatestinfo: React.Dispatch<React.SetStateAction<onepointshow| undefined>>;
  speedchartdata: onepointshow[];
  setspeedchart: React.Dispatch<React.SetStateAction<onepointshow[]>>; // 目标名称
  selectedPoint: onepointshow | undefined;
  setselectedPoint: React.Dispatch<React.SetStateAction<onepointshow | undefined>>;
  default_pic_minio_url: string;
  setdefault_pic_minio_url: React.Dispatch<React.SetStateAction<string>>;

}

// 1️⃣ 创建 context
const GlobalContext = React.createContext<GlobalState | undefined>(undefined);

export const useGlobalContext = (): GlobalState => {
  const ctx = React.useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobalContext must be used within GlobalProvider");
  return ctx;
};


// 2️⃣ Provider 组件
export const GlobalProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {

  // 1. 变量名修改：setIsLoading -> setisLoading
  const [isLoading, setisLoading] = React.useState(true); 
  const [allMeta, setMeta] = React.useState<RawDataMeta[]>([])
  const [cleanButton, setClean] = React.useState(false);
  // 2. 变量名修改：setspeedchartdata -> setspeedchart
  const [speedchartdata, setspeedchart] = React.useState<onepointshow[]>([]); 
  // ✅ 推荐：初始化为 undefined，表示尚未收到任何数据
  const [latestinfodata, setlatestinfo] = React.useState<onepointshow | undefined>(undefined);
  const [selectedPoint, setselectedPoint] = React.useState<onepointshow | undefined>(undefined);
  const [default_pic_minio_url, setdefault_pic_minio_url] = React.useState<string>('');

  

  // 5️⃣ Memoized context value
  const value = React.useMemo(
    () => ({
      isLoading,
      setisLoading, // ✅ 现在名称匹配
      cleanButton,
      setClean,
      allMeta,
      setMeta,
      latestinfodata,
      setlatestinfo,
      speedchartdata,
      setspeedchart, // ✅ 现在名称匹配
      selectedPoint,
      setselectedPoint,
      default_pic_minio_url,
      setdefault_pic_minio_url

    }),
    [
      isLoading, setisLoading, cleanButton, setClean, allMeta, setMeta, 
      latestinfodata, setlatestinfo, speedchartdata, setspeedchart,selectedPoint,setselectedPoint,
      default_pic_minio_url, setdefault_pic_minio_url // 依赖数组也需同步修改
    ]
  );


  return <GlobalContext.Provider value={value}>{children ?? null}</GlobalContext.Provider>;
};