import mongoose from "mongoose";
import ClientMasterModel from "./ClientMasterModel.js";

const ContactMasterSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default: null,
  },
  gender: {
    type: String,
    enum: ["M", "F", "O"],
    required: true,
  },
  entryDate: {
    type: Date,
    required: true,
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClientMaster",
  },
  jobTitle: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  phoneCountryCode: {
    type: String,
  },
  mobilePhone: {
    type: String,
    required: true,
  },
  mobileCountryCode: {
    type: String,
  },
  workEmail: {
    type: String,
  },
  personalEmail: {
    type: String,
  },
  archeType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Archetype",
  },
  relationshipDegree: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RelationshipDegree",
  },
  territory: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Territory",
  },
  country: {
    type: String,
  },
  memorableDetail: {
    type: String,
  },
  notes: [
    {
      type: String,
    },
  ],
}, { timestamps: true });


// Middleware to update ClientMaster's relatedContacts when a contact is created
ContactMasterSchema.post("save", async function (doc) {
  try {
    if (doc.client) {
      await ClientMasterModel.findByIdAndUpdate(
        doc.client,
        { $addToSet: { relatedContacts: doc._id } }, // Add contact ID to relatedContacts array
        { new: true }
      );
    }
  } catch (err) {
    console.error("Error updating ClientMaster relatedContacts:", err);
  }
});

// Middleware to update multiple clients when insertMany is used
ContactMasterSchema.post("insertMany", async function (docs) {
  try {
    const clientUpdates = {};
    
    docs.forEach((doc) => {
      if (doc.client) {
        if (!clientUpdates[doc.client]) {
          clientUpdates[doc.client] = [];
        }
        clientUpdates[doc.client].push(doc._id);
      }
    });

    for (const [clientId, contactIds] of Object.entries(clientUpdates)) {
      await ClientMasterModel.findByIdAndUpdate(
        clientId,
        { $addToSet: { relatedContacts: { $each: contactIds } } },
        { new: true }
      );
    }
  } catch (err) {
    console.error("Error updating ClientMaster relatedContacts in insertMany:", err);
  }
});

const ContactMasterModel = mongoose.model("ContactMaster", ContactMasterSchema);
export default ContactMasterModel;
