const express = require('express')
const router = express.Router()
const ImageCapCha = require('../models/ImageCapchaModel')

router.post(
  '/postimagecapcha',
  uploads.array('image', 100),
  async (req, res) => {
    try {
      const domain = 'http://localhost:8080'
      const image = req.files.map(file => `${domain}/${file.filename}`)
      const imagecapcha = new ImageCapCha()
      imagecapcha.image = Array.isArray(imagecapcha.image)
        ? imagecapcha.image.concat(image)
        : image
      await imagecapcha.save()
      res.json(imagecapcha)
    } catch (error) {
      res.json({ message: error })
    }
  }
)

router.get('/getimagecapcha', async (req, res) => {
  try {
    const imagecapcha = await ImageCapCha.find().lean()

    let allImages = imagecapcha.flatMap(item => item.image)

    if (allImages.length < 1) {
      return res.status(400).json({ message: 'Không đủ ảnh trong database' })
    }

    allImages = allImages.sort(() => Math.random() - 0.5)

    let selectedImages = allImages.slice(0, 8)

    const randomImage =
      selectedImages[Math.floor(Math.random() * selectedImages.length)]
    selectedImages.push(randomImage) 

    selectedImages = selectedImages.sort(() => Math.random() - 0.5)

    res.json(selectedImages)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})


module.exports = router
