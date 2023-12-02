import xss from 'xss'  
const checkXSS = (dataObject) => {
    try {
        if (Array.isArray(dataObject)) {
            if (Object.keys(dataObject).length > 0 && typeof dataObject[0] === 'object') {
                dataObject.forEach((obj) => {
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            let objectJson = objectToJSONString(obj[key]);
                            if (objectJson) {
                                let jsonString = xss(objectJson);
                                let jsonObject = JSONStringToObject(jsonString);
                                if (jsonObject) {
                                    obj[key] = jsonObject;
                                }
                            }
                        }
                    }
                }); 
                return dataObject;
            }
        } else if (typeof dataObject === 'object') {
            let objectJson = objectToJSONString(dataObject);
            if (objectJson) {
                let jsonString = xss(objectJson);
                let jsonObject = JSONStringToObject(jsonString);
                if (jsonObject) { 
                    return jsonObject;
                }
            }
        } else if (typeof dataObject === 'string' || dataObject instanceof String) { 
            return xss(dataObject);
        } 
        return dataObject;
    } catch (error) { 
        return dataObject;
    }
};

function objectToJSONString(dataObject) {
    try {
        return JSON.stringify(dataObject);
    } catch (error) {
        return false;
    }
}

function JSONStringToObject(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return false;
    }
}

export default checkXSS;
