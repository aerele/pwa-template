<template>
    <div class="p-2">
        <div class="flex justify-between p-2">
            <p class="text-[16px] text-gray-600">{{ field.label }}</p>
            <Button @click="newChild">
                <FeatherIcon name="plus" class="w-5 h-5 text-gray-700 hover:cursor-pointer" />
            </Button>
        </div>
        <div v-if="records.length > 0" class="max-h-[9.2rem] h-fit overflow-y-auto custom-scrollbar border-[1.5px] border-gray-300 rounded-md">
            <div v-for="(record, index) in records" :key="index" class="w-full rounded-md">
                <div v-if="record.fieldtype !== 'Section Break'" class="border-b-[0.5px] border-gray-300 w-full h-[3rem] p-2 flex content-center items-center">
                    <FeatherIcon name="file-text" class="w-5 h-5 text-gray-600" />
                    <div class="ml-3">
                        <p class="text-[12px] text-gray-600 w-[12rem] truncate font-semibold">
                            {{ Object.values(record)[0] }}
                        </p>
                        <div class="flex mt-[2px]">
                            <p class="text-[10px] text-gray-600 w-[6rem] truncate"> {{ Object.values(record)[1] }}</p>
                            <p class="text-[10px] text-gray-600 w-[6rem] truncate ml-2"> {{ Object.values(record)[2] }}</p>
                        </div>
                    </div>
                    <FeatherIcon name="arrow-right" class="w-5 h-5 text-gray-600 ml-auto hover:cursor-pointer hover:text-black" @click="showIndex(record.index)" />
                </div>
            </div>            
        </div>

        <div v-else class="w-full h-[5rem] rounded-md mt-1 border-dashed border-[1px] border-gray-500 bg-gray-200 text-center">
            <p class="text-[12px] text-gray-700 mt-[2rem]">No record added</p>
        </div>

        <div v-if="showPage" class="fixed inset-0 bg-black opacity-50 z-[999] w-full sm:w-96" @click="close"></div>

        <transition name="slide-up" @enter="handleEnter" @leave="handleLeave">
            <div
                v-if="showPage"
                ref="modal"
                class="w-full sm:w-96 fixed bottom-0 left-0 h-[85vh] bg-white border-t border-gray-300 shadow-lg z-[1000] flex flex-col touch-area"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
            >
                <div class="p-2 border-b-[1.5px] border-gray-300 flex">
                    <h1 class="font-bold text-[25px]">{{ field.label }}</h1>
                    <FeatherIcon name="x" @click="close" class="w-6 h-6 text-gray-700 mt-2 ml-auto hover:cursor-pointer" />
                </div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <div v-for="field in filteredFields" :key="field.fieldname" class="bg-white rounded-lg">
                        <component
                            v-if="field.fieldtype !== 'Section Break'"
                            :is="fieldMap[field.fieldtype]"
                            :field="field"
                            :frm="frm"
                            :table="props.field.fieldname"
                            :idexValue="indexValueSlected"
                            :idx="idx"
                        ></component>
                        <div v-else class="p-2">
                            <p class="text-[14px] text-gray-600 font-semibold">{{ field.label }}</p>
                            <hr class="border-gray-300" />
                        </div>
                    </div>
                </div>
                <div class="flex border-t-[1.5px] border-gray-200 p-4">
                    <FeatherIcon name="trash-2" @click="Delete" class="w-6 h-6 text-red-700 mt-1 hover:cursor-pointer hover:text-red-800" />
                    <div v-if="indexValueSlected >= 0" class=" ml-auto">
                        <Button variant="solid" class="w-[5rem] ml-auto" @click="update" >Update</Button>
                    </div>
                    <div v-else class=" ml-auto">
                        <Button variant="solid" class="w-[5rem] ml-auto" @click="Add">Add</Button>
                    </div>
                </div>
            </div>
        </transition>        
    </div>
</template>
<script setup>
import { defineProps, ref, watch } from 'vue'
import { FeatherIcon, Button } from 'frappe-ui'
import Text from './Text.vue'
import SectionBreak from './SectionBreak.vue'
import Select from './Select.vue'
import Int from './Int.vue'
import Autocomplete from './Autocomplete.vue'
import Badge from './Badge.vue'
import Date from './Date.vue'
import DateTime from './DateTime.vue'
import Checkbox from './Checkbox.vue'
import Float from './Float.vue'
import Currency from './Currency.vue'
import Link from './Link.vue'
import Attach from './Attach.vue'
import Textarea from './Textarea.vue'


