<template>
	<div class="w-full sm:w-96 bg-gray-100 flex justify-center h-screen">
	  <div class="w-full flex flex-col">
		<div class="w-full sm:w-96 bg-white h-14 shadow-lg fixed top-0 z-10">
		  <div class="p-2 flex pt-3">
			<FeatherIcon class="w-6 h-6 mt-1 text-gray-600 hover:text-black" name="list" />
			<div class="relative w-full">
			  <FormControl
				:type="'text'"
				size="sm"
				variant="subtle"
				placeholder="Search..."
				:disabled="false"
				v-model="inputValue"
				@focus="showDropdown = true"
				class="flex-grow pl-4 w-full pt-[3px]"
			  >
				<template #prefix>
				  <FeatherIcon class="w-4" name="search" />
				</template>
			  </FormControl>
			  <div v-if="showDropdown" class="absolute left-[1rem] right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-20">
				<div v-if="options.length > 0" v-for="option in options" :key="option" class="p-2 hover:bg-gray-200 cursor-pointer" @click="selectOption(option)">
					<p class=" text-[14px] font-medium truncate">
						{{ option.doctype }}
					</p>
					<p class=" text-[12px] text-gray-600 truncate">
						{{ option.frm }}
					</p>
					<hr>
				</div>
				<div v-else class="p-2 hover:bg-gray-200 cursor-pointer text-[12px] text-gray-600" @click="selectOption(option)">
					No Record Found
				</div>
			  </div>
			</div>
			<div class="w-full flex justify-end">
			  <div class="p-1 pr-4 mb-2">
				<FeatherIcon class="w-[26px] h-[26px] text-gray-600 pt-[2px] hover:text-black hover:cursor-pointer" name="bell" @click="router.push('/notifications')"/>
			  </div>
			  <User />
			</div>
		  </div>
		</div>
		<div class="mt-14 w-full h-full">
		  <div class="p-4">
			<p class="font-medium text-xl pl-1 text-gray-600">Quick Link</p>
			<div class="bg-white h-[28rem] w-full rounded-lg mt-2 overflow-y-auto no-scrollbar p-2">
				<div v-for="link in links" :key="link.doctype" class="border-gray-200 border-b-[1.5px]">
					<div class="p-2 flex pt-2 touchable" @click="navigateToForm(link)">
						<FeatherIcon name="link" class="text-gray-600 h-5 w-5" />
						<p class="text-gray-600 pl-3 truncate w-[8rem]">{{ link.doctype }}</p>
						<div class="ml-auto touchable" @click.stop="handelNew(link)">
							<FeatherIcon name="plus" class="text-gray-600 h-5 w-5 hover:text-black" />
						</div>
					</div>
				</div>				  
			</div>
		  </div>
		</div>
		<div v-if="ifError" class='fixed bottom-[4rem] leading-5 pr-[60rem] pl-[2.5rem] z-50 w-[20rem] sm:w-96 animate-slide-in'>
			<div class="rounded w-[20rem] h-fit p-2 text-left bg-red-200 text-red-500">
				<div class=" flex">
					<div class=" h-full">
						<FeatherIcon name="x" class="inline w-6 h-6 mr-2 hover:cursor-pointer" @click="close"/>
					</div>
					<span v-html="Error"></span>
				</div>
			</div>
		</div>
	  </div>
	</div>
</template>
<script setup>
import { ref, watch , onMounted, computed} from 'vue';
import User from "../form/components/User.vue";
import { FeatherIcon, FormControl, createListResource, createResource } from "frappe-ui";
import { useRouter } from 'vue-router';
import { retrieveDoc } from '../utils/check';
import { landingPage } from '../stores/formStore';
import formList from '../../public/json/form_list.json'
import { retrieveFileJson } from '../utils/check';
import { apiRetrival } from '../utils/apiRetrival'


const store = landingPage();
const links = ref(store.links);


