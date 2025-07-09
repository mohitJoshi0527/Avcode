import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddVideoDialog from "./AddVideoDialog";
import AddAttachmentDialog from "./AddAttachmentDialog";

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddAttachment, setShowAddAttachment] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/instructor/courses/${courseId}`, {
        withCredentials: true,
      });
      setCourse(res.data);
    } catch (err) {
      console.error("Error fetching course:", err);
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
      console.error("Could not fetch video URL", err);
    }
  };

  const openSignedAttachment = async (s3Key: string) => {
    try {
      const res = await axios.get<{ url: string }>(
        `/api/course/${courseId}/attachments/${encodeURIComponent(s3Key)}/url`,
        { withCredentials: true }
      );
      window.open(res.data.url, "_blank");
    } catch (err) {
      console.error("Error opening attachment:", err);
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
              <Card key={v._id} className="hover:shadow-lg transition">
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
                  <div className="flex space-x-2">
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
                  </div>
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
              onContextMenu={(e) => e.preventDefault()}
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
