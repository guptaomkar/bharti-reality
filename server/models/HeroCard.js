import mongoose from "mongoose";

const heroCardSchema = new mongoose.Schema({
  title: {
    type: String, // Keeping this field for reference/admin display
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  propertyType: {
    type: String,
    enum: [
      "penthouse",
      "villa",
      "apartment",
      "loft",
      "mansion",
      "townhouse",
      "cottage",
      "estate",
      "chalet",
      "commercial",
    ],
    required: true,
  },
  position: {
    left: {
        type: String,
        default: "10%",
    },
    bottom: {
        type: String,
        default: "10%",
    }
  },
  animation: {
    duration: {
        type: Number,
        default: 10,
    },
    delay: {
        type: Number,
        default: 0,
    }
  },
  order: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export const HeroCard = mongoose.model("HeroCard", heroCardSchema);