const props = defineProps(['field', 'frm'])
const records = ref([])
const showPage = ref(false)
const indexValueSlected = ref(-1)
const idx = ref(0)
let startY = ref(0)
let endY = ref(0)
const retrivedValue = ref(true)

watch(props.field, (newField) => {
    if(newField.value.length > 0 && retrivedValue.value == true){
        newField.value.forEach(value => {
            records.value.push({
                ...value,   
                index: idx.value,
                fieldtype: 'Text'
            });
            idx.value += 1
        })
        retrivedValue.value = false
    }
});


// watch(props.frm.doc, (newdoc) => {
//     console.log(newdoc)
// })



const Add = () => {
    let doc = props.frm.doc;
    if (doc[props.field.fieldname]) {
        let table = doc[props.field.fieldname];
        records.value.push({
            ...table[idx.value],
            index: idx.value,
            fieldtype: table[idx.value].fieldtype
        });
    }
    idx.value += 1;
    showPage.value = false;
    // console.log(props.field.value)
};

const close = () => {
    if (records.value.length <= 0) {
        props.frm.doc[props.field.fieldname] = [];
    } else {
        let index = indexValueSlected.value > -1 ? indexValueSlected.value : idx.value;
        props.frm.doc[props.field.fieldname][index] = records.value[index];
        // delete props.frm.doc[props.field.label][index]['index']
        // delete props.frm.doc[props.field.label][index]['fieldtype']
    }
    
    showPage.value = false;
    indexValueSlected.value = -1;
};



const newChild = () => {
    showPage.value = true
}

const showIndex = (index) => {
    indexValueSlected.value = index;
    showPage.value = true
    console.log(records.value)
};

const update = () => {
    let doc = props.frm.doc;

    if (doc[props.field.label]) {
        let table = doc[props.field.label];
        const recordIndex = records.value.findIndex(record => record.index === indexValueSlected.value);

        if (recordIndex !== -1) {
            records.value[recordIndex] = {
                ...table[indexValueSlected.value],
                index: indexValueSlected.value,
                fieldtype: table[indexValueSlected.value].fieldtype
            };
        }
    }
    showPage.value = false;
};




const Delete = () => {
    let index = 0;
    if (indexValueSlected.value > -1){
        index = indexValueSlected.value
    }
    else{
        index = idx.value;
    }
    props.frm.removeTableVale(props.field.fieldname, index);
    records.value = records.value.filter(record => record.index !== indexValueSlected.value);
    records.value.forEach(record => {
        if (record.index > index){
            record.index--
        }
    })
    showPage.value = false;
    indexValueSlected.value = -1
    if(idx.value > 0){
        idx.value--
    }
};


const handleTouchStart = (event) => {
    startY.value = event.touches[0].clientY
}

const handleTouchMove = (event) => {
    endY.value = event.touches[0].clientY
}

const handleTouchEnd = () => {
    if (endY.value - startY.value > 50) { 
        showPage.value = false
    }
}


const handleEnter = (el) => {
    el.style.transform = 'translateY(100%)'
    setTimeout(() => {
        el.style.transform = 'translateY(0)'
    }, 10)
}

const handleLeave = (el) => {
    el.style.transform = 'translateY(0)'
    setTimeout(() => {
        el.style.transform = 'translateY(100%)'
    }, 10)
}

const fieldMap = {
    Data: Text,
    Select: Select,
    Int: Int,
    Autocomplete: Autocomplete,
    Dynamic_Link: Select,
    Heading: Badge,
    Datetime: DateTime,
    Date: Date,
    Check: Checkbox,
    Text: Text,
    'Long Text': Textarea,
    'Small Text': Textarea,
    Float: Float,
    Link: Link,
    Currency: Currency,
    Attach: Attach
}

const filteredFields = ref([
    {
        "fieldname": "section_break_dis6",
        "fieldtype": "Section Break",
        "label": "Name",
    },
    {
        "fieldname": "customer_name",
        "fieldtype": "Data",
        "label": "Customer Name",
    },
    
])
</script>
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #a0aec0; 
}

.slide-up-enter-active, .slide-up-leave-active {
    transition: transform 0.5s ease;
}

.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100%);
}

.touch-area {
    touch-action: pan-y;
}
</style>

