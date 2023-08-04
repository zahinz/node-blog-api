import query from "../../database";
import { hashPassword } from "../auth";

async function getAllUsers(req, res) {
  const data = await query("SELECT * from users");
  const users = data.rows;

  res.status(200).json({ message: `${users.length} users are found`, users });
}
async function getSingleUser(req, res) {
  const username = req.params.username;
  const data = await query("SELECT * from users WHERE username=$1", [username]);
  const user = data.rows;
  if (user.length === 0) {
    res.status(400).json({ message: "User not found" });
  } else {
    res.status(200).json({ message: "A user not found", user });
  }
}

async function update(req, res) {
  const user = req.user;
  const body = req.body;

  const columns = [];
  const values = [];
  let paramIndex = 1;

  // Construct the SET clause for the SQL query
  Object.entries(body).forEach(([key, value]) => {
    columns.push(`${key} = $${paramIndex}`);
    if (key === "password") {
      values.push(hashPassword(value));
    } else {
      values.push(value);
    }
    paramIndex++;
  });

  columns.push("updated_at = CURRENT_TIMESTAMP");

  const queryStr = `UPDATE users SET ${columns.join(
    ", "
  )} WHERE id = $${paramIndex}`;
  values.push(user.id);
  const data = query(queryStr, values);
  res.status(200).json({ message: "hello world", data });
}

const userController = { getAllUsers, getSingleUser, update };
export default userController;
