<template>
	<div>
		<div  v-if="visible"  class="fixed inset-0 bg-black opacity-50 z-20 w-full sm:w-96" @click="close"></div>
		<div class="fixed w-full sm:w-[22rem] rounded-md h-[4rem] p-4 bg-white border-t border-gray-300 shadow-lg z-[100] flex touch-area mt-4 ml-4">
		  <transition name="slide-fade" @after-enter="startTimer">
			<div 
			  v-if="visible" 
			>
			<div class=" flex w-[20rem]">
				<P class=" text-[12px] text-black font-semibold">message</P>
				<FeatherIcon name="x" class=" w-4 h-4 ml-auto"/>
			</div>
			  <p class=" text-[10px]">{{ message }}</p>
			</div>
		  </transition>
		</div>
	</div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { FeatherIcon } from 'frappe-ui';
  
  const props = defineProps({
	message: {
	  type: String,
	  default: 'This is an alert!'
	}
  });
  
  const visible = ref(true);
  
  const startTimer = () => {
	setTimeout(() => {
	  visible.value = false;
	}, 2000);
  };
  </script>
  
  <style scoped>
  .slide-fade-enter-active, .slide-fade-leave-active {
	transition: all 0.5s ease-in-out;
  }
  .slide-fade-enter-from {
	transform: translateY(-100%);
	opacity: 0;
  }
  .slide-fade-enter-to {
	transform: translateY(0);
	opacity: 1;
  }
  .slide-fade-leave-from {
	transform: translateY(0);
	opacity: 1;
  }
  .slide-fade-leave-to {
	transform: translateY(-100%);
	opacity: 0;
  }
  </style>
  