import {Activity} from './activity.model.js'

export const getActivity = async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(activities);

    } catch (error) {
        console.log(error.message) ;
        res.status(500).json({ message: "Error at the endpoint" });
    }
};