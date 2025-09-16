import AiConversation from '../db/model/AiConversation.js'
import { chatWithAI } from '../services/aiService.js'
import { sendResponse } from '../utils/index.js'

// 最大上下文消息数
const MAX_CONTEXT_MESSAGES = 50

export const chatWithBot = async (req, res) => {
  const { message } = req.body
  const conversationId = req.params.id
  const userId = req.user.id

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return sendResponse(res, 400, { message: '消息内容不能为空' })
  }

  let conversation
  if (conversationId) {
    conversation = await AiConversation.findOne({ _id: conversationId, userId: userId })
    if (!conversation) {
      return sendResponse(res, 404, { message: '对话未找到' })
    }
  } else {
    conversation = new AiConversation({
      userId: userId,
      messages: [
        {
          role: 'system',
          content: '你是一个乐于助人的AI助手。只能使用markdown格式回复。',
        },
      ],
    })
  }

  const userMessage = { role: 'user', content: message }
  conversation.messages.push(userMessage)

  const systemMessage = conversation.messages.find((m) => m.role === 'system')
  const recentMessages = conversation.messages.filter((m) => m.role !== 'system').slice(-MAX_CONTEXT_MESSAGES)
  const messagesForApi = systemMessage ? [systemMessage, ...recentMessages] : recentMessages

  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const stream = await chatWithAI(messagesForApi)

  let fullContent = ''
  let initialChunk = true
  let buffer = ''

  stream.on('data', (chunk) => {
    buffer += chunk.toString('utf-8')

    // 只要缓冲区中包含完整的消息分隔符，就持续处理
    while (buffer.includes('\n\n')) {
      const messageEndIndex = buffer.indexOf('\n\n')
      // 提取一个完整的消息块
      const messageBlock = buffer.substring(0, messageEndIndex)
      // 从缓冲区移除已处理的消息
      buffer = buffer.substring(messageEndIndex + 2)

      const lines = messageBlock.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6).trim()
          if (dataStr === '[DONE]') {
            continue
          }
          try {
            const data = JSON.parse(dataStr)
            const delta = data.choices?.[0]?.delta?.content

            if (delta) {
              fullContent += delta
              if (initialChunk) {
                // 第一块数据包含 conversationId 和 role (assistant)
                const simplifiedData = {
                  choices: [
                    {
                      delta: {
                        role: data.choices[0].delta.role,
                        content: delta,
                      },
                    },
                  ],
                  conversationId: conversation._id,
                }
                res.write(`data: ${JSON.stringify(simplifiedData)}\n\n`)
                initialChunk = false
              } else {
                // 后续数据只包含 content
                const simplifiedData = {
                  choices: [
                    {
                      delta: {
                        content: delta,
                      },
                    },
                  ],
                }
                res.write(`data: ${JSON.stringify(simplifiedData)}\n\n`)
              }
            }
          } catch (parseError) {
            console.error('JSON解析失败，跳过该数据块:', dataStr)
          }
        }
      }
    }
  })

  stream.on('end', async () => {
    try {
      if (fullContent) {
        const assistantMessage = { role: 'assistant', content: fullContent }
        conversation.messages.push(assistantMessage)
        await conversation.save()
      }
    } catch (dbError) {
      console.error('保存对话失败:', dbError)
    } finally {
      res.write('data: [DONE]\n\n') // 手动发送结束信号给前端
      res.end()
    }
  })

  stream.on('error', (err) => {
    console.error('AI Stream Error:', err)
    res.end()
  })
}

// 获取对话列表
export const getConversations = async (req, res) => {
  const userId = req.user.id

  const conversations = await AiConversation.find({ userId: userId }).sort({ updatedAt: -1 })

  const conversationList = conversations.map((conv) => ({
    _id: conv._id,
    userId: conv.userId,
    title: conv.title,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  }))

  return sendResponse(res, 200, { conversationList })
}

// 获取单个对话历史
export const getConversationHistory = async (req, res) => {
  const userId = req.user.id
  const conversationId = req.params.id

  const conversation = await AiConversation.findOne({ _id: conversationId, userId: userId })
  if (!conversation) {
    return sendResponse(res, 404, { message: '对话未找到' })
  }

  const userMessages = conversation.messages.filter((msg) => msg.role !== 'system')

  return sendResponse(res, 200, userMessages)
}
