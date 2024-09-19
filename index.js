const express = require('express')
const cors = require('cors')
const chalk = require('chalk')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
// const { apiCallJob } = require('./helpers/scheduler/task')


// Set up the upload feature

const startAdminJS = async () => {
    const AdminJS = (await import('adminjs')).default;
    const AdminJSExpress = await import('@adminjs/express');
    const { Database, Resource, getModelByName } = await import('@adminjs/prisma');
    const { dark, noSidebar, light } = await import('@adminjs/themes')
    AdminJS.registerAdapter({ Database, Resource });
    const app = express()
    const prisma = new PrismaClient();

    const adminJs = new AdminJS({
        defaultTheme: dark.id,
        availableThemes: [dark, light, noSidebar],
        resources: [
            {
                resource: {
                    model: getModelByName("User"), // Ensure your model is correctly referenced here
                    client: prisma
                },
                options: {
                    // Add any AdminJS resource options here
                }
            },
            {
                resource: {
                    model: getModelByName("HomeOwner"), // Ensure your model is correctly referenced here
                    client: prisma
                },
                options: {
                    // Add any AdminJS resource options here
                }
            },
            {
                resource: {
                    model: getModelByName("ServiceProvider"), // Ensure your model is correctly referenced here
                    client: prisma
                },
                options: {
                    // Add any AdminJS resource options here
                }
            },
            {
                resource: {
                    model: getModelByName("MaterialProvider"), // Ensure your model is correctly referenced here
                    client: prisma
                },
                options: {
                    // Add any AdminJS resource options here
                }
            },
            {
                resource: {
                    model: getModelByName("Node"), // Ensure your model is correctly referenced here
                    client: prisma
                },
                options: {
                    // Add any AdminJS resource options here
                }
            },
            {
                resource: {
                    model: getModelByName("ServiceType"), // Ensure your model is correctly referenced here
                    client: prisma
                },
                options: {
                    // Add any AdminJS resource options here
                }
            },
            {
                resource: {
                    model: getModelByName("Community"), // Ensure your model is correctly referenced here
                    client: prisma
                },
                options: {
                    // Add any AdminJS resource options here
                }
            }
        ],
        rootPath: '/admin',
    });


    const adminJsRouter = AdminJSExpress.buildRouter(adminJs);
    app.use(adminJs.options.rootPath, adminJsRouter);

    app.use('/serviceimages', express.static(path.join(__dirname, 'serviceimages')));
    app.use('/categoryimages', express.static(path.join(__dirname, 'categoryimages')));
    app.use('/subcategoryimages', express.static(path.join(__dirname, 'subcategoryimages')));

    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    app.use('/uploads/profile_docs', express.static(path.join(__dirname, 'uploads/profile_docs')));
    app.use('/uploads/profile_gallery', express.static(path.join(__dirname, 'uploads/profile_gallery')));




    app.use(express.json())
    const corsOptions = {
        origin: '*', // Allows all origins
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    };

    app.use(cors(corsOptions));

    app.use('/api', require('./routes/auth.routes'))
    app.use('/api/cms', require('./routes/cms/service.routes'))


    app.use('/api/admin', require('./routes/admin/auth.routes'))
    app.use('/api/admin/users', require('./routes/admin/users.routes'))

    // logic changed
    app.use('/api/v2', require('./routes/advanced/category.routes'))
    app.use('/api/v2/admin', require('./routes/advanced/community.routes'))



    app.listen(8080, () => console.log(chalk.bgMagenta.black('Server is running on 8080')))

}
startAdminJS();