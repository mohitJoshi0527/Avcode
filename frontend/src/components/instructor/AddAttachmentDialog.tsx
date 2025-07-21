
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddAttachmentDialogProps {
  courseId: string;
  onClose: () => void;
}

export default function AddAttachmentDialog({ courseId, onClose }: AddAttachmentDialogProps) {
  const [type, setType] = useState<'pdf' | 'code'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('fileType', type);
    formData.append('file', file);

    try {
      await axios.post(
        `/api/course/${courseId}/attachments`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-600">
            Upload Attachment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="attachment-type">Attachment Type</Label>
            <Select value={type} onValueChange={(val) => setType(val as 'pdf' | 'code')}>
              <SelectTrigger id="attachment-type" className="w-full mt-2">
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="code">Code File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="attachment-file">Select File</Label>
            <input
              id="attachment-file"
              type="file"
              accept={type === 'pdf' ? '.pdf' : '.zip,.js,.py,.java'}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full"
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
