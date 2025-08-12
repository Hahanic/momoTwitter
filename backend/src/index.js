import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectDB } from './db/index.js'
import { login, getIdentifyingCode, getCurrentUser, register, logout } from './controller/auth.js'
import { createPost, createPostReply, getPost, getPostReplies, likePost, getOnePost } from './controller/post.js'
import { protectAuthRoute } from './middleware/authMiddleware.js'
import { asyncHandler, errorHandler, notFound } from './middleware/errorHandler.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

// 中间件
app.use(cookieParser())
app.use(express.json())

// 跨域配置
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

// 路由
app.get('/api/getCurrentUser', protectAuthRoute, asyncHandler(getCurrentUser))
app.post('/api/register', asyncHandler(register))
app.post('/api/login', asyncHandler(login))
app.post('/api/logout', asyncHandler(logout))
app.get('/api/getIdentifyingCode', getIdentifyingCode)

// 帖子相关路由
app.get('/api/post/getPost', asyncHandler(getPost))
app.post('/api/post/create', protectAuthRoute, asyncHandler(createPost))
app.get('/api/post/:postId/get', asyncHandler(getOnePost))
app.get('/api/post/:postId/replies', asyncHandler(getPostReplies))
app.post('/api/post/:postId/replies', protectAuthRoute, asyncHandler(createPostReply))
app.post('/api/post/:postId/like', protectAuthRoute, asyncHandler(likePost))

// 错误处理中间件
app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
  connectDB()
  console.log(`监听端口 ${port}`)
})
