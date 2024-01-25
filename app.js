import convert from './modules/convert'

const express = require('express')
const app = express()
const port = process.env.PORT || 5001


// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

convert(app)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

