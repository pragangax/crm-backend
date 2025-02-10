import ClientMasterModel from "../models/ClientMasterModel.js";
import OpportunityMasterModel from "../models/OpportunityMasterModel.js";
import TenderMasterModel from "../models/TenderMasterModel.js";
import ContactMasterModel from "../models/ContactMasterModel.js";
import uploadAndGetAvatarUrl from "./uploadAndGetAvatarUrl.utils.js";
import ExcelJS from "exceljs";
import { Readable } from "stream";
import { parse } from "json2csv";
import {
  clientFieldMap,
  contactFieldMap,
  opportunityFieldMap,
  tenderFieldMap,
  bdFieldMap,
  fieldMapping,
  getFieldMapping,
  validationRulesMap,
} from "../controllers/upload/fieldMap.js";
import ClassificationModel from "../models/ConfigModels/ClientMaster/ClassificationModel.js";
import IncorporationTypeModel from "../models/ConfigModels/ClientMaster/IncorporationTypeModel.js";
import RelationshipDegreeModel from "../models/ConfigModels/ContactMaster/RelationshipDegreeModel.js";
import RelationshipStatusModel from "../models/ConfigModels/ClientMaster/RelationshipStatusModel.js";
import IndustryMasterModel from "../models/Configuration/IndustryModel.js";
import SubIndustryModel from "../models/Configuration/SubIndustryModel.js";
import TerritoryModel from "../models/Configuration/TerritoryModel.js";
import StaffModel from "../models/StaffModel.js";
import UserModel from "../models/UserModel.js";
import ArchetypeModel from "../models/ConfigModels/ContactMaster/ArchetypeModel.js";
import SolutionMasterModel from "../models/Configuration/SolutionModel.js";
import SalesStageModel from "../models/StageModels/SalesStageModel.js";
import SalesSubStageModel from "../models/StageModels/SalesSubStage.js";
import TenderStageModel from "../models/ConfigModels/TenderMaster/TenderStageModel.js";
import BusinessDevelopmentModel from "../models/BusinessDevelopmentModel.js";
import { ClientError, ServerError } from "./customErrorHandler.utils.js";

const createMap = async (Model) => {
  const data = await Model.find({});
  return data.reduce((acc, item) => {
    acc[item.label] = item._id;
    return acc;
  }, {});
};

export const getAllFieldMap = async () => {
  const [
    classificationMap,
    incorporationTypeMap,
    relationshipStatusMap,
    industryMap,
    subIndustryMap,
    territoryMap,
    archTypeMap,
    solutionMap,
    salesStageMap,
    salesSubStageMap,
    relationshipDegreeMap,
    tenderStageMap,
  ] = await Promise.all([
    createMap(ClassificationModel),
    createMap(IncorporationTypeModel),
    createMap(RelationshipStatusModel),
    createMap(IndustryMasterModel),
    createMap(SubIndustryModel),
    createMap(TerritoryModel),
    createMap(ArchetypeModel),
    createMap(SolutionMasterModel),
    createMap(SalesStageModel),
    createMap(SalesSubStageModel),
    createMap(RelationshipDegreeModel),
    createMap(TenderStageModel),
  ]);
  const userMap = await UserModel.find({})
    .select("firstName lastName")
    .then((users) => {
      return users.reduce((acc, item) => {
        acc[item.firstName + " " + item.lastName] = item._id;
        return acc;
      }, {});
    });

  const contactMap = await ContactMasterModel.find({})
    .select("firstName lastName")
    .then((contacts) => {
      return contacts.reduce((acc, item) => {
        acc[item.firstName + " " + item.lastName] = item._id;
        return acc;
      }, {});
    });

  const clientMap = await ClientMasterModel.find({})
    .select("name")
    .then((clients) => {
      return clients.reduce((acc, item) => {
        acc[item.name] = item._id;
        return acc;
      }, {});
    });

  return {
    classificationMap,
    incorporationTypeMap,
    relationshipStatusMap,
    industryMap,
    subIndustryMap,
    territoryMap,
    archTypeMap,
    solutionMap,
    salesStageMap,
    salesSubStageMap,
    relationshipDegreeMap,
    tenderStageMap,
    userMap,
    contactMap,
    clientMap,
  };
};

