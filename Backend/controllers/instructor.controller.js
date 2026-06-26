import User from '../models/User.model.js'; 
import Course from '../models/course.model.js';
export const getCourse = async (req, res) => {
  try {
    const userId = req.user._id; 
    const user = await User.findById(userId).populate('createdCourses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const courses = user.createdCourses || [];
    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate('createdBy', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}