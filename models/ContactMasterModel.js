import mongoose from "mongoose";
import ClientMasterModel from "./ClientMasterModel.js";

const ContactMasterSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["M", "F", "O"],
    },
    entryDate: {
      type: Date,
      default : new Date(Date.now())
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
    },
    phone: {
      type: String,
    },
    phoneCountryCode: {
      type: String,
    },
    mobilePhone: {
      type: String,
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
  },
  { timestamps: true }
);

// ➤ Hook to update ClientMaster when a contact is created
ContactMasterSchema.post("save", async function (doc) {
  try {
    if (doc.client) {
      await ClientMasterModel.findByIdAndUpdate(
        doc.client,
        { $addToSet: { relatedContacts: doc._id } },
        { new: true }
      );
    }
  } catch (err) {
    console.error("Error updating ClientMaster relatedContacts:", err);
  }
});

// ➤ Hook to update ClientMaster when multiple contacts are inserted
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

// ➤ Hook to update ClientMaster when a single contact is deleted (WITH TRANSACTION)
ContactMasterSchema.pre("findOneAndDelete", async function (next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doc = await this.model.findOne(this.getFilter()).session(session);
    if (doc && doc.client) {
      await ClientMasterModel.findByIdAndUpdate(
        doc.client,
        { $pull: { relatedContacts: doc._id } },
        { new: true, session }
      );
    }

    await session.commitTransaction(); // ✅ Commit if successful
    session.endSession();
    next();
  } catch (err) {
    await session.abortTransaction(); // ❌ Rollback if error occurs
    session.endSession();
    console.error("Error removing contact from ClientMaster relatedContacts:", err);
    next(err);
  }
});

// ➤ Hook to update ClientMaster when multiple contacts are deleted (WITH TRANSACTION)
ContactMasterSchema.pre("deleteMany", async function (next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const docs = await this.model.find(this.getFilter(), "client _id").session(session);
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
        { $pull: { relatedContacts: { $in: contactIds } } },
        { new: true, session }
      );
    }

    await session.commitTransaction(); // ✅ Commit if successful
    session.endSession();
    next();
  } catch (err) {
    await session.abortTransaction(); // ❌ Rollback if error occurs
    session.endSession();
    console.error("Error removing multiple contacts from ClientMaster relatedContacts:", err);
    next(err);
  }
});

const ContactMasterModel = mongoose.model("ContactMaster", ContactMasterSchema);
export default ContactMasterModel;