onMounted( async() => {
	const apiValue = await apiRetrival();
	if(apiValue.data ) {
		Object.values(apiValue.data).forEach((form) => {
			const exists = links.value.some(link => link.doctype === form.doctype_name);
				if (!exists){
					links.value.push({
						frm: form.form_name,
						doctype: form.doctype_name,
					});
					store.setLinks(links.value);
				}
			})
			const filteredLinks = ref([...links.value]);

			options.value = filteredLinks.value
	}
	else{
		formList.form_list.forEach((form) => {
		const exists = links.value.some(link => link.doctype === form.doctype_name);

		if (!exists) {
			links.value.push({
				frm: form.form_name,
				doctype: form.doctype_name,
			});
			store.setLinks(links.value);
		}
		});
	}
});



const inputValue = ref('');
const showDropdown = ref(false);
const options = ref(store.options); 
const router = useRouter();
const Name = ref('');
const filterValue = ref('')
const Error = ref()
const ifError = ref(false)

retrieveFileJson()

const filteredLinks = ref([...links.value]);

options.value = filteredLinks.value

watch(inputValue, (newValue) => {
	
  filteredLinks.value = links.value.filter(link => 
    link.doctype.toLowerCase().includes(newValue.toLowerCase()) || 
    link.frm.toLowerCase().includes(newValue.toLowerCase())
  );
  options.value = filteredLinks.value;
});


const close = () => {
	ifError.value = false
}


const selectOption = async (option) => {

	inputValue.value = option.doctype;	
	try {
		const value = await retrieveDoc(option.doctype);
		if(value.error){
			Error.value = value.error
			ifError.value = true;
		}else if(value.success){
			router.push({
				name: 'ListPage',
				query: {
					frmname: option.frm,
					doctype: option.doctype,
				}
			});
		}
	} catch (error) {
		console.error(error);
	}
	showDropdown.value = false;
};


const navigateToForm = async (link) => {
	try {
		const value = await retrieveDoc(link.doctype);
		if(value.error){
			Error.value = value.error
			ifError.value = true;
		}else if(value.success){
			router.push({
				name: 'ListPage',
				query: {
					frmname: link.frm,
					doctype: link.doctype,
				}
			});
		}
	} catch (error) {
		console.error(error);
	}
};


const handelNew = async (link) => {
	try {
		const value = await retrieveDoc(link.doctype);
		if(value.error){
			Error.value = value.error
			ifError.value = true;
		}else if(value.success){
			router.push({
				name: 'Form',
				query: {
					frmname: link.frm,
					doctype: link.doctype,
				}
			});
		}
	} catch (error) {
		console.error(error);
	}
}

// const loadOptions = () => {
// 	const opt = createResource({
// 		url: 'frappe.desk.reportview.get',
// 		method: 'POST',
// 		params: {
// 			doctype: 'PWA Form',
// 			filters: filterValue.value.length > 0 ? [filterValue.value] : [],
// 			fields: ["*"],
// 			distinct: false,
// 			start: 0,
// 			page_length: filterValue.value.length > 0 ? 500 : 5,
// 		},
// 	});

// 	opt.fetch().then(() => {
// 		const data = opt.data;
// 		if (data.values) {
// 			if(data.values.map){
// 				options.value = data.values.map(row => ({
// 					name: row[0],
// 					doctype_name: row[9],
// 				}));
// 			}
// 			else{
// 				options.value = []
// 			}
// 		}
// 		store.setOptions(options.value)
// 	});
// };


// loadOptions()


document.addEventListener('click', (event) => {
	const target = event.target;
	if (!target.closest('.relative')) {
		showDropdown.value = false;
	}
});
</script>
<style scoped>
	.no-scrollbar::-webkit-scrollbar {
	  display: none;
	}
	.no-scrollbar {
	  -ms-overflow-style: none;  
	  scrollbar-width: none; 
	}
	.touchable {
	  cursor: pointer;
	}
</style>