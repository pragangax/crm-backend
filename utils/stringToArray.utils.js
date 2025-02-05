import { ServerError } from "./customErrorHandler.utils.js"

// function is used to convert coma separated strings of ids to array of ids
export const stringToArray = (css = "")=>{
    if(typeof css != 'string') throw new ServerError('Invalid input to stringToArray function');
    if(css == "") return [];
    const arrayOfIds = css.split(',').filter((item)=>item!='').map((item) => item.trim());
    return arrayOfIds
}

//this takes the object modifies the provided fields from string of ids to array of ids
export const parseRefIds = ({ data, fields }) => {
    if (!data || !fields) {
        throw new ServerError("Insufficient input to parseRefIds function");
    }

    if (!Array.isArray(fields)) {
        throw new ServerError("Invalid input: 'fields' must be an array");
    }

    if (typeof data !== "object" || data === null) {
        throw new ServerError("Invalid input: 'data' must be a non-null object");
    }

    Object.keys(data).forEach((key) => {
        if (fields.includes(key)) {
            data[key] = stringToArray(data[key]);
        }
    });
    console.log("string to array utils output : ", data)
    return data;
};
