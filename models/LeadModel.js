import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "User",
    },
    projectName: { type: String, default: "", require: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "ClientMaster" },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContactMaster",
    },
    customId: { type: String, default: null },
    interaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interaction",
    },
    solution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Solution",
    },
    description: {
      type: String,
    },
    source: {
      type: String,
    },
    potentialTopLine: {
      type: Number,
    },
    potentialOffset: {
      type: Number,
    },
    potentialRevenue: {
      type: Number,
    },
    converted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const LeadModel = mongoose.model("Lead", leadSchema);

export default LeadModel;
