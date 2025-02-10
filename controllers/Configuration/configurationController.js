import IndustryMasterModel from "../../models/Configuration/IndustryModel.js";
import SolutionModel from "../../models/Configuration/SolutionModel.js";
import SubIndustryModel from "../../models/Configuration/SubIndustryModel.js";
import SubSolutionModel from "../../models/Configuration/SubSolutionModel.js";
import TerritoryModel from "../../models/Configuration/TerritoryModel.js";
import { catchAsyncError } from "../../middlewares/catchAsyncError.middleware.js";
import SalesStageModel from "../../models/StageModels/SalesStageModel.js";
import SalesSubStageModel from "../../models/StageModels/SalesSubStage.js";
import ClassificationModel from "../../models/ConfigModels/ClientMaster/ClassificationModel.js";
import IncorporationTypeModel from "../../models/ConfigModels/ClientMaster/IncorporationTypeModel.js";
import RelationshipStatusModel from "../../models/ConfigModels/ClientMaster/RelationshipStatusModel.js";
import ArchetypeModel from "../../models/ConfigModels/ContactMaster/ArchetypeModel.js";
import RelationshipDegreeModel from "../../models/ConfigModels/ContactMaster/RelationshipDegreeModel.js";
class ConfigurationController {
    static getCount = catchAsyncError(async (req, res, next) => {
      // Run all countDocuments() queries in parallel using Promise.all
      const [
        industryCount,
        territoryCount,
        subIndustryCount,
        solutionCount,
        subSolutionCount,
        salesStageCount,
        salesSubStageCount,
        classificationCount,
        incorporationTypeCount,
        relationshipStatusCount,
        archetypeCount,
        relationshipDegreeCount,
      ] = await Promise.all([
        IndustryMasterModel.countDocuments({}),
        TerritoryModel.countDocuments({}),
        SubIndustryModel.countDocuments({}),
        SolutionModel.countDocuments({}),
        SubSolutionModel.countDocuments({}),
        SalesStageModel.countDocuments({}),
        SalesSubStageModel.countDocuments({}),
        ClassificationModel.countDocuments({}),
        IncorporationTypeModel.countDocuments({}),
        RelationshipStatusModel.countDocuments({}),
        ArchetypeModel.countDocuments({}),
        RelationshipDegreeModel.countDocuments({}),
      ]);
  
      res.status(200).json({
        status: "success",
        message: "Config Counts fetched successfully",
        data: {
          industry: industryCount,
          "sub-industry": subIndustryCount,
          solution: solutionCount,
          territory: territoryCount,
          "sub-solution": subSolutionCount,
          "sales-stage": salesStageCount,
          "sales-sub-stage": salesSubStageCount,
          classification: classificationCount,
          "incorporation-type": incorporationTypeCount,
          "relationship-status": relationshipStatusCount,
          "arche-type": archetypeCount,
          "relationship-degree": relationshipDegreeCount,
        },
      });
    });
  }
  
export default ConfigurationController