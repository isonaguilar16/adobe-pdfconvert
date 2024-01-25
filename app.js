import express from 'express'
import convert from './modules/convert.js'

const app = express()
const port = process.env.PORT || 5001


app.get('/', (req, res) => {
  res.send('Hello World!')
})

convert(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

