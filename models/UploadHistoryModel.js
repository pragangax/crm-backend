import mongoose from "mongoose";

const UploadHistorySchema = new mongoose.Schema(
  {
    resource: {
      type: String,
      enum: ["contact", "client", "tender", "opportunity", "businessDevelopment"],
      required: true,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    note : {
      type : String
    }
  },
  { timestamps: true }
);

const UploadHistoryModel = mongoose.model("UploadHistory", UploadHistorySchema);
export default UploadHistoryModel;
