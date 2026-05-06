const supabase = require("../config/supabase");

const ensureAppUser = async (user) => {
  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email,
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    throw error;
  }
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Supabase token",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    await ensureAppUser(req.user);

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

module.exports = authMiddleware;
