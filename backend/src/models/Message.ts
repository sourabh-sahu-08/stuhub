import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  text: string;
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId;
  type: "direct" | "admin-request" | "broadcast";
  replyTo?: mongoose.Types.ObjectId;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"]
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    type: {
      type: String,
      enum: ["direct", "admin-request", "broadcast"],
      default: "direct"
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Optimize queries for retrieving recent messages
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
