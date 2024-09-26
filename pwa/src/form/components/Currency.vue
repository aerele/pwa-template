<template>
  <div class="p-2">
    <div class=" flex">
      <p class=" text-[12px] text-gray-600">{{field.label}}</p>
      <p v-if="field.reqd == 1" class=" text-[12px] text-red-500 pl-1">*</p>
    </div>
    <FormControl
      :type="'text'"
      size="sm"
      variant="subtle"
      :placeholder="field.label"
      :disabled="isDisabled"
      v-model="displayValue"
      @input="validateInput"
    />
  </div>
</template>

<script setup>
import { FormControl, createListResource } from 'frappe-ui';
import { defineProps, watch, ref, computed, onMounted } from 'vue';

const { field, frm, table, idx, idexValue } = defineProps(['field', 'frm', 'table', 'idx', 'idexValue'])


const value = ref('');  
const displayValue = ref("");  
const fetchedOptions = ref([]); 

const isDisabled = computed(() => {
  return field.read_only == 1 || frm.Docstatus == 1 || frm.Docstatus == 2;
});

const fetchOptions = async () => {
  const currency = createListResource({
    doctype: 'Company',
    fields: ['default_currency'],
    orderBy: 'creation desc',
  });

  await currency.reload();
  const dataArray = currency.data;
  if (dataArray.length > 0) {
    for (const data of dataArray) {
      const symbol = createListResource({
        doctype: 'Currency',
        fields: ['symbol'],
        filters: {
          name: data.default_currency,
        },
        orderBy: 'creation desc',
      });
      await symbol.reload();
      const symbolValue = symbol.data;
      if (symbolValue.length > 0) {
        fetchedOptions.value.push(symbolValue[0].symbol);
      }
      if (idexValue >= 0) {
        let values = frm.doc[table][idexValue][field.fieldname];
        const symbol = fetchedOptions.value.length > 0 ? fetchedOptions.value[0] : '';
        displayValue.value = `${symbol}${values}`;
      }
    }
  }
};

watch(frm, (newFrm) => {
  if (field.value) {
    if(field.value == null){
      displayValue.value = null;
      value.value = 0;
    }
    else{
      displayValue.value = field.value;
      value.value = field.value;
    }
    const symbol = fetchedOptions.value.length > 0 ? fetchedOptions.value[0] : '';
    displayValue.value = `${symbol}${value.value}`;
  }
});


watch(displayValue, (newValue) => {
  let numericValue = newValue.replace(/[^0-9]/g, ''); 
  value.value = numericValue;
  const symbol = fetchedOptions.value.length > 0 ? fetchedOptions.value[0] : '';
  const valueWithSymbol = symbol + numericValue;
  numericValue = parseInt(numericValue)
  if(table){
    if(idexValue >= 0 ){
      frm.setTableValue(field.fieldname, numericValue, table, idexValue)
    }
    else{
      frm.setTableValue(field.fieldname, numericValue, table, idx)
    }
  } 
  else{
    frm.setValue(field.fieldname, numericValue)
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

const validateInput = (event) => {
  const input = event.target.value;
  const numericValue = input.replace(/[^0-9]/g, '');
  value.value = numericValue;
  const symbol = fetchedOptions.value.length > 0 ? fetchedOptions.value[0] : '';
  displayValue.value = `${symbol}${numericValue}`;
};

onMounted(() => {
  fetchOptions();
});
</script>
