import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true, select: false }, // excluded from queries by default
        role: { type: String, enum: ["user", "admin"], default: "user" },
        // Legacy compat
        favResidenciesID: [{ type: String }],
        bookedVisits: [{ type: Schema.Types.Mixed }],
    },
    { timestamps: true }
);

// ── Instance methods ──────────────────────────────────────────────────────────
UserSchema.methods.setPassword = async function (plain) {
    this.passwordHash = await bcrypt.hash(plain, 12);
};

UserSchema.methods.checkPassword = async function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

// ── Sanitise output — never leak passwordHash ─────────────────────────────────
UserSchema.methods.toSafeObject = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
    };
};

export default mongoose.model("User", UserSchema);
