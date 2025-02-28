export const clientFieldMap = {
    "Client Name": "name",
    "Client Code": "clientCode",
    "Entry Date": "entryDate",
    "Entered by": "enteredBy",
    Industry: "industry",
    "Sub Industry": "subIndustry",
    "What do they do": "Offering",
    Territory: "territory",
    "Pursued Opportunity Value": "pursuedOpportunityValue",
    "Incorporation Type": "incorporationType",
    "Listed Company": "listedCompany",
    "Market Cap": "marketCap",
    "Annual Revenue": "annualRevenue",
    Classification: "classification",
    "Employee Strength": "totalEmployeeStrength",
    "IT Employee Strength": "itEmployeeStrength",
    "Primary Relationship Holder": "primaryRelationship",
    "Secondary Relationship Holder": "secondaryRelationship",
    "Relationship Status": "relationshipStatus",
    // "Details are upto date": "detailsConfirmation",
    // "Related Contacts": "relatedContacts",
    "Lifetime Value": "lifeTimeValue",
    Priority: "priority",
    // Action: "Action",
    requiredFields : ["Client Name", "Industry", "Sub Industry", "Territory", "Incorporation Type"]

  };
  export const contactFieldMap = {
    Gender: "gender",
    "Entry Date": "entryDate",
    "Entered By": "enteredBy",
    "First Name": "firstName",
    "Last Name": "lastName",
    "Client Name": "client",
    "Job Title": "jobTitle",
    Phone: "phone",
    "Work Email": "workEmail",
    "Mobile Phone": "mobilePhone",
    "Personal Email": "personalEmail",
    Archetype: "archeType",
    "Relationship Degree": "relationshipDegree",
    "Location": "city",
    "Memorable Aspect": "memorableDetail",
    "Notes": "notes",
    "Territory" : "territory",
    requiredFields : ["First Name", "Last Name", "Gender", "Phone", "Relationship Degree", "Territory"]
  };

  export const opportunityFieldMap = {
    "Opportunity #": "customId",
    "Entry Date": "entryDate",
    "Entered by": "enteredBy",
    "CLIENT NAME": "client",
    "PARTNERED WITH": "partneredWith",
    "PROJECT NAME": "projectName",
    "ASSOCIATED TENDER": "associatedTender",
    SOLUTION: "solution",
    SUBSOLUTION: "subSolution",
    "SALES CHAMP": "salesChamp",
    "SALES STAGE": "salesStage",
    "SALES SUBSTAGE": "salesSubStage",
    "STAGE CLARIFICATION": "stageClarification",
    "SALES TOPLINE": "salesTopLine",
    OFFSETS: "offsets",
    "CONFIDENCE LEVELS": "confidenceLevel",
    // Add other mappings if needed
  };

  export const tenderFieldMap = {
    "RFP Rcvd Date": "rfpDate",
    "Tender #": "customId",
    "Entry Date": "entryDate",
    "Entered by": "enteredBy",
    "Submission Due Date": "submissionDueDate",
    Time: "submissionDueTime", // Assuming this is a time field
    "Client Name": "client",
    "Tender Ref.": "reference",
    "Title of the RFP": "rfpTitle",
    "How did we recieve the RFP": "rfpSource",
    "ASSOCIATED OPPORTUNITY": "associatedOpportunity",
    "Tender Bond (Y/N)": "bond",
    "Tender Bond Value": "bondValue",
    "Tender Bond Issue Date": "bondIssueDate",
    "Tender Bond Valid until": "bondExpiry",
    "Submission Mode": "submissionMode",
    "Tender Evaluation Date": "evaluationDate",
    "Tender Officer": "officer",
    "Bid Manager": "bidManager",
    "Tender Stage": "stage",
    "Explanation of Stage": "stageExplanation",
    "Submission Date": "submissionDate",
  };

  export const bdFieldMap = {
    "Entry Date": "entryDate",
    "Entered by": "enteredBy",
    "CLIENT NAME": "client",
    "CONTACT NAME": "contact",
    "HOW DID WE CONNECT WITH CLIENT" : "connectionSource",
    "POTENTIAL PROJECT" : "potentialProject",
    "SOLUTION" : "solution",
    "INDUSTRY:" : "industry",
    "TERRITORY" : "territory",
    "SUBSOLUTION:" : "solution",
    "SALES CHAMP" : "salesChamp",
    "POTENTIAL TOPLINE" : "potentialTopLine",
    "POTENTIAL OFFSETS" : "potentialOffset",
    "POTENTIAL REVENUE" : "potentialRevenue",
    "COMMENTS:" : "comment",
  }

  export const fieldMapping = {
    client: clientFieldMap,
    contact: contactFieldMap,
    opportunity: opportunityFieldMap,
    tender: tenderFieldMap,
    businessDevelopment: bdFieldMap,
  };

  export const getFieldMapping = (resource) => {
    const csvToModelFieldMap = fieldMapping[resource];
    if (!csvToModelFieldMap) {
      throw new ClientError("Formate Error", `Invalid resource type: ${resource}`);
    }
    return csvToModelFieldMap;
  }

const validationRules = {
  email: [
    (value) => (value === "" ? null : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email format" : null)) // Ignore empty, validate others
  ],
  phone: [
    (value) => (value === "" ? null : (!/^\d+$/.test(value) ? "Phone must contain only numbers" : null)), // Ignore empty, validate others
    (value) => (value === "" ? null : (value.length < 7 || value.length > 15 ? "Phone number must be between 7 and 15 digits" : null)) // Ignore empty, validate others
  ],
  numericString: [
    (value) => (value === "" ? null : (!/^\d+$/.test(value) ? "Must be a numeric string" : null))  // Ignore empty, ensure only numbers
  ],
  alphabeticString: [
    (value) => (value === "" ? null : (!/^[a-zA-Z]+$/.test(value) ? "Must contain only alphabetic characters" : null))  // Ignore empty, ensure only letters
  ],
  gender: [
    (value) => (value === "" ? null : (!/^(M|F|O)$/.test(value) ? 'Gender must be "M", "F", or "O"' : null)) // Ignore empty, validate gender
  ]
};

  
  
  // Used at the time of generating analysis result of bulk data
  export const validationRulesMap = {
    //contact
    gender : validationRules.gender,
    phone :  validationRules.phone,
    workEmail : validationRules.email,
    personalEmail : validationRules.email,
    mobilePhone :validationRules.phone,
    lifeTimeValue : validationRules.numericString,
    // totalEmployeeStrength : validationRules.numericString,
    // itEmployeeStrength : validationRules.numericString,


  }