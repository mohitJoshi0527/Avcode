// src/components/InstructorDashboard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  // ... more sample data
];

export default function InstructorDashboard() {
  return (
    <div className="p-6 space-y-6 font-body">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-heading bg-gradient-vertical bg-clip-text text-transparent">
          Instructor Dashboard
        </h1>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          Add Course
        </Button>
      </header>

      <ScrollArea className="h-[70vh] pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCourses.map((course) => (
            <Card key={course.id} className="border-0 shadow-lg hover:shadow-2xl transition">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold">Rating: {course.rating}</p>
                  <p className="text-sm text-gray-500">Comments: {course.comments}</p>
                </div>
                <Avatar>
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}`} alt={course.title} />
                  <AvatarFallback>{course.title.charAt(0)}</AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
