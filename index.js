const express = require('express')
const cors = require('cors')
const chalk = require('chalk')
const path = require('path')
// const { apiCallJob } = require('./helpers/scheduler/task')


const app = express()
app.use('/serviceimages', express.static(path.join(__dirname, 'serviceimages')));
app.use('/categoryimages', express.static(path.join(__dirname, 'categoryimages')));
app.use('/subcategoryimages', express.static(path.join(__dirname, 'subcategoryimages')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profile_docs', express.static(path.join(__dirname, 'uploads/profile_docs')));
app.use('/uploads/profile_gallery', express.static(path.join(__dirname, 'uploads/profile_gallery')));




app.use(express.json())
const corsOptions = {
    origin: '*', // Allows all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allows specific methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allows specific headers
};

app.use(cors(corsOptions));

app.use('/api', require('./routes/auth.routes'))
app.use('/api/cms', require('./routes/cms/service.routes'))


app.use('/api/admin', require('./routes/admin/auth.routes'))
app.use('/api/admin/users', require('./routes/admin/users.routes'))




app.listen(8080, () => console.log(chalk.bgMagenta.black('Server is running on 8080')))