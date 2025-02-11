import { catchAsyncError } from "../../middlewares/catchAsyncError.middleware.js";
import BusinessDevelopmentModel from "../../models/BusinessDevelopmentModel.js";
import ClientMasterModel from "../../models/ClientMasterModel.js";
import ContactMasterModel from "../../models/ContactMasterModel.js";
import OpportunityMasterModel from "../../models/OpportunityMasterModel.js";
import TenderMasterModel from "../../models/TenderMasterModel.js";
import UploadHistoryModel from "../../models/UploadHistoryModel.js";
import { ServerError } from "../../utils/customErrorHandler.utils.js";

// Helper function to get model by resource type
const getEntityModel = (resourceType) => {
  const modelMap = {
    client: ClientMasterModel,
    contact: ContactMasterModel,
    tender: TenderMasterModel,
    opportunity: OpportunityMasterModel,
    businessDevelopment: BusinessDevelopmentModel,
  };
  return modelMap[resourceType] || null;
};

export const getUploadHistoryById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Step 1: Fetch Upload History
  const uploadHistory = await UploadHistoryModel.findById(id);
  if (!uploadHistory) throw new ServerError("upload", "Upload History not found!");

  const { resource, documents } = uploadHistory;

  // Step 2: Get the corresponding Model
  const EntityModel = getEntityModel(resource);
  if (!EntityModel) throw new ServerError("upload", "Invalid resource type in upload history!");

  // Step 3: Fetch all related documents
  const relatedDocuments = await EntityModel.find({ _id: { $in: documents } });

  return res.json({
    status: "success",
    message: `Upload history details retrieved successfully`,
    data : {documents : relatedDocuments, uploadHistory}
  });
});


// Create Upload History
export const createUploadHistory = async (resourceType, documentIds) => {
  try {
    const history = new UploadHistoryModel({
      resource: resourceType,
      documents: documentIds,
    });
    await history.save();
    return history;
  } catch (error) {
    console.error("Error creating upload history:", error);
    throw error;
  }
};

// Get All Upload Histories
export const getAllUploadHistories = async (req, res) => {
  try {
    const histories = await UploadHistoryModel.find().sort({ createdAt: -1 });
    return res.send({
      status: "success",
      message: "Upload history fetched successfully",
      data: histories,
    });
  } catch (error) {
    console.error("Error fetching upload histories:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

// Delete Upload History
export const deleteUploadHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await UploadHistoryModel.findByIdAndDelete(id);
    if (!history) {
      return res
        .status(404)
        .json({ status: "error", message: "History not found" });
    }
    res.json({
      status: "success",
      message: "Upload history deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting upload history:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

export const undoBulkUpload = catchAsyncError(
  async (req, res, next, session) => {
    const { id } = req.params;

    // Step 1: Fetch Upload History
    const uploadHistory = await UploadHistoryModel.findById(
      id
    ).session(session);
    
    if(!uploadHistory) throw new ServerError("upload", "Upload History not found!");
    
    const { resource, documents } = uploadHistory;
    
    // Step 2: Get Model
    const EntityModel = getEntityModel(resource);
    if(!EntityModel) throw new ServerError("upload", "Invalid resource in upload history!");

    // Step 3: Delete Documents
    const deletedRecords = await EntityModel.deleteMany({
      _id: { $in: documents },
    }).session(session);

    // Step 4: Remove Upload History
    const deletedUploadHistory = await UploadHistoryModel.findByIdAndDelete(id).session(
      session
    );

    return res.json({
      status: "success",
      message: `${resource} bulk upload undone successfully`,
      data: {uploadHistory : deletedUploadHistory, records : deletedRecords},
    });
  },
  true
);
