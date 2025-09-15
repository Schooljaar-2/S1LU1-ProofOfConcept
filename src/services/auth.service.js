import bcrypt from "bcrypt";

export const handleLogin = (credentials, callback) => {
  // Kijk db of email bestaat of niet
  // Kijk of w8w overeenkomt
  // Need to have express-session package
  // Met de session houden we ingelogde gebruiker en rol bij.
};

export const handleRegister = async (credentials, callback) => {
  try {
    // Hash the password
    // Save user to database (pseudo code)
    // db.saveUser({ ...credentials, password: hashedPassword });
    callback(null, { success: true });
  } catch (error) {
    callback(error);
  }
};
