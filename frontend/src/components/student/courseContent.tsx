// FRONTEND: CourseContent.tsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CourseContent() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // comments state
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  // fetch course and content
  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/student/getcourse/${courseId}`, { withCredentials: true });
      setCourse(res.data);
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  // fetch comments for a video
  const fetchComments = async (videoId: string) => {
    try {
      const res = await axios.get(
        `/api/comment/course/${courseId}/video/${videoId}/comments`,
        { withCredentials: true }
      );
      setCommentsMap(prev => ({ ...prev, [videoId]: res.data }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // toggle comment panel
  const toggleComments = (videoId: string) => {
    setShowComments(prev => {
      const open = !prev[videoId];
      if (open && !commentsMap[videoId]) fetchComments(videoId);
      return { ...prev, [videoId]: open };
    });
  };

  // post new comment
  const postComment = async (videoId: string) => {
    const text = (newComment[videoId] || '').trim();
    if (!text) return;
    try {
      await axios.post(
        `/api/comment/course/${courseId}/video/${videoId}/comment`,
        { content: text },
        { withCredentials: true }
      );
      setNewComment(prev => ({ ...prev, [videoId]: '' }));
      fetchComments(videoId);
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  if (loading) return <p className="p-6 text-center">Loading course…</p>;
  if (!course) return <p className="p-6 text-center text-red-500">Course not found or not enrolled.</p>;

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

        {/* Videos */}
        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.content.videos.map((v: any) => (
              <Card key={v._id} className="shadow-lg hover:shadow-2xl transition">
                <CardHeader className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
                  <CardTitle className="text-lg font-semibold">{v.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-4">{v.description}</p>
                  <div className="flex space-x-2 mb-4">
                    <Button variant="outline" onClick={() => window.open(v.url, '_blank')}>▶️ Play</Button>
                    <Button variant="ghost" onClick={() => toggleComments(v._id)}>💬 Comments</Button>
                  </div>

                  {showComments[v._id] && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <h4 className="text-lg font-medium text-gray-800">Comments</h4>
                      {(commentsMap[v._id] || []).map(c => (
                        <div key={c._id} className="p-3 bg-white rounded-md shadow-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-gray-700">{c.author.name}</span>
                            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-800 mb-2">{c.content}</p>
                          {c.replies?.map((r: any, i: number) => (
                            <div key={i} className="ml-4 mt-2 p-2 bg-indigo-50 rounded">
                              <div className="flex justify-between text-sm text-gray-700">
                                <span>Reply by {r.author.name}</span>
                                <span>{new Date(r.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <p className="mt-1 text-gray-700">{r.content}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                      <textarea
                        rows={2}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Write a comment…"
                        value={newComment[v._id] || ''}
                        onChange={e => setNewComment(prev => ({ ...prev, [v._id]: e.target.value }))}
                      />
                      <Button onClick={() => postComment(v._id)}>Submit</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Attachments unchanged */}
        <TabsContent value="attachments" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.content.attachments.map((sec: any, idx: number) => (
              <Card key={idx} className="shadow-lg hover:shadow-2xl transition">
                <CardHeader className="p-4 bg-gradient-to-r from-green-50 to-lime-50 rounded-t-xl">
                  <CardTitle className="text-lg font-semibold">Section {idx+1}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col space-y-2">
                  {sec.pdf.map((f:any,i:number)=>(
                    <Button key={i} variant="ghost" onClick={()=>window.open(f.url,'_blank')}>📄 {f.s3Key.split('/').pop()}</Button>
                  ))}
                  {sec.codeFiles.map((f:any,i:number)=>(
                    <Button key={i} variant="ghost" onClick={()=>window.open(f.url,'_blank')}>💻 {f.s3Key.split('/').pop()}</Button>
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
