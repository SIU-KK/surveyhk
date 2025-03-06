import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import SurveyStation from '../pages/SurveyStation';
import FreeStation from '../pages/FreeStation';
import TraverseCalculation from '../pages/TraverseCalculation';
import ConstructionLayout from '../pages/ConstructionLayout';
import BatchCalculation from '../pages/BatchCalculation';
import Tools from '../pages/Tools';
import SettlementMonitoring from '../pages/SettlementMonitoring';

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
        path: 'tools',
        element: <Tools />
      },
      {
        path: 'settlement-monitoring',
        element: <SettlementMonitoring />
      }
    ]
  }
]);

export default router;