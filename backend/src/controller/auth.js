import User from "../db/model/User.js"

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    // 检查输入
    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' });
    }
    // 查找用户
    const user = await User.findOne({ 'email': email }).select('+password')
    // 验证用户
    const isPasswordCorrent = user && user.password === password
    if(!isPasswordCorrent) {
      return res.status(401).json({ message: '账户或密码错误' })
    }
    // 登录成功
    const userToReturn = user.toObject()
    delete userToReturn.password
    res.status(200).json({ message: '登录成功', user: userToReturn })
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

export const getIdentifyingCode = (req, res) => {
  const chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  res.status(200).json({ code: result, message: "成功" })
}

export const register = async (req, res) => {
  const { email, password, emailcode } = req.body
  try {
    // 检查是否已注册
    const user = await User.findOne({ 'email': email })
    if(user) return res.status(409).json({ message: '当前邮箱已被注册' })

    // 验证邮箱
    // if(emailcode) return res.json({ status: 400, message: '邮箱验证码错误' })
    
    // 密码加密
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // 创建实例
    const newUser = new User({
      username: email.split('@')[0],
      email: email,
      password: password
    })

    if(newUser) {
      await newUser.save()
      const userToReturn = newUser.toObject()
      delete userToReturn.password
      res.status(201).json({
        message: '注册成功',
        user: userToReturn
      });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器内部错误，请稍后重试' })
  }
}