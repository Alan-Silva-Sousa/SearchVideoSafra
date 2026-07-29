import { Routes, Route, Navigate } from "react-router-dom";
import RecordingListPage from "./pages/RecordingListPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RecordingListPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
