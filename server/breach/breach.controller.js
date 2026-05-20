import { XposedOrNot } from "xposedornot";

const xon = new XposedOrNot();

export const checkEmail = async(req,res) => {
    try {
        const {email} = req.query ;
        
        if (!email || typeof email !== "string") {
            return res.status(400).json({ message: "Invalid email" });
        }

        const result = await xon.checkEmail(email) ;


        return res.status(200).json({
        success: true,
        data: result
    });

    } catch (error) {
        return res.status(500).json({message : error.message })
    }
}


