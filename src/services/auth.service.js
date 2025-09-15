import bcrypt from "bcrypt";
import authDao from "../database/dao/auth.js";


export const handleLogin = (credentials, callback) => {
  // Kijk db of email bestaat of niet
  // Kijk of w8w overeenkomt
  // Need to have express-session package
  // Met de session houden we ingelogde gebruiker en rol bij.
};

export const handleRegister = async (credentials, callback) => {
  try {
    // Check e-mail availability
    authDao.checkEmailAvailability(credentials.email, (err, isAvailable) => {
      if (err) {
        return callback(err);
      }
      console.log(isAvailable);
      if (isAvailable && isAvailable.length > 0) {
        return callback({ status: 400, message: "E-mail already in use" });
      }

      // Password validation
      const password = credentials.password;
      if (!password || password.length < 8) {
        return callback({ status: 400, message: "Password must be at least 8 characters long" });
      }
      if (!/[A-Z]/.test(password)) {
        return callback({ status: 400, message: "Password must contain at least one uppercase letter" });
      }
      if (!/[a-z]/.test(password)) {
        return callback({ status: 400, message: "Password must contain at least one lowercase letter" });
      }
      if (!/[0-9]/.test(password)) {
        return callback({ status: 400, message: "Password must contain at least one digit" });
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        return callback({ status: 400, message: "Password must contain at least one special character" });
      }

      // Hash the password
      // const hashedPassword = await bcrypt.hash(credentials.password, 10);

      // Save user to database (pseudo code)
      // db.saveUser({ ...credentials, password: hashedPassword });
      callback(null, { success: true });
    });
  } catch (error) {
    callback(error);
  }
};
