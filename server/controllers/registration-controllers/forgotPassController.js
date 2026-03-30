import crypto from 'node:crypto'

export const forgotPassword = async (req,res) => {
    const { email } =  req.body ;


    const user = User.findOne({email}) ;
    if(!user){
        res.status(400)
        throw new Error.json({message : "Invalid Email. User not found !"}) ;
    }

    const resetToken = crypto.randomBytes(32).toString("hex") ;
    const hashedToken = crypto.createHash('sha512').update(resetToken).digest("hex") ;


    user.resetPasswordToken = hashedToken ;
    user.resetPasswordTimeout = Date.now() + 1000 * 60 * 10 ;
    
    await user.save() ;


    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    res.json({message : "Mail sent ! "}) ;


}