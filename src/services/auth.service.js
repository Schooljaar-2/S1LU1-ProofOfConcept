import bcrypt from "bcrypt";
import authDao from "../database/dao/auth.js";

// use credentials.email to chekc if email exists in user table. Then hash password with bcrypt to check if hash = hash from database. 
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

          authDao.getUserIdAndRoleAndUsernameFromEmail(
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

// Post credentials from register form into database. Password gets hashed wth bcrypt before sending to database
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
          username: credentials.username,
        };
        // Insert new user into database
        authDao.insertNewCustomerIntoDatabase(
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

// Check if user session role is equal to role param
export const checkAuthorisation = (request, role) => {
  if (!request.session.logged_in) {
    return false;
  }
  if (request.session.role !== role || !request.session.role) {
    return false;
  }
  return true;
}