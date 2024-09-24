import { createResource } from "frappe-ui";
import { ref } from "vue";

export const apiRetrival = async () => {
    const doc = createResource({
        url: 'pwa_template.utils.get_form_meta',
        method: 'GET',
    });
    await doc.fetch();
    return doc; 
}