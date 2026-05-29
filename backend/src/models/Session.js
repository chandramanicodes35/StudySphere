import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyRoom',
      required: true,
    },
    type: {
      type: String,
      enum: ['focus', 'break'],
      required: true,
      default: 'focus',
    },
    duration: {
      type: Number,
      required: true,
      default: 1500, // 25 minutes default in seconds
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model('Session', sessionSchema);
export default Session;
