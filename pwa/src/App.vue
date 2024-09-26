<template>
  <div>
    <router-view />
    <InstallationPromt/>
  </div>
</template>
<script setup>
import InstallationPromt from './form/components/InstallationPromt.vue';

</script>