<template>
  <div class="p-2">
    <div class=" flex">
      <p class=" text-[12px] text-gray-600">{{field.label}}</p>
      <p v-if="field.reqd == 1" class=" text-[12px] text-red-500 pl-1">*</p>
    </div>
    <TextInput
      type="text"
      size="sm"
      variant="subtle"
      :placeholder="field.label"
      :disabled="isDisabled"
      v-model="value"
      @blur="formatValue"
      class=" mt-1"
    />
  </div>
</template>

<script setup>
import { TextInput } from 'frappe-ui'
import { defineProps, ref, watch, computed, onMounted } from 'vue'

// const { field, frm } = defineProps(['field', 'frm'])
const { field, frm, table, idx, idexValue } = defineProps(['field', 'frm', 'table', 'idx', 'idexValue'])


const value = ref("")

const isDisabled = computed(() => {
  return field.read_only == 1 || frm.Docstatus == 1 || frm.Docstatus == 2
})


onMounted(() => {
  let retrivedValue
  if(idexValue >= 0){
    retrivedValue = frm.doc[table][idexValue][field.fieldname]
  }
  else{
    retrivedValue = field.value
  }

  if (retrivedValue !== undefined && retrivedValue !== null) {
    const floatValue = parseFloat(retrivedValue)
    if (!isNaN(floatValue)) {
      value.value = floatValue.toFixed(3)
    }
  }
})

watch(value, (newValue) => {
  const floatValue = parseInt(newValue)
  if (!isNaN(floatValue)) {
    if(table){
      if(idexValue >= 0 ){
        frm.setTableValue(field.fieldname, floatValue, table, idexValue)
      }
      else{
        frm.setTableValue(field.fieldname, floatValue, table, idx)
      }
    } 
    else{
      frm.setValue(field.fieldname, floatValue)
    } 
    // frm.setValue(field.fieldname, floatValue.toFixed(3))
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
})

// Format value on blur
const formatValue = () => {
  if (value.value !== "") {
    const floatValue = parseFloat(value.value)
    if (!isNaN(floatValue)) {
      value.value = floatValue.toFixed(3)
    }
  }
}

// Update value from form when saved
watch(frm, (newFrm) => {
  if (field.value) {
    const floatValue = parseFloat(field.value)
    if (!isNaN(floatValue)) {
      value.value = floatValue.toFixed(3)
    }
  }
})
</script>
