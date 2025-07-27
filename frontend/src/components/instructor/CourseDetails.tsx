import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import AddVideoDialog from './AddVideoDialog';
import AddAttachmentDialog from './AddAttachmentDialog';

export default function InstructorCourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddAttachment, setShowAddAttachment] = useState(false);

  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/instructor/courses/${courseId}`, {
        withCredentials: true,
      });
      setCourse(res.data);
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndPlay = async (videoId: string) => {
    try {
      const res = await axios.get<{ url: string }>(
        `/api/course/${courseId}/videos/${videoId}/url`,
        { withCredentials: true }
      );
      setPlayUrl(res.data.url);
    } catch (err) {
      console.error('Could not fetch video URL', err);
    }
  };

  const openSignedAttachment = async (s3Key: string) => {
    try {
      const res = await axios.get<{ url: string }>(
        `/api/course/${courseId}/attachments/${encodeURIComponent(s3Key)}/url`,
        { withCredentials: true }
      );
      window.open(res.data.url, '_blank');
    } catch (err) {
      console.error('Error opening attachment:', err);
    }
  };

  const fetchComments = async (videoId: string) => {
    try {
      const res = await axios.get(
        `/api/comment/course/${courseId}/video/${videoId}/comments`,
        { withCredentials: true }
      );
      setCommentsMap(m => ({ ...m, [videoId]: res.data }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const toggleComments = (videoId: string) => {
    setShowComments(s => {
      const next = !s[videoId];
      if (next && !commentsMap[videoId]) fetchComments(videoId);
      return { ...s, [videoId]: next };
    });
  };

  const postReply = async (videoId: string, commentId: string) => {
    const content = replyContent[commentId]?.trim();
    if (!content) return;
    try {
      await axios.post(
        `/api/comment/${commentId}/reply`,
        { content },
        { withCredentials: true }
      );
      setReplyContent(r => ({ ...r, [commentId]: '' }));
      fetchComments(videoId);
    } catch (err) {
      console.error('Error posting reply:', err);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!course) return <p className="p-6 text-red-500">Course not found</p>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          {course.title}
        </h2>
        <div className="space-x-2">
          <Button onClick={() => setShowAddVideo(true)}>+ Add Video</Button>
          <Button variant="outline" onClick={() => setShowAddAttachment(true)}>
            + Add Attachment
          </Button>
        </div>
      </header>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.content.videos.map((v: any) => (
              <Card key={v._id} className="shadow-lg hover:shadow-2xl transition">
                <CardHeader className="p-0">
                  {v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-t-lg">
                      <span className="text-gray-500">No Thumbnail</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{v.title}</CardTitle>
                  <p className="text-sm text-gray-600 mb-4">{v.description}</p>
                  <div className="flex space-x-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAndPlay(v._id)}
                    >
                      ▶️ Play
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        await axios.delete(
                          `/api/course/${courseId}/videos/${v._id}`,
                          { withCredentials: true }
                        );
                        fetchCourse();
                      }}
                    >
                      Delete
                    </Button>
                    <Button variant="ghost" onClick={() => toggleComments(v._id)}>
                      💬 Comments
                    </Button>
                  </div>

                  {showComments[v._id] && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <h4 className="text-lg font-medium text-gray-800">Comments</h4>
                      {(commentsMap[v._id] || []).map(c => (
                        <div key={c._id} className="p-3 bg-white rounded-md shadow-sm">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-700">{c.author.name}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
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
                          <textarea
                            rows={1}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-2"
                            placeholder="Reply to comment..."
                            value={replyContent[c._id] || ''}
                            onChange={e => setReplyContent(p => ({ ...p, [c._id]: e.target.value }))}
                          />
                          <Button
                            size="sm"
                            className="mt-1"
                            onClick={() => postReply(v._id, c._id)}
                          >
                            Reply
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.content.attachments.map((att: any, idx: number) => (
              <Card key={idx} className="p-4 hover:shadow-lg transition">
                <CardTitle className="text-md font-medium mb-2">Section {idx + 1}</CardTitle>
                <div className="space-y-2">
                  {att.pdf.map((file: any, i: number) => (
                    <Button
                      key={`pdf-${i}`}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => openSignedAttachment(file.s3Key)}
                    >
                      📄 {file.s3Key.split("/").pop()}
                    </Button>
                  ))}
                  {att.codeFiles.map((file: any, i: number) => (
                    <Button
                      key={`code-${i}`}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => openSignedAttachment(file.s3Key)}
                    >
                      💻 {file.s3Key.split("/").pop()}
                    </Button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!playUrl} onOpenChange={() => setPlayUrl(null)}>
        <DialogContent className="w-screen h-screen p-0 bg-black">
          {playUrl && (
            <video
              src={playUrl}
              controls
              controlsList="nodownload"
              disableRemotePlayback
              autoPlay
              className="w-full h-full object-contain"
              onContextMenu={e => e.preventDefault()}
            />
          )}
        </DialogContent>
      </Dialog>

      {showAddVideo && (
        <AddVideoDialog
          courseId={courseId!}
          onClose={() => {
            setShowAddVideo(false);
            fetchCourse();
          }}
        />
      )}

      {showAddAttachment && (
        <AddAttachmentDialog
          courseId={courseId!}
          onClose={() => {
            setShowAddAttachment(false);
            fetchCourse();
          }}
        />
      )}
    </div>
  );
}
