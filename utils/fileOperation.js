import fs from "fs";
import jimp from 'jimp';
export const deleteFile = (path) => {
    return new Promise((resolve, reject) => {
        try {
            fs.rm(path, (err) => {
                if (err) resolve(0);
                else resolve(1);
            })
        } catch (err) {
            resolve(0);
        }
    })
} 

export const compressAndOverwrite = async (filePath) => {
    try {
        jimp.read(`./static${filePath}`, (err, lenna) => {
            if (err) return next();
            lenna
                .rotate(0)
                .resize(200, 200)  
                .quality(60)
                .write(`./static/compressed/${filePath}`);
        });
    } catch (error) {
        return next();
    }
}; 