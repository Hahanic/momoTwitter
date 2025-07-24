import mongoose from 'mongoose'
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`)

    console.log('数据库连接成功', `mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`)
  } catch (error) {
    console.log('数据库连接失败', error)
  }
}