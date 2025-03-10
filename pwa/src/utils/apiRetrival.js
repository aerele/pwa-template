import { createResource, createListResource } from "frappe-ui";
import { ref } from "vue";

export const apiRetrival = async () => {
    const doc = createListResource({
        doctype: 'PWA Form',
        fields: ['*']
    });
    
    await doc.reload();
    return doc;
}

export const apiDashboardRetrival = async () => {
    const doc = createListResource({
        doctype: 'PWA Dashboard',
        fields: ['*']
    });
    
    await doc.reload();
    return doc;
}
