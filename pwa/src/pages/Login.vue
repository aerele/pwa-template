<template>
  <div
    class="w-full sm:w-96 bg-[#f4f5f7] flex justify-center items-center h-screen"
  >
    <div class="w-full h-96 flex justify-center items-center">
      <div>
        <div class="w-full object-center justify-center flex">
          <img :src="imageSrc" class="w-16 h-16 object-cover rounded-lg" />
        </div>
        <div class="bg-white rounded-lg w-80 h-76 mt-4">
          <div class="p-4">
            <form
              class="flex flex-col space-y-2 w-full"
              @submit.prevent="submit"
            >
              <FormControl
                required
                type="text"
                label="User ID"
                name="email"
                v-model="email"
                placeholder="johndoe@email.com"
                class="p-2"
              >
                <template #prefix>
                  <FeatherIcon class="w-4" name="mail" />
                </template>
              </FormControl>
              <div
                v-if="formSubmitted && !emailValid"
                class="text-red-500 text-xs pl-2"
              >
                Enter a valid email
              </div>
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
              <div
                v-if="formSubmitted && !passwordValid"
                class="text-red-500 text-xs pl-2"
              >
                Enter password
              </div>
              <div class="w-full">
                <router-link
                  to="/forget-password"
                  class="pb-1 text-xs text-gray-600 justify-end flex pr-2 hover:underline"
                >
                  Forgot Password?
                </router-link>
              </div>
              <Button
                :loading="session.login.loading"
                variant="solid"
                class="w-full"
                >Login</Button
              >
              <div class="flex justify-center">
                <p class="text-xs p-1 text-gray-600">or</p>
              </div>
              <Button variant="subtle" class="w-full" @click="goToSignUp"
                >Sign up</Button
              >
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="fixed bottom-0 flex justify-end w-full sm:w-96">
    <transition name="fade">
      <div v-if="loginSuccess" class="w-[20rem] sm:w-72 p-2 mb-4 text-sm leading-5 text-white bg-green-500 rounded-lg opacity-100 font-regular animate-slide-in flex items-center">
        <FeatherIcon class="w-4 h-4 cursor-pointer mt-[2px] text-green-300" name="check" />
        <span class="ml-4">Login successfully</span>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="loginError" class="w-[20rem] sm:w-72 p-2 mb-4 text-sm leading-5 text-white bg-red-500 rounded-lg opacity-100 font-regular animate-slide-in flex items-center">
        <FeatherIcon class="w-4 h-4 cursor-pointer mt-[2px] text-red-300" name="x" @click="loginError = false" />
        <span class="ml-4">Login failed</span>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button, FormControl, FeatherIcon } from 'frappe-ui'
import { session } from '../data/session'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loginSuccess = ref(false)
const loginError = ref(false)
const formSubmitted = ref(false)

const emailValid = computed(
  () => email.value.includes('@') || email.value === 'Administrator'
)
const passwordValid = computed(() => !!password.value)

const passwordFieldType = computed(() =>
  showPassword.value ? 'text' : 'password'
)
const passwordToggleText = computed(() =>
  showPassword.value ? 'Hide' : 'Show'
)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const submit = (e: Event) => {
  formSubmitted.value = true

  if (!emailValid.value || !passwordValid.value) return

  session.login
    .submit({
      email: email.value,
      password: password.value,
    })
    .then((response) => {
      loginSuccess.value = true
      loginError.value = false
      setTimeout(() => {
        loginSuccess.value = false
        loginError.value = false
      }, 1000)
    })
    .catch((error) => {
      console.error(error)
      loginSuccess.value = false
      loginError.value = true
      setTimeout(() => {
        loginSuccess.value = false
        loginError.value = false
      }, 1000)
    })
}

const goToSignUp = () => {
  router.push('/signup')
}

const imageSrc = ref('')
const currentURL = ref(window.location.href)
const baseURL = computed(() => {
  const url = new URL(currentURL.value)
  return `${url.protocol}//${url.hostname}`
})

// const modifiedLogoURL = computed(() => `${baseURL.value}:8001/assets`)
const modifiedLogoURL = computed(() => `${baseURL.value}/assets`)

const myHeaders = new Headers()
myHeaders.append(
  'Cookie',
  'full_name=Guest; sid=Guest; system_user=no; user_id=Guest; user_image='
)

const requestOptions: RequestInit = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow' as RequestRedirect,
}

fetch(modifiedLogoURL.value, requestOptions)
  .then((response) => response.text())
  .then((result) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')
    const link = doc.querySelector(
      'link[rel="shortcut icon"]'
    ) as HTMLLinkElement
    if (link) {
      imageSrc.value = link.href
    }
  })
  .catch((error) => console.error(error))
</script>

<style scoped></style>
