import Course from '../models/course.model.js';
export const createCourse = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const createdBy = req.user.name; 
    const newCourse = new Course({
      title,
      description,
      tags,
      createdBy,
      content: {
        videos: [],
        attachments: [],
      },
    });

    await newCourse.save();
    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const uploadCourseVideo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    if (!req.file || !req.file.location) {
      return res.status(400).json({ message: 'Video upload failed' });
    }

    const videoData = {
      title,
      description,
      videoUrl: req.file.location, // S3 video URL
    };

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.content.videos.push(videoData);
    await course.save();

    res.status(200).json({ message: 'Video uploaded successfully', video: videoData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
