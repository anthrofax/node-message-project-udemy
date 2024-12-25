const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require('jsonwebtoken')

const User = require("../models/user");

module.exports = {
  createUser: async ({ userInput }) => {
    // Mendapatkan data dari args
    const { email, name, password } = userInput;
    const errors = [];

    if (!validator.isEmail(email)) {
      errors.push({
        message: "Email yang anda inputkan tidak valid.",
      });
    }

    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({
        message: "Kata sandi harus terdiri dari minimal 5 karakter.",
      });
    }

    if (errors.length > 0) {
      const err = new Error(errors[0].message);
      err.data = errors;
      err.code = 422;

      throw err;
    }

    // Memeriksa apakah pengguna dengan email yang sama sudah ada
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User exists already!");
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Membuat pengguna baru
    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    // Menyimpan pengguna ke database
    const createdUser = await user.save();

    // Mengembalikan data pengguna
    return {
      ...createdUser._doc,
      _id: createdUser._id.toString(),
    };
  },
  login: async ({ email, password }) => {
    // Cari pengguna berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found!");
      error.code = 401;
      throw error;
    }

    // Periksa password
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Password is incorrect!");
      error.code = 401;
      throw error;
    }

    // Buat token JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      "supersecretkey", // Ganti dengan secret key Anda
      { expiresIn: "1h" }
    );

    return { token, userId: user._id.toString() };
  },
};
