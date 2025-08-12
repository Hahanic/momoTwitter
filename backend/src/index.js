import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import os from 'os'
import { connectDB } from './db/index.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

// 中间件
app.use(cookieParser())
app.use(express.json())

// 跨域配置 process.env.Test_Server=用于测试的服务器地址，比如在手机上访问
const allowedOrigins = ['http://localhost:5173', process.env.Test_Server]
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

// 路由
app.use('/api/user', userRoutes)
app.use('/api/post', postRoutes)

// 错误处理中间件
app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
  connectDB()

  console.log('\n🚀 服务器启动成功!')
  console.log(`📡 端口: ${port}`)
  console.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log('\n📍 可访问地址:')
  console.log(`   本地访问: http://localhost:${port}`)
  console.log(`   本地访问: http://127.0.0.1:${port}`)

  // 获取本机IP地址
  const networkInterfaces = os.networkInterfaces()

  Object.keys(networkInterfaces).forEach((interfaceName) => {
    const interfaces = networkInterfaces[interfaceName]
    interfaces.forEach((interfaceInfo) => {
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        console.log(`   局域网访问: http://${interfaceInfo.address}:${port}`)
      }
    })
  })

  console.log('='.repeat(50))
})
