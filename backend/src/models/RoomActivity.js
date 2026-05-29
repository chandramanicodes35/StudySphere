import mongoose from 'mongoose';

const roomActivitySchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyRoom',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['join', 'leave', 'start_focus', 'pause_focus', 'complete_focus', 'start_break', 'complete_break'],
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const RoomActivity = mongoose.model('RoomActivity', roomActivitySchema);
export default RoomActivity;
