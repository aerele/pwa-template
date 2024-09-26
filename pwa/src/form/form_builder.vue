<template>
  <div class="w-full sm:w-96 bg-white flex justify-center h-screen">
    <div class="w-full flex flex-col">
      <div class="w-full sm:w-96 bg-white h-14 shadow-lg fixed top-0 z-10">
        <div class="p-2 flex pt-3">
          <div></div>
          <FeatherIcon class="w-8 h-8 text-gray-600 hover:text-black" name="chevron-left" @click="goBack" />
          <p class="font-semibold w-fit text-xl pt-[8px] pr-2">{{ frm.doctype }}</p>
          <div :class="statusClass">
            <p :class="statusTextClass">{{ statusText }}</p>
          </div>
          <div class="w-full flex justify-end">
            <div class="p-1 pr-4">
              <FeatherIcon class="w-6 h-6 text-gray-600 hover:text-black" name="bell" />
            </div>
            <User />
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar pt-20 pb-14 p-2 bg-gray-200">
        <div class=" p-2 bg-white rounded-lg">
          <component
            v-for="field in filteredFields"
            :key="field.fieldname"
            :is="fieldMap[field.fieldtype]"
            :field="field"
            :frm="frm"
          ></component>
        </div>
      </div>

      <div class="flex w-full sm:w-96 pb-1 pt-1 fixed bottom-0 z-10 bg-white shadow-lg justify-center">
        <div class="pt-1 w-[20rem] sm:w-[20rem] ml-3">
          <Button
            v-if="props.frm.Saved == 0"
            :variant="'solid'"
            theme="gray"
            size="sm"
            label="Save"
            :loading="loading"
            :loadingText="'Saving...'"
            :disabled="false"
            :link="null"
            class="w-full h-full p-2 "
            @click="handleSave"
          />
          <Button
            v-else-if="docStatus === 1 && !showSubmitButton"
            :variant="'outline'"
            theme="gray"
            size="sm"
            label="Cancel"
            :loading="loading"
            :loadingText="'Cancelling...'"
            :disabled="false"
            :link="null"
            class="w-full h-full p-2 "
            @click="handleCancel"
          />
          <Button
            v-else
            :variant="'solid'"
            theme="gray"
            size="sm"
            label="Submit"
            :loading="loading"
            :loadingText="'Submitting...'"
            :disabled="false"
            :link="null"
            class="w-full h-full p-2 "
            @click="handleSubmit"
          />
          <div v-if="saveResult" 
               :class="['fixed bottom-[4rem] leading-5 pr-[65rem] pl-[2.5rem] z-50 w-full sm:w-96', saveSuccess ? 'animate-slide-in' : 'animate-slide-out']">
            <div class="rounded w-[20rem] h-fit p-2 text-left"
                 :class="{'bg-blue-200 text-blue-500': saveSuccess, 'bg-red-200 text-red-500': !saveSuccess}">
              <FeatherIcon v-if="saveSuccess" name="check" class="inline w-4 h-4 mr-2" />
              <FeatherIcon v-else name="x" class="inline w-4 h-4 mr-2" />
              {{ saveResult }}
            </div>
          </div>
          <div v-if="deletedMessage" 
               class="fixed bottom-[4rem] leading-5 pr-[65rem] pl-[2.5rem] z-50 w-full sm:w-96 animate-slide-in">
            <div class="rounded w-[20rem] h-fit p-2 text-left bg-blue-200 text-blue-500">
              <FeatherIcon name="info" class="inline w-4 h-4 mr-2" />
              {{ deletedMessage }}
            </div>
          </div>
        </div>
        <div class="p-2 pr-2 pt-[5px]">
          <Dropdown :options="dropdownOptions">
            <Button>
              <template #icon>
                <FeatherIcon
                  name="more-vertical"
                  class="h-6 w-6 text-gray-600 hover:text-black"
                />
              </template>
            </Button>
          </Dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, ref, h, watch } from 'vue';
import Text from './components/Text.vue';
import Select from './components/Select.vue';
import Badge from './components/Badge.vue';
import Int from './components/Int.vue';
import DateTime from './components/DateTime.vue';
import Autocomplete from './components/Autocomplete.vue';
import SectionBreak from './components/SectionBreak.vue';
import Date from './components/Date.vue';
import Checkbox from './components/Checkbox.vue';
import Textarea from './components/Textarea.vue';
import Float from './components/Float.vue';
import Link from './components/Link.vue';
import User from './components/User.vue';
import Currency from './components/Currency.vue';
import Attach from './components/Attach.vue';
import Childtable from './components/Childtable.vue';
import { useRouter } from 'vue-router';
import { FeatherIcon, Avatar, Dropdown, Button } from 'frappe-ui';

const props = defineProps({
  frm: Object,
  doctype: String,
  frnname: String,
});

const fieldMap = {
  Data: Text,
  Select: Select,
  Int: Int,
  Autocomplete: Autocomplete,
  Dynamic_Link: Select,
  Heading: Badge,
  Datetime: DateTime,
  Date: Date,
  'Section Break': SectionBreak,
  Check: Checkbox,
  Text: Text,
  'Long Text': Textarea,
  'Small Text': Textarea,
  Float: Float,
  Link: Link,
  Currency: Currency,
  Attach: Attach,
  Table: Childtable
};

