<template>
  <div class="p-2">
    <div class=" flex">
      <p class=" text-[12px] text-gray-600">{{field.label}}</p>
      <p v-if="field.reqd == 1" class=" text-[12px] text-red-500 pl-1">*</p>
    </div>
    <div class="relative w-full mt-1">
      <FormControl
        :type="'text'"
        size="sm"
        variant="subtle"
        :placeholder="field.label"
        :disabled="isDisabled"
        v-model="inputValue"
        @focus="showDropdown = true"
        class="flex-grow w-full pt-[3px]"
      >
      </FormControl>
      <div
        v-if="showDropdown"
        class="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-20 max-h-48 overflow-y-auto no-scrollbar"
      >
        <div
          v-if="options.length > 0"
          v-for="option in options"
          :key="option.name"
          class="p-2 hover:bg-gray-200 cursor-pointer"
          @click="selectOption(option)"
        >
          {{ option.doctype_name }}
        </div>
        <div
          v-else
          class="p-2 hover:bg-gray-200 cursor-pointer text-[12px] text-gray-600"
        >
          No Record Found
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { FormControl, createResource } from "frappe-ui";
import { defineProps } from 'vue';


const { field, frm, table, idx, idexValue } = defineProps(['field', 'frm', 'table', 'idx', 'idexValue'])


const inputValue = ref('');
const showDropdown = ref(false);
const options = ref([]);

watch(frm, (newFrm) => {
  if(field.value){
    inputValue.value = field.value
  }
})

if(idexValue >= 0){
  let values = frm.doc[table][idexValue][field.fieldname]
  inputValue.value = values
}

const isDisabled = computed(() => {
  return field.read_only == 1 || frm.Docstatus == 1 || frm.Docstatus == 2;
});

const selectOption = (option) => {
  inputValue.value = option.doctype_name;
  if(table){
    if(idexValue >= 0 ){
      frm.setTableValue(field.fieldname, option.name, table, idexValue)
    }
    else{
      frm.setTableValue(field.fieldname, option.name, table, idx)
    }
  } 
  else{
    frm.setValue(field.fieldname, option.name)
  }
  if(option.name){
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
  showDropdown.value = false;
};

const loadOptions = (query = '') => {
  const opt = createResource({
    url: 'frappe.desk.search.search_link',
    method: 'POST',
    params: {
      doctype: field.options,
      ignore_user_permissions: 0,
      page_length: 10,
      reference_doctype: frm.doctype,
      txt: query,
    },
  });

  opt.fetch().then(() => {
    const data = opt.data;
    if (data) {
      options.value = data.map(row => ({
        name: row.value,
        doctype_name: row.value,
      }));
    } else {
      options.value = [];
    }
  });
};

watch(inputValue, (newValue) => {
  loadOptions(newValue);
});

onMounted(() => {
  loadOptions();
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!target.closest('.relative')) {
    showDropdown.value = false;
  }
});
</script>
<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.touchable {
  cursor: pointer;
}
</style>
