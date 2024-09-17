const prisma = require('@prisma/client')
const chalk = require('chalk')
const prismaClient = new prisma.PrismaClient()


const getAllCommunityPasscodes = async (req, res) => {
    try {
        // Fetch all communities
        const communities = await prismaClient.community.findMany({
            select: {
                id: true,
                name: true,
                passcode: true
            }
        });

        if (communities.length === 0) {
            return res.status(404).json({ message: 'No communities found' });
        }

        // Map communities to include only passcodes
        const passcodes = communities.map(community => ({
            id: community.id,
            name: community.name,
            passcode: community.passcode
        }));

        return res.status(200).json({
            message: 'Community passcodes retrieved successfully',
            passcodes
        });

    } catch (err) {
        console.log(chalk.bgRedBright('Error in getAllCommunityPasscodes'), err);
        return res.status(500).json({
            message: 'Internal Server Issue'
        });
    }
};


const getHomeownersByPasscode = async (req, res) => {
    const { id } = req.query; // Assume passcode is passed as a query parameter

    if (!id) {
        console.log(chalk.bgYellowBright("getHomeownersByPasscode params check failed"), req.query);
        return res.status(400).json({ message: 'id is required' });
    }

    try {
        // Find the community by passcode
        console.log(id)
        const community = await prismaClient.community.findUnique({
            where: { id: id } // Ensure passcode is an integer
        });

        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Retrieve homeowners associated with the found community
        const homeowners = await prismaClient.homeOwner.findMany({
            where: { communityId: community.id },
            select: {
                id: true,
                name: true,
                mobile: true,
                interest: true,
                profile_pic: true,
                User: true
            }
        });

        return res.status(200).json({
            message: 'Homeowners retrieved successfully',
            homeowners
        });

    } catch (err) {
        console.log(chalk.bgRedBright('Error in getHomeownersByPasscode'), err);
        return res.status(500).json({
            message: 'Internal Server Issue'
        });
    }
};

const generatePasscode = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit passcode
};

const generateAndCheckPasscode = async (req, res) => {
    try {
        let passcode;
        let isAvailable = false;

        // Attempt to generate a unique passcode
        do {
            passcode = generatePasscode();

            // Check if the passcode already exists in any community
            const existingCommunity = await prismaClient.community.findFirst({
                where: { passcode }
            });

            if (!existingCommunity) {
                isAvailable = true; // The passcode is unique
            }

        } while (!isAvailable); // Keep generating until a unique passcode is found

        return res.status(200).json({
            message: 'Unique passcode generated successfully',
            passcode
        });

    } catch (err) {
        console.log(chalk.bgRedBright('Error in generateAndCheckPasscode'), err);
        return res.status(500).json({
            message: 'Internal Server Issue'
        });
    }
};

const addCommunity = async (req, res) => {
    const { name, passcode } = req.body;

    // Validate input
    if (!name || !passcode) {
        console.log(chalk.bgYellowBright("addCommunity params check failed"), req.body);
        return res.status(400).json({ message: 'Name and passcode are required' });
    }

    if (typeof passcode !== 'number') {
        console.log(chalk.bgYellowBright("Invalid passcode type"), req.body);
        return res.status(400).json({ message: 'Passcode must be a number' });
    }

    try {
        // Check if a community with the same name or passcode already exists
        const existingCommunity = await prismaClient.community.findFirst({
            where: {
                OR: [
                    { name: name },
                    { passcode: passcode }
                ]
            }
        });

        if (existingCommunity) {
            return res.status(400).json({ message: 'A community with the same name or passcode already exists' });
        }

        // Create new community
        const newCommunity = await prismaClient.community.create({
            data: {
                name,
                passcode
            }
        });

        return res.status(201).json({
            message: 'Community created successfully',
            community: newCommunity
        });

    } catch (err) {
        console.log(chalk.bgRedBright('Error in addCommunity'), err);
        return res.status(500).json({
            message: 'Internal Server Issue'
        });
    }
};

const generateOTP = async () => {
    let passcode;
    let isUnique = false;

    while (!isUnique) {
        passcode = Math.floor(100000 + Math.random() * 900000);
        console.log(passcode)
        const existingUser = await prismaClient.user.findFirst({
            where: { passcode }
        });

        if (!existingUser) {
            isUnique = true;
        }
    }

   
    return passcode;
};

const addCommunityByName = async (req, res) => {
    const { name } = req.body;

    // Validate input
    if (!name) {
        console.log(chalk.bgYellowBright("addCommunity params check failed"), req.body);
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        // Check if a community with the same name or passcode already exists
        const existingCommunity = await prismaClient.community.findFirst({
            where:
                { name: name }
        });

        if (existingCommunity) {
            return res.status(400).json({ message: 'A community with the same name or passcode already exists' });
        }
        const passcode = await generateOTP()
        // Create new community
        if(!passcode){
            return res.status(401).json({
                message: 'Failed to generate passcode'
            });
        }
        console.log(passcode)
        const newCommunity = await prismaClient.community.create({
            data: {
                name,
                passcode : passcode
            }
        });

        return res.status(201).json({
            message: 'Community created successfully',
            community: newCommunity
        });

    } catch (err) {
        console.log(chalk.bgRedBright('Error in addCommunity'), err);
        return res.status(500).json({
            message: 'Internal Server Issue'
        });
    }
};



module.exports = {
    getAllCommunityPasscodes,
    getHomeownersByPasscode,
    generateAndCheckPasscode,
    addCommunity,
    addCommunityByName
}