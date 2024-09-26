<template>
    <div class="p-2 border-2 border-gray-300 rounded-md mb-4">
      <h1 class="font-semibold text-gray-600 mb-2">{{ field.label }}</h1>
      <div>
        <component
          v-for="field in sectionFields"
          :key="field.fieldname"
          :is="fieldMap[field.fieldtype]"
          :field="field"
          :frm="frm"
        ></component>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, computed } from 'vue'
  import Text from './Text.vue'
  import Select from './Select.vue'
  import Badge from './Badge.vue'
  import Int from './Int.vue'
  import DateTime from './DateTime.vue'
  import Autocomplete from './Autocomplete.vue'
  import Date from './Date.vue'
  import Checkbox from './Checkbox.vue'
  import Textarea from './Textarea.vue'
  import Float from './Float.vue'
  import Link from './Link.vue'
  import Currency from './Currency.vue'
  import Childtable from './Childtable.vue'
  
  const { field, frm } = defineProps(['field', 'frm'])
  
  const fieldMap = {
    Data: Text,
    Select: Select,
    Int: Int,
    Autocomplete: Autocomplete,
    Dynamic_Link: Select,
    Heading: Badge,
    Datetime: DateTime,
    'Section Break': null,
    Date: Date,
    Check : Checkbox,
    Text: Text,
    'Long Text': Textarea,
    'Small Text': Textarea,
    Float: Float,
    Link: Link,
    Currency: Currency,
    Table: Childtable,
  }
  
  const sectionFields = computed(() => {
    const fields = frm.fields
    const index = fields.indexOf(field)
    const sectionFields = []
  
    for (let i = index + 1; i < fields.length; i++) {
      if (fields[i].fieldtype === 'Section Break') break
      sectionFields.push(fields[i])
    }
  
    return sectionFields
  })
  </script>
  