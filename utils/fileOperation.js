import fs from "fs";
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