// export const generateAnalysisResult = ({
//   formattedData,
//   bulkData,
//   resource,
// }) => {
//   let analysisResult = {};
//   const csvToModelFieldMap = getFieldMapping(resource);
//   bulkData.forEach((row, rowIdx) => {
//     Object.keys(row).forEach((csvField, colIdx) => {
//       const modelField = csvToModelFieldMap[csvField];
//       if (
//         modelField !== undefined &&
//         formattedData[rowIdx][modelField] === undefined
//       ) {
//         if (!analysisResult[rowIdx]) {
//           analysisResult[rowIdx] = [];
//         }
//         analysisResult[rowIdx].push({
//           [colIdx]: { field: csvField, value: row[csvField] },
//         });
//       }
//     });
//   });
//   return analysisResult;
// };

// Formats the raw json data extracted from csv into db form


// Analysis Report with Validation
export const generateAnalysisReport = ({ formattedData, bulkData, resource }) => {
  let analysisResult = {};
  const csvToModelFieldMap = getFieldMapping(resource);

  bulkData.forEach((row, rowIdx) => {
    Object.keys(row).forEach((csvField, colIdx) => {
      const modelField = csvToModelFieldMap[csvField];

      // If the field is not mapped correctly
      if (modelField !== undefined && formattedData[rowIdx][modelField] === undefined) {
        if (!analysisResult[rowIdx]) {
          analysisResult[rowIdx] = [];
        }
        analysisResult[rowIdx].push({
          [colIdx]: { field: csvField, value: row[csvField], error: "Missing or unmapped field" }
        });
      }

      // Apply validations if defined for the field
      if (modelField && validationRulesMap[modelField]) {
        validationRulesMap[modelField].forEach((validateFunc) => {
          const errorMessage = validateFunc(row[csvField]);  // Run validation
          if (errorMessage) {
            if (!analysisResult[rowIdx]) {
              analysisResult[rowIdx] = [];
            }
            analysisResult[rowIdx].push({
              [colIdx]: { field: csvField, value: row[csvField], error: errorMessage }
            });
          }
        });
      }
    });
  });

  return analysisResult;
};



export const getFormattedData = async ({ bulkData, resource }) => {
  const {
    classificationMap,
    incorporationTypeMap,
    relationshipStatusMap,
    industryMap,
    subIndustryMap,
    territoryMap,
    archTypeMap,
    solutionMap,
    salesStageMap,
    salesSubStageMap,
    relationshipDegreeMap,
    tenderStageMap,
    userMap,
    contactMap,
    clientMap,
  } = await getAllFieldMap();

  // Extracting field csvToModelFieldMap acc to resource
  const csvToModelFieldMap = getFieldMapping(resource);

  const formattedData = bulkData.map((row) => {
    let formattedRow = {};
    Object.keys(row).forEach((csvField) => {
      const modelField = csvToModelFieldMap[csvField];
      if (modelField) {
        switch (modelField) {
          case "classification":
            formattedRow[modelField] = classificationMap[row[csvField]];
            break;
          case "enteredBy":
            formattedRow[modelField] = userMap[row[csvField]];
            break;
          case "incorporationType":
            formattedRow[modelField] = incorporationTypeMap[row[csvField]];
            break;
          case "relationshipStatus":
            formattedRow[modelField] = relationshipStatusMap[row[csvField]];
            break;
          case "listedCompany":
            formattedRow[modelField] = row[csvField] === "Listed";
            break;
          case "entryDate":
            const parsedDate = new Date(row[csvField]);
            formattedRow[modelField] = isNaN(parsedDate.getTime())
              ? null
              : parsedDate;
            break;
          case "relatedContacts":
            formattedRow[modelField] = null;
            break;
          case "industry":
            formattedRow[modelField] = industryMap[row[csvField]];
            break;
          case "subIndustry":
            formattedRow[modelField] = subIndustryMap[row[csvField]];
            break;
          case "territory":
            formattedRow[modelField] = territoryMap[row[csvField]];
            break;
          case "primaryRelationship":
            formattedRow[modelField] = userMap[row[csvField]];
            break;
          case "secondaryRelationship":
            formattedRow[modelField] = userMap[row[csvField]];
            break;
          case "archeType":
            formattedRow[modelField] = archTypeMap[row[csvField]];
            break;
          case "relationshipDegree":
            formattedRow[modelField] = relationshipDegreeMap[row[csvField]];
            break;
          case "client":
            if (resource == "businessDevelopment" || resource == "contact") {
              formattedRow[modelField] = clientMap[row[csvField]];
            } else {
              formattedRow[modelField] = null;
            }
            break;
          case "associatedTender":
            formattedRow[modelField] = null;
          case "customId":
            formattedRow[modelField] = null;
            break;
          case "solution":
            formattedRow[modelField] = solutionMap[row[csvField]];
            break;
          case "subSolution":
            formattedRow[modelField] = solutionMap[row[csvField]];
            break;
          case "salesStage":
            formattedRow[modelField] = salesStageMap[row[csvField]];
            break;
          case "salesSubStage":
            formattedRow[modelField] = salesSubStageMap[row[csvField]];
            break;
          case "salesChamp":
            formattedRow[modelField] = userMap[row[csvField]];
            break;
          case "officer":
            formattedRow[modelField] = userMap[row[csvField]];
            break;
          case "bidManager":
            formattedRow[modelField] = userMap[row[csvField]];
            break;
          case "contact":
            formattedRow[modelField] = contactMap[row[csvField]];
            break;
          case "stage":
            formattedRow[modelField] = tenderStageMap[row[csvField]];
            break;
          case "associatedOpportunity":
            formattedRow[modelField] = null;
            break;
          case "bond":
            formattedRow[modelField] = bulkData[csvField] == "Y" ? true : false;
            break;
          default:
            formattedRow[modelField] = row[csvField];
        }
      }
    });
    return formattedRow;
  });

  return formattedData;
};

