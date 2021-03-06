const mongoose = require("mongoose");
const ContactSchema = require("./contact");

const UserSchema = new mongoose.Schema({
  google_id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  verified_email: {
    type: Boolean,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  given_name: {
    type: String,
    required: true,
  },
  family_name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: true,
  },
  locale: {
    type: String,
    required: true,
  },
  contacts: {
    type: [ContactSchema],
  },
  chats: {
    type: [],
  },
});

const User = mongoose.model("User", UserSchema);

async function saveUser(userDetails) {
  try {
    const user = new User(userDetails);

    await user.save();

    return true;
  } catch (error) {
    console.log(error.message);

    return false;
  }
}

async function checkUserInDatabase(email) {
  try {
    const user = await User.findOne({ email });

    if (user) return user;

    return null;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

async function getUser(userDetails) {
  try {
    const user = User.findOne(userDetails);
    return user;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

module.exports = { saveUser, checkUserInDatabase, getUser };
