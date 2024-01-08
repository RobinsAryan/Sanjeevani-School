import fs from "fs";
import jimp from 'jimp';
import sharp from "sharp";

/**
 * 
 * @param {string} path Path of file to Delete
 * @returns true/false deleted or not
 */
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


/**
 * 
 * @param {string} filePath Path of Fileq
 * @returns next or null
 */

export const compressAndOverwrite = async (filePath) => {//webp not supports
    try {
        jimp.read(`./static${filePath}`, (err, lenna) => {
            if (err) { console.log(err); return; }
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


/**
 * 
 * @param {string} filePath Path of image
 * @param {number} height Height of Image
 * @param {number} width Width of Image
 * @param {number} quality Quality of Image [0,100]
 * @returns 
 */
export const resizeImages = async (filePath, height, width, quality) => {
    try {
        jimp.read(`./static${filePath}`, (err, image) => {
            if (err) { console.log(err); return; }
            image
                .rotate(0)
                .resize(width, height)
                .quality(quality)
                .write(`./static/compressed/${filePath}`);
        });
    } catch (err) {
        return null;
    }
}



export const interlanceImage = (filePath) => {
    const imagePath = `./static${filePath}`;
    sharp(imagePath)
        .png({ interlace: true })
        .toBuffer((err, data) => {
            if (err) {
                console.error(err);
            } else {
                fs.rm(imagePath, () => {
                    sharp(data).toFile(imagePath, (saveErr, info) => {
                        if (saveErr) {
                            console.error(saveErr);
                        } else {
                            console.log('Interlaced Image saved successfully:', info);
                        }
                    });
                })
            }
        });
}



import { createCanvas, loadImage } from 'canvas'

/**
 * 
 * @param {object} cardData Information of Card
 * @param {object} studentData Information of Student used in cardData
 * @returns 
 */
export const createIdCard = (cardData, studentData) => {
    try {
        loadImage(`./static${cardData.baseImg}`).then(async (image) => {
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            let mapdata = {};
            for (let key in studentData) {
                if (key == 'profile') {
                    mapdata[key] = {
                        type: 'img',
                        val: studentData[key]
                    }
                } else {
                    mapdata[key] = {
                        type: 'text',
                        val: studentData[key]
                    }
                }
            }
            if (!('profile' in studentData)) {
                mapdata['profile'] = {
                    type: 'img',
                    val: '/img/me.jpg'
                }
            }
            let finalPaints = JSON.parse(cardData.desc);
            finalPaints.forEach(async (object) => {
                let val = mapdata[object.property];
                if (val.type == 'img') {
                    let img = await loadImage(`./static${val.val}`);
                    let height = Math.abs(object.y1 - object.y2);
                    let width = Math.abs(object.x1 - object.x2);
                    ctx.drawImage(img, Math.min(object.x1, object.x2), Math.min(object.y1, object.y2), width, height)
                } else if (val.type == 'text') {
                    if (object.fontSize == 'auto')
                        ctx.font = `${Math.abs(object.y1 - object.y2)}px ${object.fontFamily}`;
                    else
                        ctx.font = `${object.fontSize}px ${object.fontFamily}`;
                    ctx.fillText(val.val, Math.min(object.x1, object.x2), Math.max(object.y1, object.y2));
                }
            })
            const fileName = `${studentData.rid}_id_new_card.png`;
            const output = fs.createWriteStream(`./static/cards/${fileName}`);
            const stream = canvas.createPNGStream();
            stream.pipe(output);
            return true;
        }).catch(err => {
            createLog(req.user, 'In fileOperation-> createidCard during creating id cards:' + err, 'error');
            return false;
        })
    } catch (err) {
        createLog(req.user, 'In fileOperation-> createidCard during creating id cards:' + err, 'error');
        return false;
    }
}