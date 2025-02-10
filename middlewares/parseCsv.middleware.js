import { Readable } from "stream";
import { catchAsyncError } from "./catchAsyncError.middleware.js";
import csv from "csvtojson";
import { ClientError } from "../utils/customErrorHandler.utils.js";

const parseCsv = catchAsyncError(async (req, res, next) => {
    if (!req.file) throw new ClientError("Upload", "No file uploaded");
    // Validate file type
    const allowedMimeTypes = ["text/csv", "application/vnd.ms-excel"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        throw new ClientError("Upload", "Invalid file type. Only CSV files are allowed.");
    }

    let { check } = req.query;
    req.check = check === "true";

    const stream = Readable.from(req.file.buffer.toString());
    const bulkData = await csv().fromStream(stream);

    req.bulkData = bulkData;
    next();
});

   
export default parseCsv 