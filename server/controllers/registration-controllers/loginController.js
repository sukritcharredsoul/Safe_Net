import bcrypt from 'bcrypt' ;

export const login = async (req,res) => {
    try {
        
        const { email } = req.body ;
        const {password} = req.body || {} ; // Incase we get undefined object.


        if(!email || !password){
            req.status(400) ;
            throw new Error({ message : "Credentials Required"}) ;
        }

        const user = User.findOne({email}) ;

        if(!user || (await bcrypt.compare(user.password,password))){
            res.status(404) ;
            throw new Error({message : "Invalid Credentials"}) ;
        }


    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}