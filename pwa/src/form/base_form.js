import { reactive, ref, computed, watch, onMounted } from 'vue';
import EventEmitter from './eventemiitor';
import { useRouter } from 'vue-router';
import { session } from '../data/session';
import formLsit from '../../public/json/form_list.json'
import { createListResource, createResource, createDocumentResource } from 'frappe-ui';
import { retrieveFileJson } from '../utils/check';
import { apiRetrival } from '../utils/apiRetrival';

export default class Form extends EventEmitter {
  constructor(doctype, frm, name = null) {
    super();
    this.doctype = doctype;
    this.name = name;
    this.fields = reactive([]);
    this.dirty = false;
    this.Frm = frm;
    this.JSON = ref({})
    this.Docstatus = ref(0);
    this.Saved = ref(0);
    this.Submit = ref(0);
    this.Amend = ref(0);
    this.workflowStatus = ref(false)
    this.workflow_state =ref('')
    this.recordRetrieve = ref(0);
    this.roles = [];
    this.style = ref('')
    this.status = ref([])
    this.child = ref(0)
    this.DoctypeError = ref('')
    this.workflowError = ref('')
    this.router = useRouter();
    this.transition = ref([]) 
    this.username = computed(() => session.user);
    this.attachValues = reactive([]);
    this.action = ref('')
    this.data = ref({})
    this.doc = reactive({
      docstatus: 0, 
    });
    this.submitable = ref(0);

    this.on('name', (value) => {
      this.dirty = true;
    });
  }

  async initFields() {  
    const isworkflow = createListResource({
      doctype: "Workflow",
      fields: ['*'],
      filters: {
        document_type: this.doctype
      },
    })
    
    isworkflow.reload() 
    .then(() => {
      isworkflow.data.forEach(data => {
        if(data.is_active){
          this.workflowStatus = true
          const workflowValues = createResource({
            url: `frappe.desk.form.load.getdoc`, 
            method: 'GET', 
            params: {
                doctype: 'Workflow', 
                name: data.name, 
                _: Date.now()
              },
            })
          workflowValues.fetch()
          .then(() => {
            this.status = workflowValues.data.docs[0].states
            this.transition = workflowValues.data.docs[0].transitions
          })
        }
      })
    })

    const apiData = await apiRetrival()

    if(apiData.data){
      apiData.data.forEach((data) => {
        if(data.doctype_name == this.doctype){
          const pwa_fields = JSON.parse(data.pwa_form_fields)
          this.JSON = pwa_fields; 
          this.data = this.JSON;
          this.fields = this.JSON.pwa_form_fields;
          this.submitable = this.JSON.is_submittable;
          this.child = this.JSON.is_child_table;
        }
      })
    }else{
      formLsit.form_list.forEach(async (frm) => {
        if (frm.form_name === this.Frm) {
          
          const fileJson = await retrieveFileJson(frm.doctype_name);
          
          this.JSON = fileJson; 
          this.data = this.JSON;
          this.fields = this.JSON.pwa_form_fields;
          this.submitable = this.JSON.is_submittable;
          this.child = this.JSON.is_child_table;
        }
      });
    }

    
    

    // const doctype = await exportedData(this.doctype);

    this.doc = {};
    if (this.name != null) {
      const docValues = createResource({
        url: `frappe.desk.form.load.getdoc`, 
        method: 'GET', 
        params: {
          doctype: this.doctype, 
          name: this.name,
          _: Date.now()
        },
      })
      docValues.reload()
      .then(() => {
        const fetchedData = docValues.data.docs[0];
        if(docValues.data.docs[0].docstatus == 0){
          this.Docstatus = docValues.data.docs[0].docstatus;
          this.Saved = 1
        }
        else if(docValues.data.docs[0].docstatus == 1 || docValues.data.docs[0].docstatus == 2){
          this.Docstatus = docValues.data.docs[0].docstatus;
          this.Submit = 1;
          this.Saved = 1;
        }

        if(this.workflowStatus){
          this.workflow_state = docValues.data.docs[0].workflow_state
          this.styles()
          
        }
        Object.keys(fetchedData).forEach(key => {
          this.doc[key] = fetchedData[key];
        });
        this.updateFields();
      })
    }
  }

