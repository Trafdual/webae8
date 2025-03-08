const axios = require('axios')

const COMPANY_KEY = 'C6012BA39EB643FEA4F5CD49AF138B02'
const SERVER_ID = 'YY-production'
const User = require('../models/UserModel')
const UserCoinLog = require('../models/CoinLogModel')

async function createUser (Username) {
  try {
    const response = await axios.post(
      'https://ex-api-yy5.tw946.com/web-root/restricted/player/register-player.aspx',
      {
        Username: Username,
        UserGroup: 'a',
        Agent: 'VND1_ae8',
        CompanyKey: COMPANY_KEY,
        ServerId: SERVER_ID
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (error) {
    console.error('Lỗi khi tạo user:', error.response?.data || error.message)
    return null
  }
}

async function deposit (Username, userId, amount) {
  try {
    const code = 'D2024' + Math.floor(Math.random() * 999999999999999)
    const beforeDot = Math.floor(amount)

    if (beforeDot > 10) {
      const response = await axios.post(
        'https://ex-api-yy5.tw946.com/web-root/restricted/player/deposit.aspx',
        {
          Username: Username,
          TxnId: code,
          Amount: beforeDot,
          CompanyKey: COMPANY_KEY,
          ServerId: SERVER_ID
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const data = response.data

      if (data.error && data.error.id === 0) {
        await updateBetCoin(
          userId,
          beforeDot,
          `Nạp Tiền Sảnh Game ${code}`,
          'sub'
        )
      }

      return data
    }
  } catch (error) {
    console.error('Lỗi khi nạp tiền:', error.response?.data || error.message)
    return null
  }
}

async function updateBetCoin (userId, amount, reason, type = 'add') {
  const user = await User.findOne({ id: userId })

  if (!user) return false

  let updated = 0
  const createdAt = Date.now()
  const hashString = `${userId}${createdAt}${amount}`
  const hash = crypto.createHash('md5').update(hashString).digest('hex')

  const exists = await UserCoinLog.exists({ reason: reason })

  if (type === 'add' && !exists) {
    await UserCoinLog.create({
      userId,
      amount,
      reason,
      previousCoins: user.coins,
      hash
    })
    updated = await User.updateOne({ id: userId }, { $inc: { coins: amount } })
  }

  if (type === 'sub' && user.coins - amount >= 0 && !exists) {
    await UserCoinLog.create({
      userId,
      amount,
      reason,
      previousCoins: user.coins,
      hash
    })
    updated = await User.updateOne({ id: userId }, { $inc: { coins: -amount } })
  }

  if (type === 'refund') {
    await UserCoinLog.create({
      userId,
      amount,
      reason,
      previousCoins: user.coins,
      hash
    })
    updated = await User.updateOne({ id: userId }, { $inc: { coins: amount } })
  }

  return updated.modifiedCount > 0
}


module.exports = { createUser, deposit }
