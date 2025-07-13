import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface StudentCourse {
  id: string;
  title: string;
  progress?: number;
  instructorName: string;
  startDate?: string;
  description: string;
  tags?: string[];
  rating?: number;
}

interface UserProfile {
  name: string;
  avatarUrl?: string;
}

type Tab = 'enrolled' | 'remaining';

export default function StudentDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<StudentCourse[]>([]);
  const [remainingCourses, setRemainingCourses] = useState<StudentCourse[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [loadingRemaining, setLoadingRemaining] = useState(true);
  const [tab, setTab] = useState<Tab>('enrolled');
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    axios
      .get('/auth/me', { withCredentials: true })
      .then((res) => setUser({ name: res.data.name, avatarUrl: res.data.avatarUrl }))
      .catch((err) => console.error('Error fetching profile:', err))
      .finally(() => setLoadingProfile(false));
  }, []);

  // Fetch courses
  useEffect(() => {
    Promise.all([
      axios.get('/api/student/enrolled', { withCredentials: true }).catch((err) => {
        if (err.response?.status === 404) return { data: [] }; // no enrolled
        console.error(err);
      }),
      axios.get('/api/student/all', { withCredentials: true }).catch((err) => {
        if (err.response?.status === 404) return { data: [] }; // no remaining
        console.error(err);
      }),
    ]).then(([enrolledRes, allRes]: any) => {
      const enrolledData = enrolledRes?.data || [];
      const allData = allRes?.data || [];

      // Map enrolled courses
      setEnrolledCourses(
        enrolledData.map((c: any) => ({
          id: c._id,
          title: c.title,
          progress: c.progress || 0,
          instructorName: c.createdBy?.name || 'Unknown',
          startDate: c.startDate,
          description: c.description,
          tags: c.tags,
          rating: c.content?.rating,
        }))
      );

      // Map remaining courses
      setRemainingCourses(
        allData.map((c: any) => ({
          id: c._id,
          title: c.title,
          instructorName: c.createdBy?.name || 'Unknown',
          startDate: c.startDate,
          description: c.description,
          tags: c.tags,
          rating: c.content?.rating,
        }))
      );

      // Auto-switch tab if no enrolled
      if (enrolledData.length === 0) setTab('remaining');
    }).finally(() => {
      setLoadingEnrolled(false);
      setLoadingRemaining(false);
    });
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
          <h1 className="text-3xl font-extrabold text-gray-800">Hello, {user?.name}</h1>
        </div>
        <Button
          size="lg"
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-2xl"
          onClick={() => setDialogOpen(true)}
        >
          Become an Instructor
        </Button>
      </header>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600">
              Become an Instructor
            </DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-gray-600">
            By becoming an instructor, you can create courses and share your knowledge with students.
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

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrolled" className="w-1/2">
            Enrolled Courses
          </TabsTrigger>
          <TabsTrigger value="remaining" className="w-1/2">
            All Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          {loadingEnrolled ? (
            <p className="text-center text-gray-500">Loading enrolled courses...</p>
          ) : enrolledCourses.length === 0 ? (
            <p className="text-center text-gray-500">No enrolled courses.</p>
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
                      <CardTitle className="text-xl font-semibold text-gray-800">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        By {course.instructorName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5">
                      <p className="text-green-600 mb-3">
                        Progress: {course.progress}%
                      </p>
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={
                              i < (course.rating || 0)
                                ? 'opacity-100'
                                : 'opacity-30'
                            }
                            size={16}
                          />
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-5">
                      <Button variant="ghost">Continue</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="remaining">
          {loadingRemaining ? (
            <p className="text-center text-gray-500">Loading all courses...</p>
          ) : remainingCourses.length === 0 ? (
            <p className="text-center text-gray-500">No available courses.</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="transform hover:scale-105 transition-shadow shadow-lg hover:shadow-2xl"
                  >
                    <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl p-5">
                      <CardTitle className="text-xl font-semibold text-gray-800">
                        {course.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {course.tags?.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 flex flex-col justify-between">
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          By {course.instructorName}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
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
