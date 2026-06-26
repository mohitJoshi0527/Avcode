import User from '../models/User.model.js';
import Course from '../models/course.model.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl }   from '@aws-sdk/s3-request-presigner';
import { s3 }        from '../config/aws.js';

export const enrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate({
        path: 'enrolledCourses',
        populate: { path: 'createdBy', select: 'name' }
      });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const courses = user.enrolledCourses;
    if (!courses.length) {
      return res.status(404).json({ message: 'No enrolled courses found for this user' });
    }
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const allCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('enrolledCourses');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const enrolledCourseIds = user.enrolledCourses.map(c => c._id);
    const remainingCourses = await Course.find({
      _id: { $nin: enrolledCourseIds }
    }).populate('createdBy');

    if (!remainingCourses.length) {
      return res.status(404).json({ message: 'No remaining courses found for this user' });
    }
    res.status(200).json(remainingCourses);
  } catch (error) {
    console.error("Error fetching remaining courses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export async function pushenrollCourse(req, res) {
  try {
    const studentId = req.user._id;  // assumed set by auth middleware
    const { courseId } = req.params;

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    user.enrolledCourses.push(courseId);
    await user.save();

    return res.json({ message: 'Enrollment successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
export async function getCourseContent(req, res) {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;
    const user = await User.findById(studentId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({ message: 'Not enrolled' });
    }
    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    async function generateSignedUrl(key) {
      const cmd = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key:  key,
      });
      return getSignedUrl(s3, cmd, { expiresIn: 300 });
    }
    const videos = await Promise.all(
      course.content.videos.map(async v => ({
        _id: v._id,
        title: v.title,
        description: v.description,
        url: await generateSignedUrl(v.s3Key),
      }))
    );
    const attachments = await Promise.all(
      course.content.attachments.map(async sec => {
        const pdfs = await Promise.all(
          sec.pdf.map(async f => ({
            ...f,
            url: await generateSignedUrl(f.s3Key),
          }))
        );
        const codeFiles = await Promise.all(
          sec.codeFiles.map(async f => ({
            ...f,
            url: await generateSignedUrl(f.s3Key),
          }))
        );
        return { pdf: pdfs, codeFiles };
      })
    );

    return res.json({
      title: course.title,
      content: { videos, attachments },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
export async function rateCourse(req, res) {
  try {
    const { courseId } = req.params;
    const { rating } = req.body; // 1-5
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.content.ratingCount = course.content.ratingCount || 0;
    course.content.ratingSum = course.content.ratingSum || 0;

    course.content.ratingCount += 1;
    course.content.ratingSum += rating;
    course.content.rating = course.content.ratingSum / course.content.ratingCount;

    await course.save();
    res.json({ rating: course.content.rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
