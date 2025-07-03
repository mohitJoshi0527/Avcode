import { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddVideoDialog({ courseId, onClose }: { courseId: string; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !title) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video', file);

    try {
      await axios.post(
        `/api/course/${courseId}/videos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true }
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-600">Upload New Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="video-title">Title</Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
            />
          </div>
          <div>
            <Label htmlFor="video-desc">Description</Label>
            <Input
              id="video-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div>
            <Label htmlFor="video-file">Select Video</Label>
            <input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}