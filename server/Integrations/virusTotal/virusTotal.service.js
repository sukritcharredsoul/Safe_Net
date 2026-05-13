import axios from 'axios' ;
import fs from 'fs' ;
import formData from 'form-data'


const API = process.env.VIRUS_TOTAL ;

exports.scanfile = async (filePath) => {
    const form = new formData() ;
    form.append('file',fs.createReadStream(filePath)) ;

    const response = await axios.post(
        'https://www.virustotal.com/api/v3/files',
        form,
        {
            headers : {
                ...form.getHeaders(),
                'x-api-key' : API 
            }
        }
    ) ;

    return response.data ;

} ;


exports.getScanResult = async (analysisId) => {
    const response = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
            headers: { 'x-apikey': API_KEY }
        }
    );

    return response.data;
};
