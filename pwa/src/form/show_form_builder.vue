<template>
	<div class="w-full sm:w-96 bg-white flex justify-center h-screen">
		<div class="w-full flex flex-col">
			<div class="w-full sm:w-96 bg-white h-16 shadow-lg fixed top-0 z-10">
				<div class="pr-2 flex pt-3 items-center">
					<FeatherIcon class="w-8 h-8 text-gray-600 hover:text-black" name="chevron-left" @click="goBack" />
					
					<div :class="{'flex-1 text-center': !docName}">
						<p class="font-semibold w-fit text-xl pr-2">{{ frm.doctype }}</p>
						<p v-if="docName" class="pt-1 b-2 text-xs font-light text-gray-600">{{ docName }}</p>
					</div>
					
					<div v-if="props.frm.workflowStatus">
						<div :class="styleClass">
							<p :class="styleTextClass">{{ props.frm.workflow_state }}</p>
						</div>
					</div>
					<div v-else>
						<div :class="statusClass">
							<p :class="statusTextClass">{{ statusText }}</p>
						</div>
					</div>
					
					<div class="w-full flex justify-end">
						<div class="p-1 pr-4">
							<FeatherIcon class="w-6 h-6 text-gray-600 hover:text-black" name="bell" />
						</div>
						<User />
					</div>
				</div>
			</div>
			

			<div class="flex-1 overflow-y-auto custom-scrollbar pt-20 pb-14 p-2 bg-gray-100">
				<div class=" bg-white rounded-lg">
					<component
						v-for="field in filteredFields"
						:key="field.fieldname"para should align perfectly 
						:is="fieldMap[field.fieldtype]"
						:field="field"
						:frm="frm"
					></component>
				</div>
			</div>

			<transition name="slide-up">
					<div
						v-if="showContainer"
						class="w-full sm:w-96 fixed bottom-0 left-0 h-[15%] bg-white border-t border-gray-300 shadow-lg z-[1000] flex flex-col touch-area rounded-t-md"
					>
					<div>
						<div class=" w-full border-b-[0.5px] border-gray-300 flex text-center justify-center touchable hover:cursor-pointer" @click="handelAction">
							<p class=" text-gray-600 p-2 text-[15px]">{{ props.frm.action}}</p>
						</div>
						<div class=" w-full border-b-[0.5px] border-gray-300 flex text-center justify-center touchable hover:cursor-pointer">
							<p class=" text-gray-600 p-2 text-[15px]">Help</p>
						</div>
					</div>
					</div>
			</transition>
			<div v-if="showContainer" class="fixed inset-0 bg-black opacity-50 z-[999] w-full sm:w-96" @click="showContainer = false"></div>
			<div class="flex w-full sm:w-96 pl-3 pb-1 pt-1 fixed bottom-0 z-10 bg-white justify-center shadow-lg">
				<Dialog
					:options="{
						title: 'Confirm',
						message: 'Are you sure you want to submit this form ' + props.docname + '?',
						size: 'sm',
						actions: [
							{
								label: 'Confirm',
								variant: 'solid',
								onClick: confirmSubmit
							},
							{
								label: 'Cancel',
								variant: 'subtle',
								onClick: () => {
									dialog1 = false; 
								},
							},
						],
					}"
					v-model="dialog1"
				/> 
				<Dialog
					:options="{
						title: 'Confirm Delete',
						message: 'Are you sure you want to delete this form ' + props.docname + '?',
						size: 'sm',
						actions: [
							{
								label: 'Delete',
								variant: 'solid',
								onClick: confirmDelete
							},
							{
								label: 'Cancel',
								variant: 'subtle',
								onClick: () => { dialogDelete = false; },
							},
						],
					}"
					v-model="dialogDelete"
				/>
				<Dialog
					:options="{
						title: 'Confirm Cancel',
						message: 'Are you sure you want to cancel this form ' + props.docname + '?',
						size: 'sm',
						actions: [
							{
								label: 'Confirm',
								variant: 'solid',
								onClick: confirmCancel
							},
							{
								label: 'Cancel',
								variant: 'subtle',
								onClick: () => { dialogCancel = false; },
							},
						],
					}"
					v-model="dialogCancel"
				/>
				<div class="pt-1 w-[20rem] sm:w-[20rem] ml-3">
					<div v-if="props.frm.workflowStatus">
						<Button
							:variant="'solid'"
							theme="gray"
							size="sm"
							label="Action"
							:loading="loading"
							:loadingText="'Saving...'"
							:disabled="isDisabled"
							:link="null"
							class="w-full h-full p-2 "
							@click="toggleContainer"
						/>
					</div>
					<div v-else>
						<Button
							v-if="props.frm.Saved == 0 || props.frm.submitable == 0"
							:variant="'solid'"
							theme="gray"
							size="sm"
							label="Save"
							:loading="loading"
							:loadingText="'Saving...'"
							:disabled="props.frm.saved"
							:link="null"
							class="w-full h-full p-2 "
							@click="handleSave"
						/>
						<Button   
							v-else-if="props.frm.Docstatus === 1 && props.frm.Saved == 1 && props.frm.submitable == 1"
							:variant="'solid'"
							theme="red"
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
							v-else-if="props.frm.Docstatus == 2 && props.frm.submitable == 1"
							:variant="'solid'"
							theme="gray"
							size="sm"
							label="Amend"
							:loading="loading"
							:loadingText="'Amending...'"
							:disabled="false"
							:link="null"
							class="w-full h-full p-2 "
							@click="handleAmend"
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
					</div>
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
					<div v-if="cancelResult" 
						:class="['fixed bottom-[4rem] leading-5 pr-[65rem] pl-[2.5rem] z-50 w-full sm:w-96', cancelSuccess ? 'animate-slide-in' : 'animate-slide-out']">
						<div class="rounded w-[20rem] h-fit p-2 text-left bg-red-200 text-red-500">
							<FeatherIcon name="x" class="inline w-4 h-4 mr-2" />
							{{ cancelResult }}
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
import Attach from './components/Attach.vue';
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
import Childtable from './components/Childtable.vue';
import { useRouter } from 'vue-router';
import { FeatherIcon, Dropdown, Button, Dialog } from 'frappe-ui';


