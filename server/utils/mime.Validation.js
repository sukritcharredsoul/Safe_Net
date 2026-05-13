import fs from 'fs' ;
import { fileTypeFromFile } from 'file-type' ;


async function checkfile(filePath){
    try {

        if(!fs.existsSync(filePath)){
            throw new Error("File Not Found") ;
        }

        const detected = await fileTypeFromFile(filePath) ;

        if (!detected) {
            throw new Error("Unknown or unsupported file type");
        } ;

        const extName = path.extName(filePath).slice(1) ;

        if (extFromName !== detected.ext) {
            throw new Error("File extension mismatch (possible spoofing)");
        }

        return {
            valid : true,
            mime : detected.mime,
            ext : extName.mime
        } ;

        
    } catch (error) {
        return {
            valid : false ,
            error : error.message 
        }
    }
}


export default checkfile ;