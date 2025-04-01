import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
  try {
    const { id, firstName, lastName, imageUrl } = req.body;

    //check if user exists
    const user = await User.findOne({ clerkId: id });
    if (!user) {
      //signup
      await User.create({
        clerkId: id,
        fullName: `${firstName || ""} ${lastName || ""}`.trim(),
        imageUrl,
      });
    }

    res.send(200).json({ success: true });
  } catch (error) {
    console.log("Error in callback route", error);
    next(error);
  }
};
