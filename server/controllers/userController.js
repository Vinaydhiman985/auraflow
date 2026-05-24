import User from '../models/User.js';

// 1. GET LOGGED IN USER PROFILE
export const getProfile = async (req, res, next) => {
  try {
    // req.user is attached by auth verification middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. UPDATE PROFILE
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User account not found.');
    }

    const { name, email, avatar } = req.body;

    // Check if email is already taken by another user
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        res.status(400);
        throw new Error('Email is already in use by another account.');
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
