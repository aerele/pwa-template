<template>
  <div class="p-2">
    <div class=" flex">
      <p class=" text-[12px] text-gray-600">{{field.label}}</p>
      <p v-if="field.reqd == 1" class=" text-[12px] text-red-500 pl-1">*</p>
    </div>
    <Autocomplete
      class=" mt-1"
      :options="typeof field.options === 'string' ? field.options.split('\n') : field.options"
      v-model="Value"
      size="sm"
      variant="subtle"
      :label="field.label"
      :placeholder="field.label"
      :disabled="isDisabled"
      hide-search="true"
    />
  </div>
</template>

<script setup>
import { Autocomplete } from 'frappe-ui'
import { defineProps, computed, watch, ref } from 'vue'
const { field, frm, table, idx, idexValue } = defineProps(['field', 'frm', 'table', 'idx', 'idexValue'])

const Value = ref('')

const isDisabled = computed(() => {
  return field.read_only == 1 || frm.Docstatus == 1 || frm.Docstatus == 2
})

if(idexValue >= 0){
  let values = frm.doc[table][idexValue][field.fieldname]
  Value.value = values
}

watch(frm, (newFrm) => {
  if(field.value){
    Value.value = field.value
  }
})

watch(() => Value.value, (newValue) => {
  const finalValue = newValue?.value ?? newValue;
  Value.value = finalValue
  if(table){
    if(idexValue >= 0 ){
      frm.setTableValue(field.fieldname, finalValue, table, idexValue)
    }
    else{
      frm.setTableValue(field.fieldname, finalValue, table, idx)
    }
  } 
  else{
    frm.setValue(field.fieldname, finalValue)
  }
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
});
</script>
