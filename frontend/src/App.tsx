import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import InstructorDashboard from './components/instructor/instructordashboard';
import CourseDetail from './components/instructor/CourseDetails';
import StudentDashboard from './components/student/studentinstructor';
import StudentCourseDetail from './components/student/courseContent';

function Home() {
  useEffect(() => {
    window.location.href = 'http://localhost:5000/auth/google';
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Redirecting to Google Login...</h1>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<InstructorDashboard />} />
      <Route path="/instructor/courses/:courseId" element={<CourseDetail />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
    </Routes>
  );
}
