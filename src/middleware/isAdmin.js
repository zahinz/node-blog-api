import query from "../database";

async function isAdmin(req, res, next) {
  const data = await query("SELECT is_admin FROM users WHERE id = $1", [
    req.user.id,
  ]);
  const user = data.rows[0];
  if (user.is_admin) {
    next();
  } else {
    res.status(403).json({ message: "Invalid admin request" });
  }
}

export default isAdmin;
