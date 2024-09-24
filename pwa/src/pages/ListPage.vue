<template>
	<div class="w-full sm:w-96 bg-white flex flex-col items-center h-screen overflow-hidden">
		<div class="w-full sm:w-96 bg-white h-14 shadow-lg fixed top-0 z-10">
			<div class="p-2 flex pt-3">
				<FeatherIcon class="w-8 h-8 text-gray-600 hover:text-black" name="chevron-left" @click="goBack" />
				<p class="font-semibold text-xl pt-[8px] pr-2 truncate w-[10rem]">{{ route.query.doctype }}</p>
				<div class="w-full flex justify-end">
					<div class="p-1 pr-4">
						<FeatherIcon class="w-6 h-6 text-gray-600 hover:text-black hover:cursor-pointer" name="bell" @click="router.push('/notifications')" />
					</div>
					<User />
				</div>
			</div>
		</div>

		<div v-if="ifError" class='fixed bottom-[5rem] leading-5 pr-[2rem] pl-[2.5rem] z-50 w-[20rem] sm:w-96 animate-slide-in'>
			<div class="rounded w-[20rem] h-fit p-2 text-left bg-red-200 text-red-500">
				<div class=" flex">
					<div class=" h-full">
						<FeatherIcon name="x" class="inline w-6 h-6 mr-2 hover:cursor-pointer" @click="CloseError"/>
					</div>
					<p class=" w-[16rem] break-words">{{Error}}</p>
				</div>
			</div>
		</div>

		<div class="w-full flex-1 bg-gray-200 mt-14 overflow-hidden">
			<div class="p-4">
				<div class="flex bg-white p-2 rounded-lg items-center">
					<FeatherIcon name="list" class="w-5 h-5 text-gray-600" />
					<div class=" w-[10rem] ml-2">
						<TextInput
							class="truncate"
							type="text"
							size="sm"
							variant="subtle"
							placeholder="ID"
							v-model="id"
						/>
					</div>
					<div class="ml-auto relative">
						<div v-if="numberOfFilters > 0" class="absolute -top-1 -right-1 bg-red-400 w-[13px] h-[13px] flex justify-center items-center rounded-2xl">
						  <p class="text-[5px] text-white">{{numberOfFilters}}</p>
						</div>
						<FeatherIcon name="filter" class="w-5 h-5 text-gray-600 hover:text-black hover:cursor-pointer" @click="dialog2 = true" />
					  </div>
					  
					<FeatherIcon name="refresh-ccw" class="w-5 h-5 text-gray-600 ml-[1rem] mr-2 hover:text-black hover:cursor-pointer" @click="refreshData"/>
				</div>
				<List :reports="reports" @handle-click="handleClick" @print-number="printNumber"/>                
			</div>
			<div class="flex w-full sm:w-96 pb-5 pt-2 fixed bottom-0 z-10 bg-white justify-center shadow-lg">
				<div class="pt-1 w-fit h-full">
					<Button variant="solid" class="w-[18rem] h-full p-2" @click="handelNew">New {{ route.query.doctype }}</Button>
				</div>
			</div>
		</div>
        <div v-if="dialog2" class="fixed inset-0 bg-black opacity-50 z-[99] w-full sm:w-96" @click="dialog2 = false"></div>
		<transition name="slide-up" @enter="handleEnter" @leave="handleLeave">
            <div
                v-if="dialog2"
                ref="modal"
                class="w-full sm:w-96 fixed bottom-0 left-0 h-[85vh] bg-white border-t border-gray-300 shadow-lg z-[100] flex flex-col touch-area"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
            >
			<div class=" p-4">
				<p class=" text-2xl font-semibold">Filters</p>
			</div>
			<div class="flex p-[3rem] flex-col justify-center h-full mt-[1rem] overflow-y-auto no-scrollbar">
				<div v-for="(filter, index) in filters" :key="index" class="flex p-2 justify-center">
					<div class="p-2">
						<Autocomplete
							class="truncate w-[5rem]"
							:options="filter.options"
							v-model="filter.selectedPerson"
							placeholder="Field"
						/>
					</div>
					<div class="p-2">
						<Autocomplete
							class="truncate w-[5rem] "
							:options="conditionsOptions"
							v-model="filter.selectedCondition"
							placeholder="Equals"
							hide-search="true"
						/>
					</div>
					<div class="p-2">
						<TextInput
							class="truncate w-[5rem] "
							type="text"
							size="sm"
							variant="subtle"
							placeholder="value"
							v-model="filter.value"
						/>
					</div>
					<div class="p-2 mt-1">
						<FeatherIcon name="x" class="w-5 h-5 text-gray-600 hover:text-black" @click="handleRemoveFilter(index)" />
					</div>                        
				</div>
			</div>
			<div class="flex border-t-[1.5px] border-gray-200 p-2 mt-auto">
				<Button variant="solid" class=" w-[4rem]" @click="handleAddFilter">Add</Button>
				<Button class="ml-auto" variant="solid" @click="handleConfirm">
					Confirm
				</Button>
				<Button class="ml-2" @click="dialog2 = false">
					Close
				</Button>
			</div>
            </div>
        </transition>       
	</div>
</template>
<script setup>
import { reactive, ref, watch, onMounted } from 'vue';
import { FeatherIcon, createListResource, Dialog, TextInput, Button, Autocomplete, createResource, createDocumentResource } from 'frappe-ui';
import User from "../form/components/User.vue";
import { useRoute, useRouter } from 'vue-router';
import List from '../form/components/List.vue';
import { listPage } from '../stores/formStore';
import formList from '../../public/json/form_list.json'
import { retrieveFileJson } from '../utils/check';
import { apiRetrival } from '../utils/apiRetrival';


