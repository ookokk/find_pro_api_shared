const { Schema, model } = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));
const { createTokenForUser } = require("../services/authentication");


const userSchema = new Schema(
  {
    userId: {
      type: Number,
      unique: true,
    },
    isMaster: {
      type: Boolean,
      default: false,
    },
    fullName: {
      type: String,
     
    },
    email: {
      type: String,
      unique: true,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    jobCategory: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
    hideSearch: {
      type: Boolean,
    },
    createdAt: {
      type: String,
    },
    googleToken: {
      type: String,
    },
    appleToken: {
      type: String,
    },
    ratings: {
      type: [Number],
    },
    password: {
      type: String,

    },
    profilePicture: {
      type: String,
      default: "profile.png",
    },
    coverPicture: {
      type: String,
      default: "cover.png",
    },
    salt: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.plugin(AutoIncrement, { inc_field: "userId" });


userSchema.pre("save", function (next) {
  next();
});


userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not found!");

  if (user.password !== password) throw new Error("Incorrect Password");

  return user;
});

userSchema.static(
  "loginWithGoogleToken",
  async function (googleToken) {
    const user = await this.findOne({ googleToken });
    if (!user) throw new Error("User not found or invalid Google token");

    const token = createTokenForUser(user);
    return { token, user };
  }
);

userSchema.static(
  "loginWithEmail",
  async function (email) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found or invalid email");

    const token = createTokenForUser(user);
    return { token, user };
  }
);


userSchema.static(
  "loginWithAppleToken",
  async function (appleToken) {
    const user = await this.findOne({ appleToken });
    if (!user) throw new Error("User not found or invalid Apple token");

    const token = createTokenForUser(user);
    return { token, user };
  }
);


const User = model("User", userSchema);

module.exports = User;
