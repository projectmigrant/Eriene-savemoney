import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// 開發模式下 hot reload 會重新執行模組，把連線快取在 global 上避免重複建立連線
const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("請在 .env.local 設定 MONGODB_URI");
  }
  if (!globalForMongoose.mongooseConn) {
    globalForMongoose.mongooseConn = mongoose.connect(MONGODB_URI).catch((err) => {
      // 連線失敗時清掉快取，下次請求才能重試
      globalForMongoose.mongooseConn = undefined;
      throw err;
    });
  }
  return globalForMongoose.mongooseConn;
}
