// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import InstructorDashboard from './components/instructor/InstructorDashboard';
import CourseDetail from './components/instructor/CourseDetails';
import StudentDashboard from './components/student/studentinstructor';
import StudentCourseDetail from './components/student/courseContent';
function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Welcome to Avcode</h1>
      <Button asChild>
        <a href="/dashboard">Go to Dashboard</a>
      </Button>
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
