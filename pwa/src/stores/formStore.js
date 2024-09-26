import { defineStore } from 'pinia'
import { reactive } from 'vue'
import Form from '../form/base_form.js'

export const useFormStore = defineStore('form', {
  state: () => ({
    form: reactive(new Form("Sampel"))
  }),
  actions: {
    async initForm() {
      await this.form.initFields();
    },
    setForm(newForm) {
      this.form = reactive(newForm);
    }
  }
});

export const landingPage = defineStore('landingPage', {
  state: () => ({     
    links: [],                
    options: [],     
  }),
  actions: {
    setLinks(newLinks) {
      this.links = newLinks;
    },
    setOptions(newOptions) {
      this.options = newOptions;
    },
  }
});

export const listPage = defineStore('listPage', {
  state: () => ({     
    reports : [],    
  }),
  actions: {
    setReport(newReport) {
      this.reports = newReport;
    },
  }
})