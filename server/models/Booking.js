import mongoose from "mongoose";

const { Schema } = mongoose;

const BookingSchema = new Schema(
    {
        property: {
            id: { type: String, required: true }, // slug or _id
            title: { type: String, required: true },
            image: { type: String },
            city: { type: String },
        },
        user: {
            id: { type: Schema.Types.ObjectId, ref: "User", required: true },
            name: { type: String, required: true },
            email: { type: String, required: true },
        },
        visitDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
        },
        adminNote: { type: String, default: "" },
    },
    { timestamps: true }
);

BookingSchema.index({ "user.id": 1, createdAt: -1 });
BookingSchema.index({ status: 1 });

export default mongoose.model("Booking", BookingSchema);
