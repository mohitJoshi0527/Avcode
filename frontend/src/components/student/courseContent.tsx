import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CourseContent() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/student/getcourse/${courseId}`, { withCredentials: true });
      setCourse(res.data);
    } catch (err) {
      console.error('Error fetching course content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseContent();
  }, [courseId]);

  if (loading) return <p className="p-6 text-center">Loading course...</p>;
  if (!course) return <p className="p-6 text-red-500">Course not found or not enrolled.</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
        {course.title}
      </h2>
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-xl">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.content.videos.map((v: any) => (
              <Card key={v._id} className="shadow-lg hover:shadow-2xl transition">
                <CardHeader className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
                  <CardTitle className="text-lg font-semibold">{v.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-4">{v.description}</p>
                  <Button variant="outline" onClick={() => window.open(v.url, '_blank')}>
                    ▶️ Play Video
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.content.attachments.map((sec: any, idx: number) => (
              <Card key={idx} className="shadow-lg hover:shadow-2xl transition">
                <CardHeader className="p-4 bg-gradient-to-r from-green-50 to-lime-50 rounded-t-xl">
                  <CardTitle className="text-lg font-semibold">Section {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col space-y-2">
                  {sec.pdf.map((file: any, i: number) => (
                    <Button key={i} variant="ghost" onClick={() => window.open(file.url, '_blank')}>
                      📄 {file.s3Key.split('/').pop()}
                    </Button>
                  ))}
                  {sec.codeFiles.map((file: any, i: number) => (
                    <Button key={i} variant="ghost" onClick={() => window.open(file.url, '_blank')}>
                      💻 {file.s3Key.split('/').pop()}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}