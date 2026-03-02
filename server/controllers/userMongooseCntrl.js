import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const toFav = asyncHandler(async (req, res) => {
    const { rid } = req.params;
    const userId = req.userId; // From requireAuth middleware

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.favResidenciesID.includes(rid)) {
            // Remove
            user.favResidenciesID = user.favResidenciesID.filter(id => id !== rid);
            await user.save();
            res.status(200).json({ message: "Removed from fav", user: user.toSafeObject(), favResidenciesID: user.favResidenciesID });
        } else {
            // Add
            user.favResidenciesID.push(rid);
            await user.save();
            res.status(200).json({ message: "Added to fav", user: user.toSafeObject(), favResidenciesID: user.favResidenciesID });
        }
    } catch (error) {
        throw new Error(error.message);
    }
});

export const getAllFav = asyncHandler(async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ favResidenciesID: user.favResidenciesID });
    } catch (error) {
        throw new Error(error.message);
    }
});
