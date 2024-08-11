const prisma = require('@prisma/client')

const prismaClient = new prisma.PrismaClient()

const getUsers = async(req,res) => {
    const userId = req.user?.userId

    try{
        if(!userId){
            return res.status(401).json({message: "Unauthorized User. No user connection found"})
        }
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: userId,
                type:'ADMIN'
            }
        });

        if(!adminUser){
            return res.status(401).json({message: "Unauthorized User"})
        }

        const getAllUsers = await prismaClient.user.findMany({
            where : {type:'HOME_OWNER'},
            include: {
                HomeOwner: true
            },
        })

        return res.status(200).json({message:"Gotcha! all users", users : getAllUsers})
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const getMaterialUsers = async(req,res) => {
    const userId = req.user?.id
    try{
        const adminUser = await prismaClient.user.findUnique({
            where: {
                id: userId,
                type:'ADMIN'
            }
        });

        if(!adminUser){
            return res.status(401).json({message: "Unauthorized User"})
        }

        const getAllMaterialProviders = await prismaClient.user.findMany({
            where : {type:'MATERIAL_PROVIDER'}
        })

        return res.status(200).json({message:"Gotcha! all material providers", users : getAllMaterialProviders})
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}




module.exports = {
    getUsers,
    getMaterialUsers
}