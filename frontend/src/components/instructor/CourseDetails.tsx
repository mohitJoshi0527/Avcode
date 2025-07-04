// src/components/CourseDetail.tsx
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

      {/* Video List */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Videos</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {course.content.videos.map((v: any) => (
            <div
              key={v._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h4 className="font-medium text-lg">{v.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{v.description}</p>
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
            </div>
          ))}
        </div>
      </section>

      {/* Attachment List */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Attachments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {course.content.attachments.map((att: any, index: number) => (
            <div key={index} className="space-y-2">
              {att.pdf.map((file: any, i: number) => (
                <button
                  key={`pdf-${i}`}
                  onClick={() => openSignedAttachment(file.s3Key)}
                  className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 transition w-full text-left"
                >
                  <span className="text-lg">📄</span>
                  <span className="font-medium">
                    {file.s3Key.split("/").pop()}
                  </span>
                </button>
              ))}
              {att.codeFiles.map((file: any, i: number) => (
                <button
                  key={`code-${i}`}
                  onClick={() => openSignedAttachment(file.s3Key)}
                  className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 transition w-full text-left"
                >
                  <span className="text-lg">💻</span>
                  <span className="font-medium">
                    {file.s3Key.split("/").pop()}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Video Player Dialog */}
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

      {/* Add Video Dialog */}
      {showAddVideo && (
        <AddVideoDialog
          courseId={courseId!}
          onClose={() => {
            setShowAddVideo(false);
            fetchCourse();
          }}
        />
      )}

      {/* Add Attachment Dialog */}
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
