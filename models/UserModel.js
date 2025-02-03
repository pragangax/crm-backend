import mongoose from "mongoose";
import bcrypt from "bcrypt";
const AddressSchema = new mongoose.Schema({
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
});
const UserSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      default: "",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phoneCountryCode: {
      type: String,
      // required: true, // make true in production
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    DOB: {
      type: Date,
    },
    gender: {
      type: String,
      required: true,
      enum: ["M", "F", "O"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: AddressSchema,
    },
    otp: {
      type: Number,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    // for assign territory industry and solution to a sales champ
    territory: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Territory" }],
      default: [null], // Default indicates access to all territories.
    },
    industry: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Industry" }],
      default: [null], // Default indicates access to all industries.
    },
    solution: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Solution" }],
      default: [null], // Default indicates access to all solutions.
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        default: [],
      },
    ],
    isDeleted : {
      type : Boolean,
      default : false
    }
  },
  {
    timestamps: true,
  }
);

// Middleware to hash password before saving
// UserSchema.pre("save", async function(next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// Method to compare password
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
