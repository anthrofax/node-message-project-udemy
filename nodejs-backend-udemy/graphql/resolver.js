const bcrypt = require("bcryptjs");

const User = require("../models/user");

module.exports = {
  createUser: async ({ userInput }) => {
    // Mendapatkan data dari args
    const { email, name, password } = userInput;

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
};