export const addMissingFields = (user, formattedData) => {
  // used to ade
  if (!user || !formattedData)
    throw new ServerError(
      "bulk-upload",
      "user or data not found for addMissingFields while bulk upload"
    );
  formattedData.forEach((doc) => {
    if (!doc?.enteredBy) doc.enteredBy = user._id;
    if (!doc?.entryDate) doc.entryDate = new Date(Date.now());
  });
};

export const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

// without description of err
// export const getCorrectionFile = async (
//   bulkData,
//   resource,
//   analysisResult,
//   formattedData
// ) => {
//   let csvToModelFieldMap = null;
//   switch (resource) {
//     case "client":
//       csvToModelFieldMap = clientFieldMapping;
//       break;
//     case "contact":
//       csvToModelFieldMap = contactFieldMap;
//       break;
//     case "opportunity":
//       csvToModelFieldMap = opportunityFieldMap;
//       break;
//     case "tender":
//       csvToModelFieldMap = tenderFieldMap;
//       break;
//     case "businessDevelopment":
//       csvToModelFieldMap = bdFieldMap;
//       break;
//   }

//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Sheet1");

//   // Write headers
//   const headers = Object.keys(csvToModelFieldMap).map((field) => field);
//   worksheet.addRow(headers);
//   formattedData.forEach((row, rowIdx) => {
//     worksheet.addRow(
//       headers.map(
//         (header) => row[csvToModelFieldMap[header]] || bulkData[rowIdx][header]
//       )
//     );
//   });

//   // Apply highlights based on the analysisResult
//   Object.keys(analysisResult).forEach((rowIdx) => {
//     const cells = analysisResult[rowIdx];
//     cells.forEach((cell) => {
//       Object.keys(cell).forEach((colIdx) => {
//         const cellAddress = worksheet.getCell(
//           parseInt(rowIdx) + 2,
//           parseInt(colIdx) + 1
//         );
//         cellAddress.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "FFFFC0C0" }, // Light red background
//         };
//       });
//     });
//   });

//   // Write the workbook to a file
//   const uniqueName = Array.from({ length: 4 }, () =>
//     String.fromCharCode(65 + Math.floor(Math.random() * 26))
//   ).join("");
//   const buffer = await workbook.xlsx.writeBuffer();
//   const file = {
//     buffer: buffer,
//     originalname: `${resource}-${uniqueName}.xlsx`,
//   };
//   const correctionFileUrl = await uploadAndGetAvatarUrl(
//     file,
//     `CRM/${resource}/correctionFiles`,
//     file.originalname,
//     "stream"
//   );

//   return correctionFileUrl;
// };

