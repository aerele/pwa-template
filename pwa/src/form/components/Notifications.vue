<template>
	<div class="w-full sm:w-96 bg-white flex justify-center h-screen">
		<div class="w-full sm:w-96 bg-white h-14 shadow-lg fixed top-0 z-10">
			<div class="p-2 flex pt-3">
				<FeatherIcon class="w-8 h-8 text-gray-600 hover:text-black" name="chevron-left" @click="goBack" />
				<p class="font-semibold text-xl pt-[8px] pr-2 truncate w-[15rem]">Notification</p>
				<div class="w-full flex justify-end">
					<User />
				</div>
			</div>
		</div>

		<div class="w-full flex flex-col mt-14 bg-gray-100">
			<div class=" flex justify-between pl-8 pr-8 pt-8">
				<div>
					<div class=" flex">
						<FeatherIcon name="inbox" class=" w-5 h-5 text-gray-700" />
						<p class=" pl-2 text-gray-700 hover:cursor-pointer" :class="!unRead ? 'font-semibold' : ''" @click="unRead = false">Un-seen</p>
					</div>
					<div class=" w-fit">
						<div class=" h-[1px] rounded-lg w-[6rem]" :class="!unRead ? 'bg-black animate-slide-in':''"></div>
					</div>
				</div>
				<div>
					<div class=" flex">
						<FeatherIcon name="mail" class=" w-5 h-5 text-gray-700" />
						<p class=" pl-2 text-gray-700 pr-6 hover:cursor-pointer" :class="unRead ? 'font-semibold' : '' " @click="unRead = true">Seen</p>
					</div>
					<div class=" h-[1px] rounded-lg w-[4.2rem]" :class="unRead ? 'bg-black animate-slide-in':''"></div>
				</div>
			</div>
			<div v-if="!unRead" class="w-full h-full p-4 flex-1 overflow-y-auto custom-scrollbar">
				<ul v-if="notifications.length > 0">
					<div class="w-full p-2" v-if="notifications.length > 1">
						<Button class="ml-[16.5rem]" variant="solid" size="sm" @click="clearAllNotifications"> Read all </Button>
					</div>
					<li v-for="(notification, index) in notifications" :key="index" 
							@click="notifiedRecord(notification)"
							:class="{
								'transition-all duration-500 ease-in-out transform translate-x-full opacity-0': clearing || notification.clearing,
								'bg-white p-4 my-2 rounded hover:cursor-pointer touchable transition-all duration-500 ease-in-out': true
							}">
						<div class="flex">
							<p class="font-medium">{{ notification.title }}</p>
							<FeatherIcon name="eye-off" class="h-3 w-3 mt-1 ml-auto mr-2 text-gray-700"/>
						</div>
						<p class="text-sm mt-2 text-gray-600">{{ notification.message }}</p>
					</li>
				</ul>
				<div v-else class="h-full flex justify-center items-center">
					<p class="text-gray-600">No notifications found.</p>
				</div>
			</div>
			<div v-else class="w-full h-full p-4 flex-1 overflow-y-auto custom-scrollbar">
				<ul v-if="RededNotifications.length > 0">
					<li v-for="(notification, index) in RededNotifications" :key="index" 
							:class="{
								'transition-all duration-500 transform translate-x-full opacity-0': clearing || notification.clearing,
								'bg-white p-4 my-2 rounded  touchable transition-all duration-500 ease-in-out': true
							}">
						<div class="flex">
							<p class="font-medium text-gray-600">{{ notification.title }}</p>
						</div>
						<p class="text-sm mt-2 text-gray-600">{{ notification.message }}</p>
					</li>
				</ul>
				<div v-else class="h-full flex justify-center items-center">
					<p class="text-gray-600">No notifications found.</p>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FeatherIcon, createListResource, Dialog, Button } from 'frappe-ui'
import formList from '../../../public/json/form_list.json'
import User from './User.vue'; 

const notifications = ref([]);
const RededNotifications = ref([]);
const opneNotification = ref(false);
const clearing = ref(false);
const docwithfrms = ref({})
const router = useRouter();
const unRead = ref(false);




const loadData = async () => {
	formList.form_list.forEach(values => {
		docwithfrms.value[values.doctype_name] = values.form_name;
	});
	const docs = ["Email Queue"];
	formList.form_list.forEach((form) => {docs.push(form.doctype_name)})

	
	const getNotification = createListResource({
		doctype: 'Notification Log',
		filters: { document_type: ["in", docs] },
		fields: ['*']
	});

	await getNotification.reload();
	
	notifications.value = getNotification.data
	.filter(notifieData => !notifieData.read)
	.map(notifieData => ({
		title: notifieData.document_type,
		message: notifieData.subject,
		name: notifieData.name,
		document_name: notifieData.document_name,
		clearing: false
	}));

	RededNotifications.value = getNotification.data
	.filter(notifieData => notifieData.read)
	.map(notifieData => ({
		title: notifieData.document_type,
		message: notifieData.subject,
		name: notifieData.name,
		document_name: notifieData.document_name,
		clearing: false
	}));
};

onMounted(loadData);

const notifiedRecord = (notification) => {
	if(docwithfrms.value[notification.title]){
		router.push({
			name: 'Showform',
			query: {
				frmname: docwithfrms.value[notification.title],
				doctype: notification.title,
				docname: notification.documnet_name
			}
		})
	}
	}

const clearNotification = (docName) => {
	const clear = createListResource({
		doctype: 'Notification Log'
	});
	
	clear.setValue.submit({
		name: docName,
		read: 1
	});
};


const clearAllNotifications = () => {
	clearing.value = true;
	notifications.value.forEach( (notifie) => {
		 clearNotification(notifie.name)
	} )

	setTimeout(() => {
		notifications.value = [];
		clearing.value = false;
	}, 1000);
};

const deleteNotification = (notification,index) => {

	clearNotification(notification.name)

	notifications.value[index].clearing = true;
	setTimeout(() => {
		notifications.value.splice(index, 1);
	}, 500);
};


const goBack = () => {
	router.back();
};
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
