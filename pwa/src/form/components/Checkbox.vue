<template>
  <div class="p-3">
    <div class=" flex">
      <Checkbox
      v-model="fieldValue"
      size="sm"
      :label="field.label"
      :disabled="isDisabled"
      />
      <p v-if="props.field.reqd == 1" class=" text-[12px] text-red-500 pl-1">*</p>
    </div>
    </div>
</template>

<script setup>
import { Checkbox } from 'frappe-ui'
import { defineProps, ref, watch, computed, onMounted } from 'vue'

const props = defineProps({
  field: Object,
  frm: Object,
  idexValue: Number,
  table: String,
  idx: Number,
})

const fieldValue = ref(false)

const isDisabled = computed(() => {
  return props.field.read_only == 1 || props.frm.Docstatus == 1 || props.frm.Docstatus == 2
})

watch(props.field, (newValue) => {
  if(newValue.value){
    fieldValue.value = true
  }else{
    fieldValue.value = false
  }
})


watch(fieldValue, (newValue) => {
  if(newValue){
    newValue = 1
  }else{
    newValue = 0
  }
  if(props.table){
    if(props.idexValue >= 0 ){
      props.frm.setTableValue(props.field.fieldname, newValue, props.table, props.idexValue)
    }
    else{
      props.frm.setTableValue(props.field.fieldname, newValue, props.table, props.idx)
    }
  } 
  else{
    props.frm.setValue(props.field.fieldname, newValue) 
  } 

  if(newValue){
    if(props.table){
      if(props.idexValue >= 0 ){
        if(props.frm.doc[props.table][props.idexValue][props.field.fieldname] != props.field.value){
          props.field.value = null
          props.frm.Saved = 0;
          props.frm.Submit = 0;
          props.frm.Amend = 0;
        }
      }
      else{
        if(props.frm.doc[props.table][props.idx][props.field.fieldname] != props.field.value){
          props.field.value = null
          props.frm.Saved = 0;
          props.frm.Submit = 0;
          props.frm.Amend = 0;
        }
      }
    }
    else{
      if (props.frm.doc[props.field.fieldname] != props.field.value) {
          props.field.value = null
          props.frm.Saved = 0;
          props.frm.Submit = 0;
          props.frm.Amend = 0;
      }
    }
  }
})

watch(() => props.frm, (newFrm) => {
  if (props.field.value === 0) {
    fieldValue.value = false
  } else if(props.field.value === 1) {
    fieldValue.value = true 
  }
  else{
    fieldValue.value = false
  }
}, { immediate: true })

if(props.idexValue >= 0){
  let values = props.frm.doc[props.table][props.idexValue][props.field.fieldname]
  if(values === 0){
    fieldValue.value = false
  }
  else{
    fieldValue.value = true
  }
}

onMounted(() => {
  if (props.field.value) {
    fieldValue.value = props.field.value
  }
})
</script>
