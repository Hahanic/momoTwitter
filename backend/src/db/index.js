import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: 'admin',
      pass: '你的安全密码',
      authSource: 'admin',
    })

    console.log('数据库连接成功', `mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`)
  } catch (error) {
    console.log('数据库连接失败', error)
  }
}
