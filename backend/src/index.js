import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectDB } from './db/index.js'
import { login, getIdentifyingCode, register, logout } from './controller/auth.js'
import { createPost, getPost, getPostReplies } from './controller/post.js'

dotenv.config()
const app = express()
const port = 3000

// 启用cookie-parser中间件
app.use(cookieParser())
// 解析请求体
app.use(express.json())

// 跨域问题
const allowedOrigins = ['http://localhost:5173']
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

// 注册
app.post('/api/register', register)
// 登录
app.post('/api/login', login)
// 登出
app.post('/api/logout', logout)
// 验证码
app.get('/api/getIdentifyingCode', getIdentifyingCode)
// 获取帖子
app.get('/api/post/getPost', getPost)
// 发帖
app.post('/api/post/create', createPost)
// 获取帖子的回复
app.get('/api/post/:postId/replies', getPostReplies)

app.listen(process.env.PORT, () => {
  connectDB()
  console.log(`监听端口 ${port}`)
})
