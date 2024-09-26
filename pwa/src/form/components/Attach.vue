<template>
    <div>
      <div class="p-2" v-if="!fileUploaded">
        <div class=" flex">
          <p class=" text-[12px] text-gray-600">{{field.label}}</p>
          <p v-if="field.reqd == 1" class=" text-[12px] text-red-500 pl-1">*</p>
        </div>
        <FileUploader
          :fileTypes="['image/*', 'application/pdf']"
          :validateFile="(fileObject) => {}"
          @success="handleFileUploadSuccess"
        >
          <template #default="{ openFileSelector, uploading, progress }">
            <Button
              @click="openFileSelector"
              :loading="uploading"
            >
              Attach {{ progress }}%
            </Button>
          </template>
        </FileUploader>
      </div>
  
      <div v-if="fileUploaded" class="p-2">
        <p class=" text-[12px] text-gray-600 mb-1">{{field.label}}</p>
        <div class="w-full h-[2rem] border-[1.5px] border-gray-200 rounded-lg">
          <div class="flex hover:cursor-pointer" @click="openDialog">
            <div class="flex">
              <FeatherIcon name="link-2" class="w-4 h-4 mt-2 ml-2 text-gray-600 hover:text-black hover:cursor-pointer"/>
              <p class="pl-2 text-[10px] p-2 truncate w-[7rem] text-gray-600">Name: {{ File.file_name }}</p>
              <p class="pl-2 text-[10px] p-2 truncate w-[5rem] text-gray-600">Size: {{ File.file_size }}</p>
              <p class="pl-2 text-[10px] p-2 truncate w-[5rem] text-gray-600">URL: {{ File.file_url }}</p>
            </div>
            <FeatherIcon name="x" class="w-4 h-4 mt-2 ml-auto mr-2 text-gray-600 hover:text-black hover:cursor-pointer" @click.stop="resetUploader"/>
          </div>
        </div>
      </div>
  
      <!-- Existing Dialog for file preview -->
      <Dialog v-model="dialogVisible" class=" z-[200]">
        <template #body-title>
          <h3 class="font-semibold truncate w-[10rem]">{{ File.file_name }}</h3>
        </template>
        <template #body-content>
          <div v-if="isImage">
            <img :src="ImageUrl" alt="Uploaded Image" class="w-52 h-52"/>
          </div>
          <div v-else-if="isPdf">
            <iframe :src="ImageUrl" class="w-full h-[500px]" frameborder="0"></iframe>
          </div>
          <div v-else>
            <p>Unsupported file type</p>
          </div>
        </template>
        <template #actions>
          <div class="w-full bg">
            <Button variant="solid" @click="openConfirmationDialog">
              Delete
            </Button>
            <Button class="ml-2" @click="dialogVisible = false">
              Close
            </Button>
          </div>
        </template>
      </Dialog>
  
      <!-- Confirmation Dialog -->
      <Dialog v-model="confirmationDialogVisible" class=" z-[210]">
        <template #body-title>
          <h3 class="font-semibold">Confirm Deletion</h3>
        </template>
        <template #body-content>
          <p>Are you sure you want to delete this {{ File.file_name }} file?</p>
        </template>
        <template #actions>
          <div class="w-full bg">
            <Button variant="solid" @click="deleteFile">
              Yes, Delete
            </Button>
            <Button class="ml-2" @click="confirmationDialogVisible = false">
              Cancel
            </Button>
          </div>
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { FileUploader, Button, FeatherIcon, Dialog, createDocumentResource, createListResource } from 'frappe-ui';
  import { reactive, ref, computed, defineProps, watch } from 'vue';
  
  const { field, frm, table, idx, idexValue, doctypeAttach } = defineProps(['field', 'frm', 'table', 'idx', 'idexValue', 'doctypeAttach'])

  const Value = ref('')

  if(idexValue >= 0){
    let values = frm.doc[table][idexValue][field.fieldname]
    Value.value = values
  }
  else{
    Value.value = field.fieldname
  }


  const File = reactive({
    content_hash: '',
    creation: '',
    docstatus: 0,
    doctype: 'File',
    file_name: '',
    file_size: 0,
    file_type: '',
    file_url: field.value,
    folder: 'Home',
    idx: 0,
    is_attachments_folder: 0,
    is_folder: 0,
    is_home_folder: 0,
    is_private: 0,
    modified: '',
    modified_by: 'Administrator',
    name: '',
    owner: 'Administrator',
    uploaded_to_dropbox: 0,
    uploaded_to_google_drive: 0,
  });
  // console.log(frm.doctype, field.fieldname, frm.name)
  // console.log(field)

  if (frm.name) {
  const values = createListResource({
    doctype: 'File',
    filters: { 
      "file_url": Value.value
    },
    fields: ["*"]
  });

  // console.log(doctypeAttach)
  values.reload()
    .then(() => {
      if (values.data.length > 0) {
        const fileData = values.data[0];
        Object.assign(File, {
          content_hash: fileData.content_hash || '',
          creation: fileData.creation || '',
          docstatus: fileData.docstatus || 0,
          doctype: fileData.doctype || 'File',
          file_name: fileData.file_name || '',
          file_size: fileData.file_size || 0,
          file_type: fileData.file_type || '',
          file_url: fileData.file_url || '',
          folder: fileData.folder || 'Home',
          idx: fileData.idx || 0,
          is_attachments_folder: fileData.is_attachments_folder || 0,
          is_folder: fileData.is_folder || 0,
          is_home_folder: fileData.is_home_folder || 0,
          is_private: fileData.is_private || 0,
          modified: fileData.modified || '',
          modified_by: fileData.modified_by || 'Administrator',
          name: fileData.name || '',
          owner: fileData.owner || 'Administrator',
          uploaded_to_dropbox: fileData.uploaded_to_dropbox || 0,
          uploaded_to_google_drive: fileData.uploaded_to_google_drive || 0,
        });
        fileUploaded.value = true;
      }
    })
    .catch(error => {
      console.error("Error loading file data:", error);
    });
}
  
  const fileUploaded = ref(false);
  const dialogVisible = ref(false);
  const confirmationDialogVisible = ref(false);
  
  const ImageUrl = computed(() => {
    if (File.file_url) {
      const url = new URL(window.location.href);
      return `${url.protocol}//${url.hostname}:8001${File.file_url}`;
    }
    return '';
  });
  
  const isImage = computed(() => File.file_type === "JPG" || File.file_type === "PNG" || File.file_type === "SVG");
  const isPdf = computed(() => File.file_type === "PDF");
  
  const handleFileUploadSuccess = (file) => {
    Object.assign(File, file);
    fileUploaded.value = true;
  };
  
  const resetUploader = () => {
    confirmationDialogVisible.value = true;
  };
  
  const openDialog = () => {
    dialogVisible.value = true;
  };
  
  const openConfirmationDialog = () => {
    confirmationDialogVisible.value = true;
  };
  
  const deleteFile = () => {
  frm.attachValues = frm.attachValues.filter(item => item.FeildName === field.fieldname);

  const deleteDoc = createDocumentResource({
    doctype: 'File',
    name: File.name,
  });

  deleteDoc.delete.submit()
    .then(() => {
      fileUploaded.value = false;
      Object.keys(File).forEach(key => {
        File[key] = '';
      });
      frm.attachValues = frm.attachValues.filter(item => item.name && item.FeildName !== field.fieldname);

      confirmationDialogVisible.value = false;
    })
    .catch(error => {
      console.error("Error deleting file:", error);
    });
};



    watch(File, (newFile) => {
      if(table){
          if(idexValue >= 0 ){
            frm.setTableValue(field.fieldname, newFile.file_url, table, idexValue)
          }
          else{
            frm.setTableValue(field.fieldname, newFile.file_url, table, idx)
          }
        } 
        else{
          frm.setValue(field.fieldname, newFile.file_url)
        }
        // frm.setValue(field.fieldname, newFile.file_url)
        frm.attachValues.push({
            "name": newFile.name,
            "FeildName": field.fieldname
        });
        if(newFile){
          if(table){
            if(idexValue >= 0 ){
              if(frm.doc[table][idexValue][field.fieldname] != field.value){
                field.value = null
                frm.Saved = 0;
                frm.Submit = 0;
                frm.Amend = 0;
              }
            }
            else{
              if(frm.doc[table][idx][field.fieldname] != field.value){
                field.value = null
                frm.Saved = 0;
                frm.Submit = 0;
                frm.Amend = 0;
              }
            }
          }
          else{
            if (frm.doc[field.fieldname] != field.value) {
                field.value = null
                frm.Saved = 0;
                frm.Submit = 0;
                frm.Amend = 0;
            }
          }
        }
    })    
  </script>
  
  <style>
  </style>
  