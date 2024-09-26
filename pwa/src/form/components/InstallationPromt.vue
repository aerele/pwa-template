<template>
    <div class="h-10">
      <Dialog v-model="iosInstallMessage">
        <template #body-title>
          <h3 class="text-xl text-gray-900 font-bold">Install App</h3>
        </template>
        <template #body-content>
          <div class="flex flex-col gap-2 text-[15px] text-gray-700">
            <span>Get the app on your iPhone for easy access & a better experience</span>
            <span class="inline-flex items-start whitespace-nowrap">
              <span>Tap&nbsp;</span>
              <FeatherIcon name="share" class="h-4 w-4 mt-[1px] text-blue-600 font-semibold" />
              <span>&nbsp;and then "Add to Home Screen"</span>
            </span>
          </div>
        </template>
        <template #actions>
          <Button
            @click="iosInstallMessage = false"
            variant="solid"
          >
            Close
          </Button>
        </template>
      </Dialog>
  
      <Dialog v-model="showDialog">
        <template #body-title>
          <h2 class="text-lg font-bold">Install App</h2>
        </template>
        <template #body-content>
          <p>Get the app on your device for easy access & a better experience!</p>
        </template>
        <template #actions>
          <Button variant="solid" @click="install" class="py-5 w-full">
            <template #prefix>
              <FeatherIcon name="download" class="w-4" />
            </template>
            Install
          </Button>
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { Dialog, FeatherIcon } from 'frappe-ui';
  
  const deferredPrompt = ref(null);
  const showDialog = ref(false);
  const iosInstallMessage = ref(false);
  
  const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInStandaloneMode = () => 'standalone' in window.navigator && window.navigator.standalone;
  
  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    if (isIos() && !isInStandaloneMode()) {
      iosInstallMessage.value = true;
    } else {
      showDialog.value = true;
    }
  };
  
  const setupInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  };
  
  const handleAppInstalled = () => {
    showDialog.value = false;
    deferredPrompt.value = null;
  };
  
  onMounted(() => {
    setupInstallPrompt();
    window.addEventListener('appinstalled', handleAppInstalled);
  });
  
  const install = async () => {
    deferredPrompt.value.prompt();
    showDialog.value = false;
  };
  </script>
  