const props = defineProps({
	frm: Object,
	docname: String,
	frmname: String,
	doctype: String,
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
const submitable = ref(props.frm.submitable)
const docName = ref(props.docname);
const docStatus = ref(props.frm.Docstatus);
const formAfterSave = ref({})
const Saved = ref(props.frm.Saved);
const Submitable = ref(props.frm.Submit);
const dialog1 = ref(false);
const dialogDelete = ref(false);
const dialogCancel = ref(false);
const Amend = ref(props.frm.Amend);
const cancelResult = ref('');
const cancelSuccess = ref('');
const showContainer = ref(false);
const isDisabled = ref(false);

const toggleContainer = () => {
	showContainer.value = !showContainer.value;
};


watch( props.frm, (newForm) => {
	docStatus.value = newForm.Docstatus;
	Saved.value = newForm.Saved;
	Submitable.value = newForm.Submit;
	submitable.value = newForm.submitable;
	Amend.value = newForm.Amend;
	if(!newForm.action){
		isDisabled.value = true;
	}
	else{
		isDisabled.value = false;
	}
});

const handelAction = () => {
	props.frm.workflow()
	showContainer.value = false;
}


props.frm.name = props.docname
props.frm.doctype = props.doctype
props.frm.Frm = props.frmname


 
const handleSave = async () => {
	loading.value = true;
	submitable.value = props.frm.submitable;
	try {
		await props.frm.update(); 
		saveResult.value = 'Updated successful!';
		saveSuccess.value = true;
		formAfterSave.value = props.frm.doc;
		if(props.frm.workflow){}
	} catch (error) {
		saveResult.value = `Error: ${error.message}`;
		saveSuccess.value = false;
		console.error(`Error: ${error.message}`);
	} finally {
		loading.value = false;
		setTimeout(() => { saveResult.value = ''; }, 2500);
	}
};


const handleAmend = async () => {
	loading.value = true;
	try {
		const response = await props.frm.amend();
		docName.value = response;
		saveResult.value = 'Amend successful!';
		saveSuccess.value = true;
		router.push({ path: '/showform', query: { docname: response } });
	} catch (error) {
		saveResult.value = `Error: ${error.message}`;
		saveSuccess.value = false;
		console.error(`Error: ${error.message}`);
	} finally {
		loading.value = false;
		setTimeout(() => { saveResult.value = ''; }, 2500);
	}
};


const confirmSubmit = async () => {
	loading.value = true;
	try {
		docStatus.value = await props.frm.submit(docName.value);
		saveResult.value = 'Submit successful!';
		saveSuccess.value = true;
		docStatus.value = 1
		dialog1.value = false;
	} catch (error) {
		saveResult.value = `Error: ${error.message}`;
		saveSuccess.value = false;
		console.error(`Error: ${error.message}`);
		dialog1.value = false;
	} finally {
		loading.value = false;
		setTimeout(() => { saveResult.value = ''; }, 2500);
	}
};

const confirmCancel = async () => {
	dialogCancel.value = false;
	try {
		await props.frm.cancel(docName.value); 
		cancelResult.value = 'Cancel successful!';
		cancelSuccess.value = true;
	} catch (error) {
		cancelResult.value = `Error: ${error.message}`;
		cancelSuccess.value = false;
		console.error(`Error: ${error.message}`);
	} finally {
		loading.value = false;
		setTimeout(() => { cancelResult.value = ''; }, 2500);
	}
};

const handleSubmit = () => {
	dialog1.value = true;
};

const handleDeleteClick = () => {
	dialogDelete.value = true;
};

const handleCancel = () => {
	dialogCancel.value = true;
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


const styleClass = computed(() => {
	if(props.frm.style == 'Success'){
		return 'bg-green-200 h-[2rem] rounded-2xl text-center';
	}
	else if(props.frm.style == 'Danger'){
		return 'bg-red-200 h-[2rem] rounded-2xl text-center';
	}
	else if(props.frm.style == 'Inverse'){
		return 'bg-black h-[2rem] rounded-2xl text-center';
	}
	else if(props.frm.style == 'Warning'){
		return 'bg-orange-200 h-[2rem] rounded-2xl text-center';
	}
	else if(props.frm.style == 'Info'){
		return 'bg-blue-200 h-[2rem] rounded-2xl text-center';
	}
	else if(props.frm.style == 'Primary'){
		return 'bg-[#9fa8da] h-[2rem] rounded-2xl text-center';
	}
	else{
		return 'bg-gray-200 h-[2rem] rounded-2xl text-center';
	}
})

const styleTextClass = computed(() => {
	if(props.frm.style == 'Success'){
		return 'p-2 text-sm w-20 text-green-500';
	}
	else if(props.frm.style == 'Danger'){
		return 'p-2 text-sm w-20 text-red-500';
	}
	else if(props.frm.style == 'Inverse'){
		return 'p-2 text-sm w-20 text-white';
	}
	else if(props.frm.style == 'Warning'){
		return 'p-2 text-sm w-20 text-orange-500';
	}
	else if(props.frm.style == 'Info'){
		return 'p-2 text-sm w-20 text-blue-500';
	}
	else if(props.frm.style == 'Primary'){
		return 'p-2 text-sm w-20 text-[#1a237e]';
	}
	else{
		return 'p-2 text-sm w-20 text-gray-500';
	}
})

const statusText = computed(() => {
	if(props.frm.submitable == 0){
		return '';
	}
	else if (props.frm.Saved === 0) {
		return 'Not Saved';
	} else if (props.frm.Saved === 1) {
		if (props.frm.submitable === 1 && props.frm.Submit !== 1) {
			return 'Draft';
		} else if (props.frm.Docstatus === 2) {
			return 'Cancelled';
		} else if (props.frm.Submit === 1) {
			return 'Submitted';
		}  else {
			return 'Saved';
		}
	}
});

const statusClass = computed(() => {
	if(props.frm.submitable == 0){
		return '';
	}
	else if (props.frm.Saved === 0) {
		return 'bg-red-200 h-[2rem] rounded-2xl text-center';
	} else if (props.frm.Saved === 1) {
		if (props.frm.submitable === 1 && props.frm.Submit !== 1) {
			return 'bg-red-200 h-[2rem] rounded-2xl text-center';
		} else if (props.frm.Docstatus === 2) {
			return 'bg-red-200 rounded-2xl text-center';
		}else if (props.frm.Submit === 1) {
			return 'bg-blue-200 h-[2rem] rounded-2xl text-center';
		}  else {
			return 'bg-blue-200 h-[2rem] rounded-2xl text-center';
		}
	}
});

const statusTextClass = computed(() => {
	if(props.frm.submitable == 0){
		return '';
	}
	else if (props.frm.Saved === 0) {
		return 'p-2 text-sm w-20 text-red-500';
	} else if (props.frm.Saved === 1) {
		if (props.frm.submitable === 1 && props.frm.Submit !== 1) {
			return 'p-2 text-sm w-20 text-red-500';
		} else if (props.frm.Docstatus === 2) {
			return 'p-2 text-sm w-20 text-red-500';
		} else if (props.frm.Submit === 1) {
			return 'p-2 text-sm w-20 text-blue-500';
		}  else {
			return 'p-2 text-sm w-20 text-blue-500';
		}
	}
});

const deletedMessage = ref('');
const confirmDelete = async () => {
	if (docName.value) {
		deletedMessage.value = await props.frm.delete(docName.value);
		setTimeout(() => { deletedMessage.value = ''; }, 2500);
		dialogDelete.value = false;
		goBack()
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
			onClick: () => { handelNew()}
		},
		{
			label: "Reload",
			icon: () => h(FeatherIcon, { name: "refresh-ccw" }),
			onClick: () => { window.location.reload();}
		},
	];

	if (props.frm.Docstatus !== 1) {
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
};

const handelNew = () => {
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
		name: 'Form',
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

.slide-up-enter-active,
.slide-up-leave-active {
	transition: transform 0.3s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
	transform: translateY(100%);
}
.slide-up-enter-to,
.slide-up-leave-from {
	transform: translateY(0%);
}
</style>
