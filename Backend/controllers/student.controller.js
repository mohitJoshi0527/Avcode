import User from '../models/User.model.js';
import Course from '../models/course.model.js';
// enrolledCourses controller
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


// allCourses controller
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
