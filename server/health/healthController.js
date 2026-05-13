
const healthController = async (req , res) => {
    res.status(200).json({
        message : "Server is alive.",
        status : "Ok"
    }) ;
}


export default healthController ;