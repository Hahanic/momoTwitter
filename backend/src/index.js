import os from 'os'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { connectDB } from './db/index.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

app.set('trust proxy', true)
// 中间件
app.use(cookieParser())
app.use(express.json())

// 静态文件服务
// app.use('/uploads', express.static('uploads'))

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
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/upload', uploadRoutes)

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
