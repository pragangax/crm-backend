import { ServerError } from "../../utils/customErrorHandler.utils.js";
import { catchAsyncError } from "../../middlewares/catchAsyncError.middleware.js";
import SolutionModel from "../../models/Configuration/SolutionModel.js";

class SolutionController {
    // Create SolutionMaster
    static createSolution = catchAsyncError(async (req, res, next) => {
        const { label, description } = req.body;
        const newSolutionMaster = await SolutionModel.create({ label, description });
        res.status(201).json({
            status: 'success',
            message: 'Solution Master created successfully',
            data: newSolutionMaster,
        });
    });

    // Get all SolutionMasters
    static getAllSolution = catchAsyncError(async (req, res, next) => {
        const solutionMasters = await SolutionModel.find({
            $or: [{ isDeleted: null }, { isDeleted: false }],
          });
        res.status(200).json({
            status: 'success',
            message: 'All Solution Masters retrieved successfully',
            data: solutionMasters,
        });
    });

    // Get SolutionMaster by ID
    static getSolutionById = catchAsyncError(async (req, res, next) => {
        const { id } = req.params;
        const solutionMaster = await SolutionModel.findById(id);
        if (!solutionMaster) throw new ServerError("NotFound", "Solution Master");
        res.status(200).json({
            status: 'success',
            message: 'Solution Master retrieved successfully',
            data: solutionMaster,
        });
    });

    // Update SolutionMaster
    static updateSolution = catchAsyncError(async (req, res, next) => {
        const { id } = req.params;
        const { label, description } = req.body;
        
        const solutionMaster = await SolutionModel.findById(id);
    
        if (!solutionMaster) throw new ServerError("NotFound", "Solution Master");
    
        solutionMaster.label = label;
        solutionMaster.description = description;
        const updatedSolutionMaster = await solutionMaster.save();
    
        res.status(200).json({
            status: 'success',
            message: 'Solution Master updated successfully',
            data: updatedSolutionMaster,
        });
    });

    // Delete SolutionMaster
    static deleteSolution = catchAsyncError(async (req, res, next) => {
        const { id } = req.params;
        let { undo } = req.query;
        undo = undo == "true";
        const deleteStatus = !undo; 

    
        const solutionMaster = await SolutionModel.findByIdAndDelete(id, {isDeleted: deleteStatus} , {new : true});
    
        res.status(200).json({
            status: 'success',
            message: 'Solution Master deleted successfully',
            data: {solution: solutionMaster},
        });
    });
}

export default SolutionController;
