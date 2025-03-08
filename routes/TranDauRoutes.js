const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const TranDau =  require('../models/TranDauModel')

router.post('/import-matches', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../backup/app_soccer.json')
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    const matches =
      jsonData.find(item => item.type === 'table' && item.name === 'app_soccer')
        ?.data || []

    const formattedMatches = matches.map(match => ({
      id: parseInt(match.id, 10),
      gameId: parseInt(match.gameId, 10) || null,
      started: parseInt(match.started, 10) || null,
      leagueName: match.leagueName || null,
      homeTeam: match.homeTeam || null,
      awayTeam: match.awayTeam || null,
      tradeVolume: parseInt(match.tradeVolume, 10) || null,
      homeIcon: match.homeIcon || null,
      awayIcon: match.awayIcon || null,
      is_home: parseInt(match.is_home, 10) || 0,
      is_hot: parseInt(match.is_hot, 10) || 0,
      resultH: parseInt(match.resultH, 10) || null,
      resultC: parseInt(match.resultC, 10) || null,
      resultUpH: parseInt(match.resultUpH, 10) || null,
      resultUpC: parseInt(match.resultUpC, 10) || null,
      resultUpdate: parseInt(match.resultUpdate, 10) || 0,
      message: match.message || null,
      created: parseInt(match.created, 10) || null,
      updated: parseInt(match.updated, 10) || null,
      status: parseInt(match.status, 10) || 1
    }))

    await TranDau.insertMany(formattedMatches)

    res.status(201).json({
      message: 'Dữ liệu trận đấu đã được nhập vào database thành công!',
      matches: formattedMatches
    })
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server', details: error.message })
  }
})

router.get('/getmatches', async (req, res) => {
  try {
    const { date } = req.query

    if (!date) {
      return res
        .status(400)
        .json({ message: 'Vui lòng cung cấp ngày (YYYY-MM-DD)' })
    }

    const startOfDay = Math.floor(
      new Date(`${date}T00:00:00Z`).getTime() / 1000
    )
    const endOfDay = Math.floor(new Date(`${date}T23:59:59Z`).getTime() / 1000)

    const matches = await TranDau.find({
      started: { $gte: startOfDay, $lte: endOfDay }
    })
    console.log(startOfDay, endOfDay)

    res.json(matches)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error })
  }
})



module.exports = router
