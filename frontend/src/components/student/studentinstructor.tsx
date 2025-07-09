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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface StudentCourse {
  id: string;
  title: string;
  progress: number;
  instructorName: string;
  startDate: string;
  description?: string;
}

interface UserProfile {
  name: string;
  avatarUrl?: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<StudentCourse[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<StudentCourse[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/user/profile', { withCredentials: true });
        setUser({ name: res.data.name, avatarUrl: res.data.avatarUrl });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const res = await axios.get('/api/student/enrolled', { withCredentials: true });
        setEnrolledCourses(res.data.map((c: any) => ({
          id: c._id,
          title: c.title,
          progress: c.progress || 0,
          instructorName: c.instructorName,
          startDate: c.startDate,
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEnrolled(false);
      }
    };
    const fetchUpcoming = async () => {
      try {
        const res = await axios.get('/api/student/upcoming', { withCredentials: true });
        setUpcomingCourses(res.data.map((c: any) => ({
          id: c._id,
          title: c.title,
          progress: c.progress || 0,
          instructorName: c.instructorName,
          startDate: c.startDate,
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchEnrolled();
    fetchUpcoming();
  }, []);

  if (loadingProfile) return <p className="p-6 text-center">Loading profile...</p>;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-green-50 via-lime-50 to-yellow-50 min-h-screen">
      <header className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Avatar>
            {user?.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback className="bg-green-600 text-white">
                {user?.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <h1 className="text-3xl font-bold text-gray-800">
            Hello, {user?.name}
          </h1>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          Want to Become an Instructor
        </Button>
      </header>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600">
              Become an Instructor
            </DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            Are you sure you want to become an instructor? You will gain access to instructor features and be able to create your own courses.
          </p>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => { setDialogOpen(false); navigate('/instructor/dashboard'); }}>
              Confirm
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="enrolled" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrolled" className="w-1/2">Enrolled Courses</TabsTrigger>
          <TabsTrigger value="upcoming" className="w-1/2">Upcoming Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="enrolled">
          {loadingEnrolled ? (
            <p className="text-center text-gray-500">Loading enrolled courses...</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <Card
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="cursor-pointer transform hover:scale-105 transition-shadow shadow-lg hover:shadow-2xl"
                  >
                    <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl p-5">
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {`By ${course.instructorName} • Starts ${course.startDate}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center p-5">
                      <div>
                        <p className="text-green-600">Progress: {course.progress}%</p>
                      </div>
                      <Avatar>
                        <AvatarFallback className="bg-green-600 text-white">
                          {course.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        <TabsContent value="upcoming">
          {loadingUpcoming ? (
            <p className="text-center text-gray-500">Loading upcoming courses...</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingCourses.map((course) => (
                  <Card
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="cursor-pointer transform hover:scale-105 transition-shadow shadow-lg hover:shadow-2xl"
                  >
                    <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl p-5">
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {`By ${course.instructorName} • Starts ${course.startDate}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center p-5">
                      <p className="text-gray-500 line-clamp-2">
                        {course.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
