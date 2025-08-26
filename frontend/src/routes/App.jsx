import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../views/Landing.jsx';
import TeacherCreate from '../views/TeacherCreate.jsx';
import TeacherDashboard from '../views/TeacherDashboard.jsx';
import StudentRoom from '../views/StudentRoom.jsx';

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/teacher/create" element={<TeacherCreate />} />
      <Route path="/teacher/:pollId" element={<TeacherDashboard />} />
      <Route path="/student/:pollId" element={<StudentRoom />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}