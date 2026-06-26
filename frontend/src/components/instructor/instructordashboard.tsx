import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddCourseForm from './createcourse';

interface Course {
  id: string;
  title: string;
  description: string;
  rating?: number;
  comments?: number;
}

export default function InstructorDashboard() {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/instructor/courses', { withCredentials: true });
      setCourses(res.data.map((c: any) => ({
        id: c._id,
        title: c.title,
        description: c.description,
        rating: c.rating || 0,
        comments: c.comments || 0,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const authRes = await axios.get('/auth/me', { withCredentials: true });
        if (!authRes.data.roles || !authRes.data.roles.includes('instructor')) {
          navigate('/student/dashboard');
          return;
        }
        setCheckingAuth(false);
        
        await fetchCourses();
      } catch (err) {
        console.error(err);
        navigate('/'); // redirect to login if not authenticated
      }
    };
    checkAuthAndFetch();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('/auth/logout', { withCredentials: true });
      navigate('/');
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  };

  if (checkingAuth) {
    return <p className="p-6 text-center text-gray-500">Verifying access...</p>;
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Instructor Dashboard
        </h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
            Switch to Student View
          </Button>
          <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl">
            + Add Course
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-600">
              Create New Course
            </DialogTitle>
          </DialogHeader>
          <AddCourseForm onClose={() => { setOpen(false); fetchCourses(); }} />
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-center text-gray-500">Loading courses...</p>
      ) : (
        <ScrollArea className="h-[70vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
                className="cursor-pointer transform hover:scale-105 transition-shadow shadow-lg hover:shadow-2xl"
              >
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl p-5">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center p-5">
                  <div>
                    <p className="text-indigo-600">⭐ {course.rating}</p>
                    <p className="text-gray-500">💬 {course.comments} comments</p>
                  </div>
                  <Avatar>
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&background=random`}
                      alt={course.title}
                    />
                    <AvatarFallback className="bg-indigo-600 text-white">
                      {course.title.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

