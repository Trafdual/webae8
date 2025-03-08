const express = require('express')
const router = express.Router()
const User = require('../models/UserModel')
const crypto = require('crypto')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { removeVietnameseAccents } = require('./XoaDauTiengViet')
const { createUser, deposit } = require('./CapNhatUserLaunchGame')

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
    const userlast = await User.findOne({ username })
    if (userlast) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' })
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

    if (code) {
      const usercode = await User.findOne({ code: code })
      if (!usercode) {
        return res.status(400).json({ message: 'Mã mời không tồn tại' })
      }
      user.lv1.push(usercode.id)
    }

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

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/deletealluser', async (req, res) => {
  try {
    await User.deleteMany({})
    res.json({ message: 'Đã xóa toàn bộ dữ liệu trong collection User' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})

router.post('/import-json', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../backup/user.json')
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    const users =
      jsonData.find(item => item.type === 'table' && item.name === 'app_users')
        ?.data || []

    const formattedUsers = users.map(user => ({
      id: parseInt(user.id, 10),
      name: user.name || null,
      username: user.username,
      password: user.password,
      withdrawal_password: parseInt(user.withdrawal_password, 10) || 0,
      country: user.country || null,
      code: user.code || null,
      email: user.email || null,
      email_verified: parseInt(user.email_verified, 10) || 0,
      phone: user.phone || null,
      phone_verified: parseInt(user.phone_verified, 10) || 0,
      coins: parseFloat(user.coins) || 0,
      bonus: parseFloat(user.bonus) || 0,
      has_bank: parseInt(user.has_bank, 10) || 0,
      bin_bank: user.bin_bank || '',
      bank_name: user.bank_name || null,
      bank_account_name: user.bank_account_name || null,
      bank_account_number: user.bank_account_number || null,
      vip: parseInt(user.vip, 10) || 0,
      lv1: user.lv1 ? [parseInt(user.lv1, 10)] : [],
      lv2: user.lv2 ? [parseInt(user.lv2, 10)] : [],
      lv3: user.lv3 ? [parseInt(user.lv3, 10)] : [],
      created: parseInt(user.created, 10) || 0,
      updated: parseInt(user.updated, 10) || 0,
      status: parseInt(user.status, 10) || 0,
      last_login: user.last_login ? parseInt(user.last_login, 10) : null,
      last_ip: user.last_ip || null
    }))

    await User.insertMany(formattedUsers)

    res.status(201).json({
      message: 'Dữ liệu từ JSON đã được nhập vào database thành công!',
      users: formattedUsers
    })
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server', details: error.message })
  }
})

router.post('/launch_game', async (req, res) => {
  try {
    const { portfolio, productId, device, gameProviderId, gameId, userData } =
      req.body
    if (!userData) return res.json({link:'http://localhost:3000/login'})

    let username = removeVietnameseAccents(userData.username)
    const user = await User.findOne({ username: userData.username })
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại' })
    }

    const companyKey = 'C6012BA39EB643FEA4F5CD49AF138B02'

    await createUser(username)
    await deposit(username, user.id, user.coins)

    const response = await axios.post(
      'https://ex-api-yy5.tw946.com/web-root/restricted/player/login.aspx',
      {
        Username: username,
        Portfolio: portfolio,
        IsWapSports: false,
        CompanyKey: companyKey,
        ServerId: 'YY-production'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const data = response.data
    let urlRes = 'https:' + data.url
    let urldevice = urlRes

    if (portfolio === 'Casino') {
      urldevice += `&device=${device}&productId=${productId}&locale=vi-VN`
    } else if (portfolio === 'SportsBook') {
      urldevice += `&device=${device}&lang=vi-VN`
    } else if (portfolio === 'ThirdPartySportsBook') {
      urldevice += `&gpid=${gameProviderId}&gameid=${gameId}&device=${device}&lang=vi-VN`
    } else if (portfolio === 'SeamlessGame') {
      if (gameProviderId == 7) {
        urldevice += `&gpid=${gameProviderId}&gameid=${gameId}&device=${device}&lang=vi-VN&betCode=7VND5500_7VND252500_7VND505000_7VND20010000_7VND100050000`
      } else {
        urldevice += `&gpid=${gameProviderId}&gameid=${gameId}&device=${device}&lang=vi-VN`
      }
    } else if (portfolio === 'Games') {
      urldevice += `&gameid=${gameId}&device=${device}&lang=vi-VN`
    }

    return res.json({
      status: 200,
      url: urldevice
    })
  } catch (error) {
    console.error('Lỗi khi khởi chạy game:', error.message)
    return res.status(500).json({ message: 'Có lỗi xảy ra' })
  }
})

module.exports = router