  workflow() {
    this.doc["doctype"] = this.doctype
    const workflow = createResource({
      url: `frappe.model.workflow.apply_workflow`, 
      method: 'POST', 
      params: {
        doc: this.doc, 
        action: this.action,
      },
    })

    workflow.fetch()
    .then(() => {
      Object.entries(workflow.data).forEach(([key, value]) => {
        this.doc[key] = value;
      });
      this.actions(workflow.data)
    })
  }


  actions(datas) {
    this.doc["doctype"] = this.doctype
    const workflowTransition = createResource({
      url: `frappe.model.workflow.get_transitions`, 
      method: 'POST', 
      params: {
        doc: datas
      },
    })
    workflowTransition.fetch()
    .then(() => {
      if(workflowTransition.data.length > 0){
        this.workflow_state = workflowTransition.data[0].state
        this.action = workflowTransition.data[0].action
        this.styles()
        return true
      }
      else{
        this.workflow_state = this.doc.workflow_state
        this.action = ''
        this.styles()
        return true
      }
    })
  }


  styles() {
    const Style = createListResource({
      doctype: "Workflow State",
        fields: ['style'],
        filters: {
          name: this.workflow_state
        },
    })
    Style.reload()
    .then(() => {
      this.style = Style.data[0].style
    })
  }
  


  updateFields() {
    this.fields.forEach(field => {
      if (this.doc.hasOwnProperty(field.fieldname)) {
        field.value = this.doc[field.fieldname];
      }
      if(this.workflowStatus){
        this.actions(this.doc)
      }
    });
    this.recordRetrieve = 1
  }
  
  getValue(fieldname) {
    return this.doc[fieldname] || null;
  }

  setValue(fieldname, value) {
    this.dirty = true;
    this.doc[fieldname] = value;
  }

  setTableValue(fieldname, value, table, index) {
      if (!this.doc[table]) {
        this.doc[table] = [];
      }
      if (!this.doc[table][index]) {
        this.doc[table][index] = {};
      }
      this.doc[table][index][fieldname] = value;  
  }

  removeTableVale(table, index) {
    if (Array.isArray(this.doc[table])) {
        this.doc[table].splice(index, 1);
    }
}


  

  isNew() {
    return !!this.name;
  }

  save() {
    let validate = this.validateMandatory()
    if (validate == true) {
      this.dirty = false;
      const savedoc = createListResource({
        doctype: this.doctype,
      });

      const keysToRemove = [
        'creation', 'docstatus', 'idx', 
        'modified', 'modified_by', 'owner', 'doctype'
      ];
      keysToRemove.forEach(key => {
        delete this.doc[key];
      });
      
  
      if(this.doc.name && this.Docstatus){
        let currentName = this.doc.name;
        this.doc.amended_from = currentName;
    
        let nameParts = currentName.split('-');
        let baseName = nameParts[0];
        let newIncrement = nameParts.length > 1 ? parseInt(nameParts[1]) + 1 : 1;
        this.doc.name = `${baseName}-${newIncrement}`;
      }

      if(this.doc.name){
        return savedoc.setValue.submit(this.doc)
        .then(response => {
          Object.assign(this.doc, response);
          this.Saved = 1;
          this.updateFields();
          this.name = this.doc.name;
          this.Docstatus = 0;
          this.fields.forEach(field => {
            if (field.fieldtype === 'Attach') {
              this.attachValues.forEach(item => {
                if (item.FeildName === field.fieldname) {
                  const updateFile = createListResource({
                    doctype: 'File',
                    filters: {
                      name: item.name,
                    }
                  });
                  updateFile.setValue.submit({
                    name: item.name,
                    attached_to_doctype: this.doctype,
                    attached_to_name: response.name,
                    attached_to_field: item.FeildName
                  });
                  updateFile.fetch();
                }
              });
            } else if (typeof field.value === 'object' && field.value != null) {
              field.value.forEach(childField => {
                if (childField.fieldtype === 'Attach') {
                  this.attachValues.forEach(item => {
                    if (item.FeildName === childField.fieldname) {
                      const updateFile = createListResource({
                        doctype: 'File',
                        filters: {
                          name: item.name,  
                        }
                      });
                      updateFile.setValue.submit({
                        name: item.name,
                        attached_to_doctype: this.doctype,
                        attached_to_name: response.name,
                        attached_to_field: item.FeildName
                      });
                      updateFile.fetch();
                    }
                  });
                }
              });
            }
          });
          
          return response.name;
        })
        .catch(error => {
          throw new Error('Something went wrong');
        });
      }else{
        return savedoc.insert.submit(this.doc)
        .then(response => {
          Object.assign(this.doc, response);
          this.Saved = 1;
          this.updateFields();
          this.name = this.doc.name;
          this.Docstatus = 0;
          this.fields.forEach(field => {
            if (field.fieldtype === 'Attach') {
              this.attachValues.forEach(item => {
                if (item.FeildName === field.fieldname) {
                  const updateFile = createListResource({
                    doctype: 'File',
                    filters: {
                      name: item.name,
                    }
                  });
                  updateFile.setValue.submit({
                    name: item.name,
                    attached_to_doctype: this.doctype,
                    attached_to_name: response.name,
                    attached_to_field: item.FeildName
                  });
                  updateFile.fetch();
                }
              });
            } else if (typeof field.value === 'object' && field.value != null) {
              field.value.forEach(childField => {
                if (childField.fieldtype === 'Attach') {
                  this.attachValues.forEach(item => {
                    if (item.FeildName === childField.fieldname) {
                      const updateFile = createListResource({
                        doctype: 'File',
                        filters: {
                          name: item.name,  
                        }
                      });
                      updateFile.setValue.submit({
                        name: item.name,
                        attached_to_doctype: this.doctype,
                        attached_to_name: response.name,
                        attached_to_field: item.FeildName
                      });
                      updateFile.fetch();
                    }
                  });
                }
              });
            }
          });
          
          return response.name;
        })
        .catch(error => {
          throw new Error('Something went wrong');
        });
      }
    } else {
      return validate
    }
  }

