import { Router } from "express";
import UploadController from "../../controllers/upload/testUploadController.js";
import upload from "../../utils/storage.utils.js";
import uploadStream from "../../utils/memoryStorage.utils.js";
import checkPermissions from "../../middlewares/checkPermission.js";
import { actionTypes } from "../../config/actionTypes.js";
import parseCsv from "../../middlewares/parseCsv.middleware.js";
import { validateBulkDataFormat } from "../../middlewares/validateBulkDataFormate.middleware.js";
import { contactFieldMap } from "../../controllers/upload/fieldMap.js";

const uploadRouter = Router();

const entity = "BULK UPLOAD";
uploadRouter.post(
  "/client",
  // checkPermissions(entity, actionTypes.ALLOW),
  uploadStream.single("dataFile"),
  UploadController.uploadClientInBulk
);
uploadRouter.post(
  "/contact",
  // checkPermissions(entity, actionTypes.ALLOW),
  uploadStream.single("dataFile"),
  parseCsv,
  validateBulkDataFormat(contactFieldMap),
  UploadController.uploadContactInBulk
);
uploadRouter.post(
  "/opportunity",
  // checkPermissions(entity, actionTypes.ALLOW),
  uploadStream.single("dataFile"),
  UploadController.uploadOpportunityInBulk
);
uploadRouter.post(
  "/tender",
  // checkPermissions(entity, actionTypes.ALLOW),
  uploadStream.single("dataFile"),
  UploadController.uploadTenderInBulk
);
uploadRouter.post(
  "/bd",
  // checkPermissions(entity, actionTypes.ALLOW),
  uploadStream.single("dataFile"),
  UploadController.uploadBDInBulk
);

export default uploadRouter;
