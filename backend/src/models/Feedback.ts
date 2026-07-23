import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  name: string;
  email: string;
  type: 'issue' | 'suggestion';
  message: string;
  createdAt: Date;
  status: 'new' | 'reviewed' | 'resolved';
}

const feedbackSchema = new Schema<IFeedback>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  type: {
    type: String,
    enum: ['issue', 'suggestion'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'resolved'],
    default: 'new'
  }
}, {
  timestamps: true
});

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
