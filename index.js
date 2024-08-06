const express = require('express')
const cors = require('cors')
const chalk = require('chalk')

const app = express()


app.use(express.json())
app.use(cors())

app.use('/api', require('./routes/auth.routes'))
app.use('/api/admin', require('./routes/admin/auth.routes'))
app.use('/api/cms', require('./routes/cms/service.routes'))


app.listen(8080, () => console.log(chalk.bgMagenta.black('Server is running on 8080')))