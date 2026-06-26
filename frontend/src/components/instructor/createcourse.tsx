import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

interface AddCourseFormProps {
  onClose: () => void;
}

export default function AddCourseForm({ onClose }: AddCourseFormProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { title, description, tags } = form;
    if (!title || !description || !tags) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/course/createcourse', {
        title,
        description,
        tags: tags.split(',').map((tag) => tag.trim()),
      });

      toast.success('Course created successfully!');
      setForm({ title: '', description: '', tags: '' });
      onClose(); // ✅ close the modal
    } catch (error) {
      toast.error('Error creating course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. React Basics"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Brief description of the course"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="e.g. JavaScript, Frontend, React"
          className="mt-1"
        />
      </div>
      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
        >
          {loading ? 'Creating...' : 'Create Course'}
        </Button>
      </div>
    </div>
  );
}