export const getCorrectionFile = async (
  bulkData,
  resource,
  analysisResult,
  formattedData
) => {
  let csvToModelFieldMap = null;
  switch (resource) {
    case "client":
      csvToModelFieldMap = clientFieldMapping;
      break;
    case "contact":
      csvToModelFieldMap = contactFieldMap;
      break;
    case "opportunity":
      csvToModelFieldMap = opportunityFieldMap;
      break;
    case "tender":
      csvToModelFieldMap = tenderFieldMap;
      break;
    case "businessDevelopment":
      csvToModelFieldMap = bdFieldMap;
      break;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // Write headers
  const headers = Object.keys(csvToModelFieldMap).map((field) => field);
  worksheet.addRow(headers);

  formattedData.forEach((row, rowIdx) => {
    worksheet.addRow(
      headers.map(
        (header) => row[csvToModelFieldMap[header]] || bulkData[rowIdx][header]
      )
    );
  });

  // Apply highlights and comments based on analysisResult
  Object.keys(analysisResult).forEach((rowIdx) => {
    const cells = analysisResult[rowIdx];

    cells.forEach((cell) => {
      Object.keys(cell).forEach((colIdx) => {
        const errorDetails = cell[colIdx]; // Contains { field, value, error }
        const cellAddress = worksheet.getCell(
          parseInt(rowIdx) + 2, // Row index (Excel is 1-based)
          parseInt(colIdx) + 1  // Column index (Excel is 1-based)
        );

        // Highlight cell
        cellAddress.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFC0C0" }, // Light red background
        };

        // Add error description as a comment (if available)
        if (errorDetails.error) {
          cellAddress.note = {
            texts: [{ text: `Error: ${errorDetails.error}` }],
            margins: { inset: [0.1, 0.1, 0.1, 0.1] }, // Adjusts padding
          };
        }
      });
    });
  });

  // Write the workbook to a file
  const uniqueName = Array.from({ length: 4 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const buffer = await workbook.xlsx.writeBuffer();
  const file = {
    buffer: buffer,
    originalname: `${resource}-${uniqueName}.xlsx`,
  };
  const correctionFileUrl = await uploadAndGetAvatarUrl(
    file,
    `CRM/${resource}/correctionFiles`,
    file.originalname,
    "stream"
  );

  return correctionFileUrl;
};


const getEntityModel = (resourceType) => {
  const models = {
    client: ClientMasterModel,
    tender: TenderMasterModel,
    opportunity: OpportunityMasterModel,
    businessDevelopment: BusinessDevelopmentModel,
    contact: ContactMasterModel,
  };
  const resourceModel = models[resourceType] || null;
  if (!resourceModel)
    throw new ServerError(
      "resource",
      "Invalid resource type in getEntityModel"
    );
  return resourceModel;
};

export const sendBulkUploadResponse = async ({
  res,
  check,
  bulkData,
  formattedData,
  analysisReport,
  resourceType,
}) => {
  const EntityModel = getEntityModel(resourceType);

  if (!check && Object.keys(analysisReport).length === 0) {
    const entities = await EntityModel.insertMany(formattedData);
    const uniqueName = new Date().toLocaleString();
    const ids = entities.map((client) => client._id.toString());
    const csv = parse(ids.map((id) => ({ id })));
    const csvStream = new Readable();
    csvStream.push(csv);
    csvStream.push(null);
    const buffer = await streamToBuffer(csvStream);
    const file = {
      buffer: buffer,
      originalname: `${resourceType}-${uniqueName}.csv`,
    };
    // Ensure the directory exists (create if it doesn't)
    const fileUrl = await uploadAndGetAvatarUrl(
      file,
      `CRM/BulkUploads/Backup/${resourceType}`,
      uniqueName,
      "stream"
    );
    res.send({
      status: "success",
      type: "backup",
      message: `${resourceType} bulk import successful`,
      data: { url: fileUrl },
    });
  } else {
    console.log("jumped in else");
    const correctionFileUrl = await getCorrectionFile(
      bulkData,
      `${resourceType}`,
      analysisReport,
      formattedData
    );
    res.json({
      status: "success",
      type: "correction",
      message: `There are corrections in this ${resourceType} file!`,
      data: { url: correctionFileUrl },
    });
  }
};

export const parseRevenueData = (bulkData) => {
  let yearQuarterPositions = [];
  const firstRow = bulkData[0]; // First row contains the headers

  // Identify the positions of years and quarters in the first row
  Object.entries(firstRow).forEach(([key, value], index) => {
    let match = key.match(/REVENUE IN (\d{4})/);
    if (match) {
      let year = parseInt(match[1], 10);
      yearQuarterPositions.push({
        year: year,
        Q1: index, // Assume the next few fields are Q1, Q2, Q3, Q4
        Q2: index + 1,
        Q3: index + 2,
        Q4: index + 3,
      });
    }
  });

  // Parse the revenue data for each row
  return bulkData.slice(1).map((row) => {
    let revenueData = [];

    yearQuarterPositions.forEach(({ year, Q1, Q2, Q3, Q4 }) => {
      let revenueEntry = {
        year: year,
        Q1: parseFloat(row[Object.keys(firstRow)[Q1]]) || 0,
        Q2: parseFloat(row[Object.keys(firstRow)[Q2]]) || 0,
        Q3: parseFloat(row[Object.keys(firstRow)[Q3]]) || 0,
        Q4: parseFloat(row[Object.keys(firstRow)[Q4]]) || 0,
      };
      revenueData.push(revenueEntry);
    });

    return revenueData;
  });
};