const store = listPage()
const reports = ref(store.reports);
const router = useRouter();
const selectedNumber = ref(20);
const route = useRoute();
const dialog2 = ref(false);
const id = ref('');
const filter = ref([])
const DocT = ref(null);
const numberOfFilters = ref(0)
const Error = ref('')
const ifError = ref(false);
const Keys = ref([])
const is_active = ref(false)
const FileJson = ref({})



onMounted( async() => {
	const apiValue = await apiRetrival();
	if(apiValue.data) {
		FileJson.value = apiValue.data[route.query.doctype];
	}else{
			formList.form_list.forEach(async (frm) => {
			if (frm.form_name === route.query.frmname) {
				const fileJson = retrieveFileJson(frm.doctype_name);
				FileJson.value = fileJson;

			}	
		})
	}
});


const submitable = async() => {
	const Value = await apiRetrival()
	if(Value.data){
		let data = Value.data[route.query.doctype];
		return data.is_submittable;
	}else{
		formList.form_list.forEach(async (frm) => {
			if (frm.form_name === route.query.frmname) {
				const fileJson = retrieveFileJson(frm.doctype_name);
				return fileJson.is_submittable;
			}	
		})
	}
}



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

watch(id, (newId) => {
	if(newId) {
		filter.value = [[route.query.doctype, "name", "like", `%${newId}%`]];
	} else {
		filter.value = [];
	}
	loadData();
});


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


const CloseError = () => {
	Error.value = '';
	ifError.value = false;
}


const loadData = () => {
	const constructedFilters = filter.value.length !== 0 ? filter.value : [];
	numberOfFilters.value = filter.value.length;

	const Workflow = createResource({
		url:'pwa_template.utils.get_workFlow',
		method:'POST',
		params:{
			doctype: route.query.doctype,
		}
	})
	Workflow.reload()
	.then(() => {
		if (Workflow.data && Object.keys(Workflow.data).length > 0) {
			is_active.value = Workflow.data.doc[0].is_active;
		}
		DocT.value = createResource({
			url: 'frappe.desk.reportview.get',
			method: 'POST',
			params: {
				doctype: route.query.doctype,
				filters: constructedFilters,
				fields: ["*"],
				distinct: false,
				start: 0,
				page_length: selectedNumber.value,
			},
		});
		DocT.value.fetch().then(() => {
			if (DocT.value.data == null){
				reports.value = [];
				return;
			}
			if ( DocT.value.data.length === 0) {
				reports.value = [];
				return;
			}
	
			Keys.value = DocT.value.data.Keys
			const isSubmittable = submitable();
	
			reports.value = DocT.value.data.values.map((row) => {
				const mappedItem = {};
				DocT.value.data.keys.forEach((key, index) => {
					mappedItem[key] = row[index];
				});
				return {
					name: mappedItem.name,
					owner: mappedItem.owner,
					creation: mappedItem.creation,
					docstatus: mappedItem.docstatus,
					workflow_state: is_active.value ? mappedItem.workflow_state : null,
					amended_from_value: isSubmittable ? 1 : 0,
					status: is_active.value ? null : mappedItem.status ? mappedItem.status : null, 
				};
			});
			store.setReport(reports.value)
		})
	})
	.catch(error => {
		const errorMessage =  error.message || error.response?.data?.message || 'Something went wrong';
		Error.value = errorMessage
		ifError.value = true;
	}); 
};

loadData();

const handleClick = (report) => {
	router.push({
		name: 'Showform',
		query: {
			frmname: route.query.frmname,
			doctype: route.query.doctype,
			docname: report.name
		}
	})
};

const filterData = ref([]);


const handelNew = () => {
	router.push({
		name: 'Form',
		query: {
			frmname: route.query.frmname,
			doctype: route.query.doctype,
		}
	});
}

const handleConfirm = () => {
	filterData.value = filters.value.map(filter => {
		let condition = filter.selectedCondition;
		let operator = "=";
		let value = filter.value;

		switch (condition) {
			case 'equals':
				operator = "=";
				break;
			case 'not_equals':
				operator = "!=";
				break;
			case 'like':
				operator = "like";
				value = `%${value}%`;
				break;
			case 'not_like':
				operator = "not like";
				value = `%${value}%`;
				break;
			default:
				operator = "=";
		}
		if(filter.selectedPerson && operator && value){
			return {
				field: filter.selectedPerson,
				condition: operator,
				value: value,
			};
		}
	});


	filter.value = filterData.value
	.filter(f => f !== undefined) 
	.map(f => {
		return [
		route.query.doctype,
		f.field.value,
		f.condition,
		f.value,
		];
	});

	loadData();
	dialog2.value = false;
};



const printNumber = (number) => {
	selectedNumber.value = number;
	loadData();  
};

const handleRemoveFilter = (index) => {
	filters.value.splice(index, 1);
};


const goBack = () => {
	router.push({
		name: 'LandingPage'
	});
};  

const refreshData = () => {
	loadData(); 
};

const filters = ref([]);

const conditionsOptions = [
	{ label: 'Equals', value: 'equals' },
	{ label: 'Not Equals', value: 'not_equals' },
	{ label: 'Like', value: 'like' },
	{ label: 'Not Like', value: 'not_like' },
];

const handleAddFilter = () => {
	const options = Keys.value.map((key) => ({
		label: key,
		value: key,
	}));

	filters.value.push({
		options: options,
		selectedPerson: null,
		selectedCondition: 'Equals',
		value: '',
	});
};

</script>
<style scoped>
.no-scrollbar::-webkit-scrollbar {
	display: none;
}

.no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;
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
