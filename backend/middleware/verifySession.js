const verifySession = async (req, res) => {
  const token = req.cookies.sessionToken;
  if (!token) {
    return res
      .status(200)
      .json({ success: true, message: "Session available" });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "User already logged in" });
  }
};

module.exports = { verifySession };