const loading = ref(false);
const saveResult = ref('');
const saveSuccess = ref(false);
const submitable = ref(0);
const showSubmitButton = ref(false);
const docName = ref('');
const docStatus = ref(0);
const formAfterSave = ref({})

props.frm.doctype = props.doctype
props.frm.Frm = props.frnname



watch(docStatus, (newStatus) => {
  if (newStatus === 1) {
    showSubmitButton.value = false;
  }
});

const handleSave = async () => {
  loading.value = true;
  submitable.value = props.frm.submitable;
  try {
    const name = await props.frm.save(); 
    docName.value = name;
    saveResult.value = 'Save successful!';
    saveSuccess.value = true;
    if (submitable.value === 1) {
      showSubmitButton.value = true;
    }
    formAfterSave.value = props.frm.doc;
    router.push({ path: '/showform', query: { docname: name, frmname: props.frm.Frm, doctype: props.frm.doctype } });
  } catch (error) {
    saveResult.value = `Error: ${error.message}`;
    saveSuccess.value = false;
    console.error(`Error: ${error.message}`);
  } finally {
    loading.value = false;
    setTimeout(() => { saveResult.value = ''; }, 2500);
  }
};


const handleSubmit = async () => {
  loading.value = true;
  try {
    docStatus.value = await props.frm.submit(docName.value);
    saveResult.value = 'Submit successful!';
    saveSuccess.value = true;
  } catch (error) {
    saveResult.value = `Error: ${error.message}`;
    saveSuccess.value = false;
    console.error(`Error: ${error.message}`);
  } finally {
    loading.value = false;
    setTimeout(() => { saveResult.value = ''; }, 2500);
  }
};

const handleCancel = async () => {
  console.log(docStatus.value)
};

const filteredFields = computed(() => {
  const result = [];
  let sectionCount = 0;
  for (const field of props.frm.fields) {
    if (field.fieldtype === 'Section Break') {
      sectionCount += 1;
      result.push(field);
    } else if (sectionCount === 0) {
      result.push(field);
    }
  }
  return result;
});

const statusText = computed(() => {
  if (props.frm.Saved === 0) {
    return 'Not Saved';
  } else if (props.frm.Saved === 1) {
    if (props.frm.submitable === 1 && docStatus.value !== 1) {
      return 'Draft';
    } else if (docStatus.value === 1) {
      return 'Submitted';
    } else {
      return 'Saved';
    }
  }
});

const statusClass = computed(() => {
  if (props.frm.Saved === 0) {
    return 'bg-red-200 h-[2rem] rounded-2xl text-center';
  } else if (props.frm.Saved === 1) {
    if (props.frm.submitable === 1 && docStatus.value !== 1) {
      return 'bg-red-200 h-[2rem] rounded-2xl text-center';
    } else if (docStatus.value === 1) {
      return 'bg-green-200 h-[2rem] rounded-2xl text-center';
    } else {
      return 'bg-green-200 h-[2rem] rounded-2xl text-center';
    }
  }
});

const statusTextClass = computed(() => {
  if (props.frm.Saved === 0) {
    return 'p-2 text-sm w-20 text-red-500';
  } else if (props.frm.Saved === 1) {
    if (props.frm.submitable === 1 && docStatus.value !== 1) {
      return 'p-2 text-sm w-20 text-red-500';
    } else if (docStatus.value === 1) {
      return 'p-2 text-sm w-20 text-green-500';
    } else {
      return 'p-2 text-sm w-20 text-green-500';
    }
  }
});

const deletedMessage = ref('');
const handleDeleteClick = async () => {
  if (docName.value) {
    deletedMessage.value = await props.frm.delete(docName.value);
    console.log(deletedMessage.value);
    setTimeout(() => { deletedMessage.value = ''; }, 2500);
  }
};

const dropdownOptions = computed(() => {
  const options = [
    {
      label: 'Print',
      icon: () => h(FeatherIcon, { name: "printer" }),
    },
    {
      label: "Create New " + props.frm.doctype,
      icon: () => h(FeatherIcon, { name: "file-plus" }),
    },
  ];

  if (!showSubmitButton.value && docStatus.value !== 1) {
    options.push({
      label: 'Delete',
      icon: () => h(FeatherIcon, { name: "trash" }),
      onClick: handleDeleteClick
    });
  }

  return [{
    group: 'Actions',
    items: options,
  }];
});

const router = useRouter();

const goBack = () => {
  props.frm.doc = {
    docstatus: 0, 
  };
  props.frm.name = null;
  props.frm.fields = [];
  props.frm.Docstatus = 0;
  props.frm.Saved = 0;
  props.frm.Submit = 0;
  props.frm.Amend = 0;
  router.push({
    name: 'ListPage',
    query: {
      frmname: props.frm.Frm,
      doctype: props.frm.doctype,
    }
  });
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  display: none;
}

.custom-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
