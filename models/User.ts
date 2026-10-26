import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // bcrypt 雜湊，預設查詢不帶出
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof UserSchema>;

// hot reload 時先移除舊的 model，確保改過的 schema 會生效
if (mongoose.models.User) mongoose.deleteModel("User");
export const UserModel = mongoose.model("User", UserSchema);
