import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const openai_base_url = 'https://openai.qiniu.com/v1'
const openai_api_key = process.env.QINIU_AI_API_KEY

// 翻译帖子
export const translateText = async (text, targetLanguage) => {
  if (!openai_api_key) {
    throw new Error('未配置七牛云 API Key')
  }

  try {
    const response = await axios.post(
      `${openai_base_url}/chat/completions`,
      {
        model: 'deepseek-v3',
        messages: [
          {
            role: 'system',
            content: `You are an expert translator specializing in social media content. Translate the following post into ${targetLanguage}.
              Key rules:
              1. The translation must be natural and fluent, preserving the original tone (e.g., informal, humorous, serious).
              2. Do NOT translate elements like usernames (e.g., @username), hashtags (e.g., #topic), and URLs. Keep them exactly as they are in the original text.
              3. If the text contains emojis, retain them in the translation.
              4. Output ONLY the final translated text, without any introductory phrases or explanations.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openai_api_key}`,
        },
      }
    )

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim()
    } else {
      throw new Error('翻译API返回数据格式不正确')
    }
  } catch (error) {
    console.error('调用七牛云翻译API失败:', error.response ? error.response.data : error.message)
    throw new Error('翻译服务暂时不可用')
  }
}

// AI聊天
export const chatWithAI = async (messages) => {
  if (!openai_api_key) {
    throw new Error('未配置七牛云 API Key')
  }

  try {
    const response = await axios.post(
      `${openai_base_url}/chat/completions`,
      {
        model: 'deepseek-v3',
        messages: messages,
        stream: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openai_api_key}`,
        },
        responseType: 'stream',
      }
    )

    return response.data
  } catch (error) {
    console.error('调用七牛云AI聊天API失败:', error.response ? error.response.data : error.message)
    throw new Error('AI聊天服务暂时不可用')
  }
}
