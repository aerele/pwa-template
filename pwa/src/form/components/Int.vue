<template>
  <div class="p-2">
    <div class=" flex">
      <p class=" text-[12px] text-gray-600">{{field.label}}</p>
      <p v-if="field.reqd == 1" class=" text-[12px] text-red-500 pl-1">*</p>
    </div>
    <TextInput
      :type="'number'"
      size="sm"
      variant="subtle"
      :placeholder="field.label"
      :disabled="isDisabled"
      v-model="value"
      class=" mt-1"
    />
  </div>
</template>

<script setup>
import { TextInput } from 'frappe-ui'
import { defineProps, watch, ref, computed } from 'vue'

// const { field, frm } = defineProps(['field', 'frm'])
const { field, frm, table, idx, idexValue } = defineProps(['field', 'frm', 'table', 'idx', 'idexValue'])


const value = ref('')

const isDisabled = computed(() => {
  return field.read_only == 1 || frm.Docstatus == 1 || frm.Docstatus == 2
})

watch(value, (newValue) => {
  const intValue = parseInt(newValue, 10)
  if(table){
    if(idexValue >= 0 ){
      frm.setTableValue(field.fieldname, isNaN(intValue) ? '' : intValue, table, idexValue)
    }
    else{
      frm.setTableValue(field.fieldname, isNaN(intValue) ? '' : intValue, table, idx)
    }
  } 
  else{
    frm.setValue(field.fieldname, isNaN(intValue) ? '' : intValue)
  } 
  // frm.setValue(field.fieldname, isNaN(intValue) ? '' : intValue)
  if(newValue){
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

if(idexValue >= 0){
  let values = frm.doc[table][idexValue][field.fieldname]
  value.value = values
}

watch(frm, (newFrm) => {
  if (field.value) {
    value.value = field.value
  }
  
})
</script>
