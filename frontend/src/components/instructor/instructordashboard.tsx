import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AddCourseForm from './createcourse';// adjust path if needed

interface Course {
  id: string;
  title: string;
  description: string;
  rating: number;
  comments: number;
}

const sampleCourses: Course[] = [
  { id: '1', title: 'React Basics', description: 'Learn the fundamentals of React.', rating: 4.5, comments: 12 },
  { id: '2', title: 'Advanced Node.js', description: 'Deep dive into Node.js internals.', rating: 4.8, comments: 8 },
  { id: '3', title: 'TypeScript Mastery', description: 'Become a pro at TypeScript.', rating: 4.7, comments: 10 },
  { id: '4', title: 'GraphQL APIs', description: 'Build and scale GraphQL APIs.', rating: 4.6, comments: 6 },
];

export default function InstructorDashboard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6 space-y-6 font-body bg-gradient-to-br from-[#f0f4ff] via-[#e0e7ff] to-[#f3f4f6] min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Instructor Dashboard
        </h1>
        <Button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition shadow-md"
        >
          + Add Course
        </Button>
      </header>

      {/* Popup Dialog for Creating Course */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Create New Course
            </DialogTitle>
          </DialogHeader>
          <AddCourseForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <ScrollArea className="h-[70vh] pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCourses.map((course) => (
            <Card
              key={course.id}
              className="shadow-xl transition-all duration-300 hover:shadow-2xl bg-white border border-gray-200"
            >
              <CardHeader className="bg-gradient-to-r from-[#fdfbfb] to-[#ebedee] rounded-t-xl p-5">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-base font-medium text-indigo-600">⭐ {course.rating.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">💬 {course.comments} comments</p>
                </div>
                <Avatar>
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&background=random`}
                    alt={course.title}
                  />
                  <AvatarFallback className="bg-indigo-500 text-white">
                    {course.title.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
