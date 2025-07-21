
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Rating } from '@/components/ui/rating';

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

  // Dialogs
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);
  const [ratingValue, setRatingValue] = useState(0);

  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    axios
      .get('/auth/me', { withCredentials: true })
      .then(res => setUser({ name: res.data.name, avatarUrl: res.data.avatarUrl }))
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, []);

  // Load courses
  const loadCourses = () => {
    setLoadingEnrolled(true);
    setLoadingRemaining(true);
    Promise.all([
      axios.get('/api/student/enrolled', { withCredentials: true }).catch(() => ({ data: [] })),
      axios.get('/api/student/all', { withCredentials: true }).catch(() => ({ data: [] })),
    ])
      .then(([enRes, allRes]: any) => {
        setEnrolledCourses(
          enRes.data.map((c: any) => ({
            id: c._id,
            title: c.title,
            progress: c.progress || 0,
            instructorName: c.createdBy?.name || 'Unknown',
            description: c.description,
            tags: c.tags,
            rating: c.content.rating,
          }))
        );
        setRemainingCourses(
          allRes.data.map((c: any) => ({
            id: c._id,
            title: c.title,
            instructorName: c.createdBy?.name || 'Unknown',
            description: c.description,
            tags: c.tags,
            rating: c.content.rating,
          }))
        );
        if (enRes.data.length === 0) setTab('remaining');
      })
      .finally(() => {
        setLoadingEnrolled(false);
        setLoadingRemaining(false);
      });
  };
  useEffect(loadCourses, []);

  // Handlers
  const openInstructorDialog = () => setInstructorDialogOpen(true);
  const openDetails = (course: StudentCourse) => {
    setSelectedCourse(course);
    setDetailsDialogOpen(true);
  };
  const openRate = (course: StudentCourse) => {
    setSelectedCourse(course);
    setRatingValue(0);
    setRateDialogOpen(true);
  };

  const handleEnroll = async (id: string) => {
    try {
      await axios.post(`/api/student/enroll/${id}`, {}, { withCredentials: true });
      loadCourses();
      setDetailsDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const submitRating = async () => {
    if (!selectedCourse) return;
    try {
      await axios.post(
        `/api/student/course/${selectedCourse.id}/rate`,
        { rating: ratingValue },
        { withCredentials: true }
      );
      setRateDialogOpen(false);
      loadCourses();
    } catch (err) {
      console.error(err);
    }
  };

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
        <Button onClick={openInstructorDialog} size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-2xl">
          Become an Instructor
        </Button>
      </header>

      {/* Instructor Dialog */}
      <Dialog open={instructorDialogOpen} onOpenChange={setInstructorDialogOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600">
              Become an Instructor
            </DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-gray-600">
            By becoming an instructor, you can create courses and share your knowledge.
          </p>
          <DialogFooter className="flex justify-end space-x-2">
            <Button onClick={() => { setInstructorDialogOpen(false); navigate('/dashboard'); }}>
              Confirm
            </Button>
            <Button variant="outline" onClick={() => setInstructorDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={tab} onValueChange={v => setTab(v as Tab)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrolled" className="w-1/2">Enrolled Courses</TabsTrigger>
          <TabsTrigger value="remaining" className="w-1/2">All Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          {loadingEnrolled ? (
            <p className="text-center text-gray-500">Loading enrolled courses...</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map(c => (
                  <Card key={c.id} className="shadow-lg hover:shadow-2xl transition">
                    <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 p-5 rounded-t-xl">
                      <CardTitle className="text-xl font-semibold">{c.title}</CardTitle>
                      <CardDescription>By {c.instructorName}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5">
                      <p className="text-green-600 mb-3">Progress: {c.progress}%</p>
                      <div className="flex items-center mb-3">
                        <Star className="mr-2" size={16} /> {c.rating?.toFixed(1) || '0.0'}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-5">
                      <Button variant="ghost" onClick={() => navigate(`/student/courses/${c.id}`)}>Continue</Button>
                      <Button onClick={() => openRate(c)}>Rate</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="remaining">
          {loadingRemaining ? (
            <p className="text-center text-gray-500">Loading courses...</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingCourses.map(c => (
                  <Card key={c.id} className="shadow-lg hover:shadow-2xl transition">
                    <CardHeader className="bg-gradient-to-r from-green-100 to-lime-100 p-5 rounded-t-xl">
                      <CardTitle className="text-xl font-semibold">{c.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 flex flex-col justify-between">
                      <p className="text-gray-600 mb-4 line-clamp-3">{c.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">By {c.instructorName}</span>
                        <Button onClick={() => openDetails(c)}>View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-xl bg-white p-6 rounded-2xl shadow-2xl">
          <DialogHeader><DialogTitle>{selectedCourse?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p>{selectedCourse?.description}</p>
            <div className="flex flex-wrap gap-2">{selectedCourse?.tags?.map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
            <p className="text-sm text-gray-500">Instructor: {selectedCourse?.instructorName}</p>
            <div className="flex items-center">{Array.from({length:5}).map((_,i)=><Star key={i} className={i < (selectedCourse?.rating||0)?'opacity-100':'opacity-30'} size={20}/> )}</div>
          </div>
          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedCourse && handleEnroll(selectedCourse.id)}>Enroll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Dialog */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader><DialogTitle>Rate {selectedCourse?.title}</DialogTitle></DialogHeader>
          <div className="mt-4"><Rating value={ratingValue} onChange={setRatingValue}/></div>
          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setRateDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitRating} disabled={ratingValue===0}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
