<template>
	<div class="w-full sm:w-96 bg-white flex flex-col items-center h-screen overflow-hidden">
		<div class="w-full sm:w-96 bg-white h-14 shadow-lg fixed top-0 z-10">
			<div class="p-2 flex pt-3">
				<FeatherIcon class="w-8 h-8 text-gray-600 hover:text-black" name="chevron-left" @click="goBack" />
				<p class="font-semibold text-2xl pt-[6px] pr-2 truncate w-[10rem]">Profile</p>
				<div class="w-full flex justify-end">
					<div class="p-1 pr-4">
						<FeatherIcon class="w-6 h-6 text-gray-600 hover:text-black hover:cursor-pointer" name="bell" @click="goToNotification"/>
					</div>
				</div>
			</div>
		</div>
		<div class="w-full flex-1 bg-gray-200 mt-14 overflow-hidden">
			<div class="p-4">
				<div class="w-full p-3 bg-white rounded-lg">
					<div class="w-full">
						<FeatherIcon name="edit" class="w-5 h-5 ml-auto hover:cursor-pointer" />
					</div>
					<div class="mt-7 w-full justify-center flex">
						<Avatar
							:shape="'circle'"
							:image="ImageUrl"
							:label="userName"
							class="cursor-pointer w-[6rem] h-[6rem]"
						/>
					</div>
					<div class="w-full flex justify-center">
						<p class="text-xl font-semibold text-black mt-2">{{ fullName }}</p>
					</div>
					<div class="p-2">
						<div class="w-full h-[12rem] rounded-md mt-1">
							<hr />
							<div v-for="(value, label) in userInfo" :key="label" class="flex ml-2 mt-1">
								<p class="text-[14px] text-gray-600 w-[5rem] truncate">{{ label }}</p>
								<p class="text-[14px] ml-auto">{{ value }}</p>
							</div>
						</div>
					</div>
					<div class="w-full flex justify-center p-2">
						<div
							@click="close"
							class="h-[2rem] bg-red-200 w-full rounded-md border-red-400 border-[0.5px] hover:cursor-pointer touchable"
						>
							<div class="h-full text-center flex justify-center">
								<FeatherIcon name="log-out" class="w-5 h-5 font-semibold text-red-400 mt-1" />
								<p class="text-red-400 mt-[2px] font-semibold ml-2">Logout</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { FeatherIcon, createListResource, Avatar } from 'frappe-ui';
import { useRouter, useRoute } from 'vue-router';
import { session } from '../../data/session';
import { computed, ref } from 'vue';

const router = useRouter();
const route = useRoute();
const userName = computed(() => session.user);
const imageBaseUrl = ref('');
const currentURL = ref(window.location.href);
const lang = ref('');
const fullName = ref('');

const userDetails = createListResource({
  doctype: "User",
  fields: ['*'],
  filters: {
    name: userName.value
  }
});

const goToNotification = () => {
	router.push('/notifications')
}

const userInfo = ref({});

const close = () => {
  session.logout.submit();
};

const baseURL = computed(() => {
  const url = new URL(currentURL.value);
  return `${url.protocol}//${url.hostname}`;
});

const ImageUrl = computed(() => {
  return imageBaseUrl.value ? `${baseURL.value}${imageBaseUrl.value}` : '';
});

userDetails.reload().then(() => {
  imageBaseUrl.value = userDetails.data[0].user_image || '';

  const Languvage = createListResource({
    doctype: "Language",
    fields: ['*'],
    filters: {
      name: userDetails.data[0].language,
    },
  });

  Languvage.reload().then(() => {
    lang.value = Languvage.data[0].language_name;
	fullName.value = userDetails.data[0].full_name
    userInfo.value = {
      Username: userDetails.data[0].username,
      Email: userDetails.data[0].email,
      'Mobile No': userDetails.data[0].mobile_no,
      Gender: userDetails.data[0].gender,
      'Date of Birth': userDetails.data[0].birth_date,
      'Role Profile': userDetails.data[0].role_profile_name,
      Language: lang.value,
    };
  });
});

const goBack = () => {
  router.back();
};
</script>
