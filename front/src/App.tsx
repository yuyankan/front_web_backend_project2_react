// ✅ 在应用的根部（例如 App.tsx 或 index.tsx）进行包裹

import { GlobalProvider } from './GlobalContext';
import Dashboard from './Dashboard';
// ... 

function App() {
  return (
    // 确保 GlobalProvider 位于组件树的顶层
    <GlobalProvider>
      <Dashboard>
      
      </Dashboard>
    </GlobalProvider>
  );
}

export default App;