const prisma = require('@prisma/client')
const chalk = require('chalk')
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { sent_welcome_mail } = require('../../helpers/mailer');
const prismaClient = new prisma.PrismaClient()





module.exports = {

}