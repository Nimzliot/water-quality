const getCurrentUser = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: "Authenticated Supabase user",
      user: {
        id: req.user.id,
        email: req.user.email,
      },
      appUser: {
        id: req.user.id,
        email: req.user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCurrentUser,
};
