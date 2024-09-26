<template>
  <div
    class="w-full sm:w-96 bg-[#f4f5f7] flex justify-center items-center h-screen"
  >
    <div class="w-full h-96 flex justify-center items-center">
      <div>
        <div class="w-full object-center justify-center flex">
          <img :src="imageSrc" class="w-16 h-16 object-cover rounded-lg" />
        </div>
        <div class="w-full">
          <p class="font-medium p-2 flex justify-center">Sign Up</p>
        </div>
        <div class="bg-white rounded-lg w-80 h-68 mt-4">
          <div class="p-4">
            <FormControl
              required
              type="text"
              label="Username"
              name="username"
              v-model="username"
              placeholder="johndoe"
              class="p-2"
            >
              <template #prefix>
                <FeatherIcon class="w-4" name="user" />
              </template>
            </FormControl>
            <FormControl
              required
              type="email"
              label="Email"
              name="email"
              v-model="email"
              placeholder="johndoe@email.com"
              class="p-2"
            >
              <template #prefix>
                <FeatherIcon class="w-4" name="mail" />
              </template>
            </FormControl>
            <div class="relative">
              <FormControl
                required
                label="Password"
                name="password"
                v-model="password"
                :type="passwordFieldType"
                placeholder="••••••"
                class="p-2 w-full"
              >
                <template #prefix>
                  <FeatherIcon class="w-4" name="lock" />
                </template>
              </FormControl>
              <span
                @click="togglePasswordVisibility"
                class="absolute right-2 top-7 cursor-pointer text-gray-600 text-sm p-2"
              >
                {{ passwordToggleText }}
              </span>
            </div>
            <div class="relative">
              <FormControl
                required
                label="Confirm Password"
                name="confirmPassword"
                v-model="confirmPassword"
                :type="confirmPasswordFieldType"
                placeholder="••••••"
                class="p-2 w-full"
              >
                <template #prefix>
                  <FeatherIcon class="w-4" name="lock" />
                </template>
              </FormControl>
              <span
                @click="toggleConfirmPasswordVisibility"
                class="absolute right-2 top-7 cursor-pointer text-gray-600 text-sm p-2"
              >
                {{ confirmPasswordToggleText }}
              </span>
            </div>
            <div
              v-if="formSubmitted && !emailValid"
              class="text-red-500 text-xs pl-2"
            >
              Enter a valid email!
            </div>
            <div
              v-if="formSubmitted && !passwordsMatch"
              class="text-red-500 text-xs pl-2"
            >
              Passwords do not match!
            </div>
            <div class="p-2">
              <Button
                :loading="loading"
                variant="solid"
                class="w-full"
                @click="signUp"
              >
                Sign Up
              </Button>
            </div>
            <div class="w-full">
              <router-link
                to="/login"
                class="text-sm font-medium text-black justify-center flex p-2 hover:underline"
                >Back to Login</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="fixed bottom-0 flex justify-end w-full sm:w-96 pr-3">
    <transition name="fade">
      <div
        v-if="responseMessage"
        class="w-full sm:w-72 p-2 mb-4 text-sm leading-5 text-white bg-blue-500 rounded-lg opacity-100 font-regular animate-slide-in-right animate-fade-out"
      >
        {{ responseMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import {
  Input,
  Button,
  FormControl,
  FeatherIcon,
  createListResource,
} from 'frappe-ui'

const imageSrc = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const responseMessage = ref('')
const formSubmitted = ref(false)
const loading = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const emailValid = computed(() => /\S+@\S+\.\S+/.test(email.value))
const passwordsMatch = computed(() => password.value === confirmPassword.value)

const passwordFieldType = computed(() =>
  showPassword.value ? 'text' : 'password'
)
const confirmPasswordFieldType = computed(() =>
  showConfirmPassword.value ? 'text' : 'password'
)
const passwordToggleText = computed(() =>
  showPassword.value ? 'Hide' : 'Show'
)
const confirmPasswordToggleText = computed(() =>
  showConfirmPassword.value ? 'Hide' : 'Show'
)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const currentURL = ref(window.location.href)
const baseURL = computed(() => {
  const url = new URL(currentURL.value)
  // return `${url.protocol}//${url.hostname}:8001`
  return `${url.protocol}//${url.hostname}`
})
const modifiedLogoURL = ref(`${baseURL.value}/assets`)

const fetchLogo = () => {
  const myHeaders = new Headers()
  myHeaders.append(
    'Cookie',
    'full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image='
  )

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  }

  fetch(modifiedLogoURL.value, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      const parser = new DOMParser()
      const doc = parser.parseFromString(result, 'text/html')
      const link = doc.querySelector('link[rel="shortcut icon"]')
      if (link) {
        imageSrc.value = link.href
      }
    })
    .catch((error) => console.error(error))
}

const signUp = () => {
  loading.value = true
  formSubmitted.value = true

  const NewUser = createListResource({
    doctype: 'User',
  })

  NewUser.insert
    .submit({
      email: email.value,
      first_name: username.value,
      new_password: password.value,
    })
    .then(() => {
      responseMessage.value = 'User Created successfully'
      loading.value = false
    })
    .catch((error) => {
      if (error.response && error.response.status === 417) {
        responseMessage.value = 'Password is too weak'
      } else if (error.response && error.response.status === 409) {
        responseMessage.value = 'Email already exists'
      } else {
        console.error('Error creating user:', error)
        responseMessage.value = 'Error creating User'
      }
      loading.value = false
    })
}

fetchLogo()
</script>

<style scoped></style>
