<template>
  <div class="p-2">
    <div class=" flex">
      <p class=" text-[12px] text-gray-600">{{field.label}}</p>
      <p v-if="field.reqd == 1" class=" text-[12px] text-red-500 pl-1">*</p>
    </div>
    <FormControl
      v-model="value"
      :type="'date'"
      size="sm"
      variant="subtle"
      :placeholder="field.label"
      :disabled="isDisabled"
    />
  </div>
</template>

<script setup>
import { FormControl } from 'frappe-ui'
import { defineProps, ref, computed, watch } from 'vue'

const { field, frm, table, idx, idexValue } = defineProps(['field', 'frm', 'table', 'idx', 'idexValue'])


const value = ref(field.value || '')

const isDisabled = computed(() => {
  return field.read_only == 1 || frm.Docstatus == 1 || frm.Docstatus == 2
})

if(idexValue >= 0){
  let values = frm.doc[table][idexValue][field.fieldname]
  value.value = values
}

watch(value, (newValue) => {
  if(table){
    if(idexValue >= 0 ){
      frm.setTableValue(field.fieldname, newValue, table, idexValue)
    }
    else{
      frm.setTableValue(field.fieldname, newValue, table, idx)
    }
  } 
  else{
    frm.setValue(field.fieldname, newValue)
  } 
  // frm.setValue(field.fieldname, newValue)
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
</script>
