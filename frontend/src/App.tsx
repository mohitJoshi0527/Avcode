import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import InstructorDashboard from './components/instructor/InstructorDashboard';
import CourseDetail from './components/instructor/CourseDetails';
import StudentDashboard from './components/student/studentinstructor';
import StudentCourseDetail from './components/student/courseContent';

import { Toaster } from 'sonner';
import AuthPage from './components/auth/AuthPage';

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<InstructorDashboard />} />
      <Route path="/instructor/courses/:courseId" element={<CourseDetail />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
    </Routes>
    </>
  );
}
