<template>
  <div>
    <Dropdown
      :options="dropdownOptions"
      trigger="click"
    >
      <Avatar 
        :shape="'square'" 
        :image="ImageUrl" 
        :label="userName" 
        size="xl" 
        class="cursor-pointer"
      />
    </Dropdown>
  </div>
</template>

<script setup>
import { h, ref, computed, watch } from 'vue';
import { Avatar, Dropdown, FeatherIcon, createListResource } from 'frappe-ui';
import { session } from '../../data/session';
import { useRoute, useRouter } from 'vue-router';

const userName = computed(() => session.user);
const roles = computed(() => session.roles);
const imageBaseUrl = ref('');
const currentURL = ref(window.location.href);
const router = useRouter()

const baseURL = computed(() => {
  const url = new URL(currentURL.value);
  return `${url.protocol}//${url.hostname}`;
});

const ImageUrl = computed(() => {
  // return imageBaseUrl.value ? `${baseURL.value}:8001${imageBaseUrl.value}` : '';
  return imageBaseUrl.value ? `${baseURL.value}${imageBaseUrl.value}` : '';
});

const userDetails = createListResource({
  doctype: "User",
  fields: ['*'],
  filters: {
    name: userName.value
  }
});

userDetails.reload()
  .then(() => {
    imageBaseUrl.value = userDetails.data[0].user_image || '';
  });

const dropdownOptions = [
  {
    group: 'User Actions',
    items: [
      {
        label: 'About',
        icon: () => h(FeatherIcon, { name: "alert-circle" }),
        onClick: () => { 
          router.push('about')
         }
      },
      {
        label: 'Logout',
        icon: () => h(FeatherIcon, { name: "log-out" }),
        onClick: () => { session.logout.submit()}
      },
    ],
  },
]
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
