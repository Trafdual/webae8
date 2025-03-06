const express = require('express')
const router = express.Router()
const User = require('../models/UserModel')
const crypto = require('crypto')
const axios = require('axios')

const generateUniqueCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code
  let isDuplicate = true

  while (isDuplicate) {
    code = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('')

    const existingUser = await User.findOne({ code })
    if (!existingUser) {
      isDuplicate = false
    }
  }

  return code
}

const getPublicIP = async () => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json')
    return response.data.ip
  } catch (error) {
    return 'Không xác định'
  }
}

router.post('/register', async (req, res) => {
  try {
    const { username, password, code } = req.body
    const usercode = await User.findOne({ code: code })
    if (!usercode) {
      return res.status(400).json({ message: 'Mã mời không tồn tại' })
    }
    const hashedPassword = crypto
      .createHash('md5')
      .update(`code-${password}-198`)
      .digest('hex')
    const uniqueCode = await generateUniqueCode()
    const timeNow = Math.floor(Date.now() / 1000)

    const lastUser = await User.findOne().sort({ id: -1 })
    const newUserId = lastUser ? lastUser.id + 1 : 1

    const userIP = await getPublicIP()

    const user = new User({
      id: newUserId,
      username,
      password: hashedPassword,
      code: uniqueCode,
      created: timeNow,
      updated: timeNow,
      last_ip: userIP
    })

    user.lv1.push(usercode.id)
    await user.save()
    res.json(user)
  } catch (error) {
    res.json({ message: error })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: 'Tên đăng nhập không tồn tại' })
    }

    const hashedPassword = crypto
      .createHash('md5')
      .update(`code-${password}-198`)
      .digest('hex')

    if (hashedPassword !== user.password) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác' })
    }

    const userIP = await getPublicIP()
    user.last_login = Math.floor(Date.now() / 1000)
    user.last_ip = userIP
    await user.save()

    res.json({ message: 'Đăng nhập thành công', user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