  update() {
    const docCopy = { ...this.doc };
    delete docCopy.modified_by;
    delete docCopy.modified;

    const update = createListResource({
      doctype: this.doctype,
      filters: {
        name: this.name,
      }
    });
    
    update.setValue.submit(docCopy)
      .then(() => this.Saved = 1);
  }
  
  
  submit(name) {
    let validate = this.validateMandatory()
    if (validate == true) {
      this.dirty = false;
      const submitdoc = createListResource({
        doctype: this.doctype,
        filters: {
          name: name,
        }
      });
  
      return submitdoc.reload()
        .then(() => submitdoc.setValue.submit({
          name: name,
          docstatus:1,
        }))
        .then(response => {
          this.Docstatus = 1;
          this.Submit = 1;
          return response.docstatus;
        })
        .catch(error => {
          console.log(error);
          throw new Error('Something went wrong');
        });
    } else {
      return validate ;
    }
  }
  


  delete(name){
    const val = ref('')
    const deletedoc = createDocumentResource(
      {
        doctype: this.doctype,
        name: name,   
      }
    )
    return deletedoc.delete.submit()
    .then(response => {
      val.value = 'Document Deleted successfully';
      return val.value; 
    })
    .catch(error => {
      console.error(error);
      val.value = 'Error deleting document';
      return val.value;
    });
  }
  
  cancel(name) {
    this.dirty = false;
      const submitdoc = createListResource({
        doctype: this.doctype,
        filters: {
          name: name,
        }
      });
  
      return submitdoc.reload()
        .then(() => submitdoc.setValue.submit({
          name: name,
          docstatus:2,
        }))
        .then(response => {
          this.Docstatus = 2;
          return response.docstatus;
        })
        .catch(error => {
          console.log(error);
          throw new Error('Error Canceling document');
        });
    }
  
    async amend() {
      const keysToRemove = [
        'creation', 'docstatus', 'idx', 
        'modified', 'modified_by', 'owner', 'doctype'
      ];
    
      keysToRemove.forEach(key => {
        delete this.doc[key];
      });


    
      const deletedoc = createDocumentResource({
        doctype: this.doctype,
        name: this.name,
      });
    
      try {
        this.Docstatus = 0;
        this.Saved = 0;
        this.router.push({
          name: 'Form',
          query: {
            frmname: this.Frm,
            doctype: this.doctype,
          }
        });
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
  isDirty() {
    return this.dirty;
  }

  validateMandatory() {
    const error = ref([])
    for (let field of this.fields) {
      if (field.reqd && !this.doc[field.fieldname]) {
        error.value.push( `Error: value missing for ${this.doctype}: ${field.label}`)
      }
    }
    if(error.value.length > 0) {
      return error.value
    }else{
      return true
    }
  }
}