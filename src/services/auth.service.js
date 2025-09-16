import bcrypt from "bcrypt";
import authDao from "../database/dao/auth.js";

export const handleLogin = (credentials, callback) => {
  try {
    // Check if email exists
    authDao.checkEmailAvailability(credentials.email, (err, user) => {
      if (err) {
        return callback({
          status: 500,
          message: "An internal server error occurred",
        });
      }

      if (!user || user.length === 0) {
        return callback({
          status: 401,
          message: "Incorrect e-mail or password",
        });
      }

      const dbUser = user[0]; // { email, password_hash }

      bcrypt.compare(
        credentials.password,
        dbUser.password_hash,
        (compareErr, isMatch) => {
          if (compareErr) {
            return callback(compareErr);
          }

          if (!isMatch) {
            return callback({
              status: 401,
              message: "Incorrect e-mail or password",
            });
          }

          authDao.getUserIdAndRoleFromEmail(
            credentials.email,
            (err, userInfo) => {
              if (err) {
                return callback({
                  status: 500,
                  message: "An internal server error occurred",
                });
              }
              // You can include userInfo in the response if needed
              return callback(null, {
                status: 200,
                message: "Login successful",
                user: userInfo,
              });
            }
          );
        }
      );
    });
  } catch (error) {
    callback(error);
  }
};

export const handleRegister = async (credentials, callback) => {
  try {
    // Check e-mail availability
    authDao.checkEmailAvailability(credentials.email, (err, isAvailable) => {
      if (err) {
        return callback(err);
      }
      // console.log(isAvailable);
      if (isAvailable && isAvailable.length > 0) {
        return callback({ status: 400, message: "E-mail already in use" });
      }

      // Password validation
      const password = credentials.password;
      if (!password || password.length < 8) {
        return callback({
          status: 400,
          message: "Password must be at least 8 characters long",
        });
      }
      if (!/[A-Z]/.test(password)) {
        return callback({
          status: 400,
          message: "Password must contain at least one uppercase letter",
        });
      }
      if (!/[a-z]/.test(password)) {
        return callback({
          status: 400,
          message: "Password must contain at least one lowercase letter",
        });
      }
      if (!/[0-9]/.test(password)) {
        return callback({
          status: 400,
          message: "Password must contain at least one digit",
        });
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        return callback({
          status: 400,
          message: "Password must contain at least one special character",
        });
      }

      // Hash the password and save user
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          return callback(hashErr);
        }
        const hashedCredentials = {
          email: credentials.email,
          password: hashedPassword,
        };
        // Insert new user into database
        authDao.insertNewUserIntoDatabase(
          hashedCredentials,
          (insertErr, result) => {
            if (insertErr) {
              return callback(insertErr);
            }
            callback(null, {
              status: 201,
              message: "User registered successfully",
              user: result,
            });
          }
        );
      });
    });
  } catch (error) {
    callback(error);
  }
};
