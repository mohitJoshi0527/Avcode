import Course from '../models/course.model.js';
import User from '../models/user.model.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl }   from '@aws-sdk/s3-request-presigner';
import { s3 }        from '../config/aws.js';
export const createCourse = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    if (!title || !description || !tags) {
      return res.status(400).json({ message: 'Title, description, and tags are required' });
    }
    console.log(req.user);
    const createdBy = req.user._id; 
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
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
    user.createdCourses.push(newCourse._id);
    await user.save();
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

    if (!req.file || !req.file.key) {
      return res.status(400).json({ message: 'Video upload failed' });
    }

    // Build your video subdocument
    const videoData = {
      title,
      description,
      s3Key: req.file.key,     // <-- save the key, not the public URL
    };

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.content.videos.push(videoData);
    await course.save();

    res
      .status(200)
      .json({ message: 'Video uploaded successfully', video: videoData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCourseVideo = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Authorization check
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this video' });
    }

    // Find the video index
    const videoIndex = course.content.videos.findIndex(
      (video) => video._id.toString() === videoId
    );
    if (videoIndex === -1) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Remove the video and save
    course.content.videos.splice(videoIndex, 1);
    await course.save();

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// controllers/video.js

// controllers/video.js


export const getVideoUrl = async (req, res) => {
  try {
    // …find course + auth…
       const { courseId, videoId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // make sure only the creator (or whoever you allow) can get the URL
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const video = course.content.videos.id(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    const cmd = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key:    video.s3Key,
    });

    // this returns a Promise<string>
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });

    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
