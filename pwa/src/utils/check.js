import { createListResource } from "frappe-ui";

export const retrieveDoc = async (name_doctype) => {
    try {
        const doc = createListResource({
            doctype: name_doctype,
            fields: ['name'],
        });
        await doc.reload();
        return { success: doc }; 
    } catch (error) {
        const errorMessage = error.message || "An error occurred";
        return { error: errorMessage }; 
    }
};

export const retrieveFileJson = async (doctypeName) => {
    const jsonModules = import.meta.glob('../../public/json/*.json');

    const jsonFiles = {};
    for (const path in jsonModules) {
        const module = await jsonModules[path]();
        if (module.default && module.default.doctype_name) {
            jsonFiles[module.default.doctype_name] = module.default;
        } else {
            const firstKey = Object.keys(module.default)[0];
            jsonFiles[firstKey] = module.default;
        }
    }
    return doctypeName ? jsonFiles[doctypeName] : '';
};
