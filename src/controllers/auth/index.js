import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";
import query from "../../database";

async function register(req, res) {
  // receive data from body
  const { email, username, password } = req.body;
  const isAdmin = req.body?.is_admin ? true : false;
  const hashedPassword = hashPassword(password);
  // insert data from body and hashed password into db
  await query(
    "INSERT INTO users (email, username, password, is_admin) VALUES ($1, $2, $3, $4)",
    [email, username, hashedPassword, isAdmin]
  )
    .then(function (resDb) {
      res.status(200).json({ message: "A user created" });
    })
    .catch(function (errDb) {
      res.status(500).json({ message: "Server error", error: errDb });
    });
}

async function login(req, res) {
  const { identifier, password } = req.body;
  const data = await query(
    "SELECT * FROM users WHERE username=$1 OR email=$1",
    [identifier]
  );
  const [user] = data.rows;
  if (!user) {
    res
      .status(400)
      .json({ message: "Login unsuccessfull", error: "Invalid credential" });
    return;
  }

  const generateAccessToken = (userData) => {
    return jwt.sign(userData, config.jwtSecretToken);
  };

  // compare hashed password
  bcrypt.compare(password, user.password, (error, bcryptRes) => {
    if (bcryptRes) {
      const token = generateAccessToken({
        id: user.id,
      });
      const serverRes = {
        message: "Login successfull",
        data: user,
        jwt: token,
      };
      res.status(200).json(serverRes);
    } else {
      const serverRes = {
        message: "Login unsuccessfull",
        error: "Invalid credential",
        data: error,
      };
      res.status(401).json(serverRes);
    }
  });
}

export function hashPassword(passwordBody) {
  // hashed password data from body
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(passwordBody, salt);
  return hashedPassword;
}

const authController = { register, login };
export default authController;
