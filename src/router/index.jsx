import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import SurveyStation from '../pages/SurveyStation';
import FreeStation from '../pages/FreeStation';
import TraverseCalculation from '../pages/TraverseCalculation';
import ConstructionLayout from '../pages/ConstructionLayout';
import BatchCalculation from '../pages/BatchCalculation';
import PileCalculation from '../pages/PileCalculation';
import Tools from '../pages/Tools';
import SettlementMonitoring from '../pages/SettlementMonitoring';
import CircleCalculation from '../pages/BatchCalculation';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'home',
        element: <Home />
      },
      {
        path: 'about',
        element: <div style={{ padding: '50px', textAlign: 'center' }}>
          <h1>關於我們</h1>
          <p>測量工程計算系統是一個專業的測量工程解決方案，為您提供精確的計算工具和全面的數據支持。</p>
        </div>
      },
      {
        path: 'contact',
        element: <div style={{ padding: '50px', textAlign: 'center' }}>
          <h1>聯繫我們</h1>
          <p>如有任何問題或建議，請發送郵件至：contact@example.com</p>
        </div>
      },
      {
        path: 'privacy',
        element: <div style={{ padding: '50px', textAlign: 'center' }}>
          <h1>隱私政策</h1>
          <p>我們重視您的隱私，並致力於保護您的個人信息。</p>
        </div>
      },
      {
        path: 'terms',
        element: <div style={{ padding: '50px', textAlign: 'center' }}>
          <h1>使用條款</h1>
          <p>使用本系統即表示您同意遵守我們的使用條款。</p>
        </div>
      },
      {
        path: 'survey-station',
        element: <SurveyStation />
      },
      {
        path: 'free-station',
        element: <FreeStation />
      },
      {
        path: 'traverse-calculation',
        element: <TraverseCalculation />
      },
      {
        path: 'construction-layout',
        element: <ConstructionLayout />
      },
      {
        path: 'batch-calculation',
        element: <BatchCalculation />
      },
      {
        path: 'pile-calculation',
        element: <PileCalculation />
      },
      {
        path: 'tools',
        element: <Tools />
      },
      {
        path: 'settlement-monitoring',
        element: <SettlementMonitoring />
      },
      {
        path: 'circle-calculation',
        element: <CircleCalculation />
      }
    ]
  }
]);

export default router;