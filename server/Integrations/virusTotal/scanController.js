import vtService from '../services/virusTotal.service.js'

exports.uploadAndScan = async (req,res) => {
    try {
        const result = await vtService.scanFile(req.file.path) ;
        res.json(result) ;
    } catch (error) {
        res.status(400).json({message : "Error Received"}) ;
    }
} 