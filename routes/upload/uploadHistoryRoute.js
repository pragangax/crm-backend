import { Router } from "express";
import { getUploadHistoryById, undoBulkUpload } from "../../controllers/Upload History/uploadHistoryController.js";
import { getAllUploadHistories } from "../../controllers/Upload History/uploadHistoryController.js";
const uploadHistoryRouter = Router();

uploadHistoryRouter.get('/',getAllUploadHistories);
uploadHistoryRouter.post('/undo/:id',undoBulkUpload);
uploadHistoryRouter.get('/:id',getUploadHistoryById);

export default uploadHistoryRouter;