import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SurveyStationLayout from './pages/SurveyStation/components/SurveyStationLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/survey-station" element={<SurveyStationLayout />} />
      {/* other routes */}
    </Routes>
  );
}

export default App; 