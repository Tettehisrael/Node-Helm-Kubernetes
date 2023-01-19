const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())

app.get('/', (req, res) => {
  res.json([
    {
      "id": "1",
      "title": "This is my First Blog Title"
    }
  ])
})

app.listen(4000, () => {
  console.log('Server running on port 4000')
})