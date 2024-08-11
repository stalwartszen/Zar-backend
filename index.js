const express = require('express')
const cors = require('cors')
const chalk = require('chalk')

const app = express()


app.use(express.json())
const corsOptions = {
    origin: '*', // Allows all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allows specific methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allows specific headers
};

app.use(cors(corsOptions));

app.use('/api', require('./routes/auth.routes'))
app.use('/api/admin', require('./routes/admin/auth.routes'))
app.use('/api/cms', require('./routes/cms/service.routes'))


app.listen(8080, () => console.log(chalk.bgMagenta.black('Server is running on 8080')))