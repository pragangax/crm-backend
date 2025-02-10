import { ClientError } from "../utils/customErrorHandler.utils.js";

export const validateBulkDataFormat = (fieldMap) => (req, res, next) => {
  if (!req.bulkData || req.bulkData.length === 0) {
    throw new ClientError("InvalidInput", "No data provided for validation.");
  }

  const allowedHeaders = Object.keys(fieldMap);
  const uploadedHeaders = Object.keys(req.bulkData[0]); // Validate the first object only

  // Find extra headers not in fieldMap
  const invalidHeaders = uploadedHeaders.filter(header => !allowedHeaders.includes(header));

  // Find missing headers that are required but not provided
  const missingHeaders = allowedHeaders.filter(header => !uploadedHeaders.includes(header));

  if (missingHeaders.length > 0) {
    return res.status(400).json({
      status: "error",
      type: "format-error",
      message: "Invalid header format",
      data: { allowedHeaders, uploadedHeaders, invalidHeaders, missingHeaders },
    });
  }

  next(); // Proceed to next middleware if validation passes
};
