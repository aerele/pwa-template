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
          <p class="font-medium p-2 flex justify-center">Forget Password</p>
        </div>
        <div class="bg-white rounded-lg w-80 h-68 mt-4">
          <div class="p-4">
            <FormControl
              required
              type="text"
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
            <div
              v-if="formSubmitted && !emailValid"
              class="text-red-500 text-xs pl-2"
            >
              Enter email !
            </div>
            <div class="p-2">
              <Button
                :loading="loading"
                variant="solid"
                class="w-full"
                @click="resetPassword"
              >
                Reset Password
              </Button>
            </div>
            <div class="w-full">
              <router-link
                to="/"
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
        v-if="responsemessage"
        class="w-full sm:w-72 p-2 mb-4 text-sm leading-5 text-white bg-blue-500 rounded-lg opacity-100 font-regular animate-slide-in-right animate-fade-out"
      >
        {{ responsemessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Input, Button, FormControl, FeatherIcon } from 'frappe-ui'

const imageSrc = ref('')
const email = ref('')
const responsemessage = ref('')
const formSubmitted = ref(false)
const loading = ref(false)
const emailValid = computed(() => !!email.value)

const currentURL = ref(window.location.href)
const baseURL = computed(() => {
  const url = new URL(currentURL.value)
  return `${url.protocol}//${url.hostname}`
})
// baseURL.value = baseURL.value + ':8003/assets'
// const modifiedLogoURL = ref(`${baseURL.value}:8003/assets`)
// const modifiedForgetPasswordURL = ref(`${baseURL.value}:8003/`)

baseURL.value = baseURL.value + '/assets'
const modifiedLogoURL = ref(`${baseURL.value}/assets`)
const modifiedForgetPasswordURL = ref(`${baseURL.value}/`)

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

const resetPassword = () => {
  formSubmitted.value = true
  if (!emailValid.value) return

  loading.value = true // Set loading to true
  const Header = new Headers()
  Header.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    cmd: 'frappe.core.doctype.user.user.reset_password',
    user: email.value,
  })

  const request = {
    method: 'POST',
    headers: Header,
    body: raw,
    redirect: 'follow',
  }

  fetch(modifiedForgetPasswordURL.value, request)
    .then((response) => {
      response.text().then((result) => {
        loading.value = false
        if (response.status === 200) {
          responsemessage.value = `Password reset instructions have been sent to your email`
          console.log(result)
        } else if (response.status === 404) {
          responsemessage.value = `User Mail Not Found`
          console.log(result)
        } else if (response.status === 501) {
          responsemessage.value =
            'Please setup default Email Account from Settings > Email Account'
        } else {
          responsemessage.value =
            'You hit the rate limit because of too many requests. Please try after sometime.'
        }
        setTimeout(() => {
          responsemessage.value = ''
        }, 1000)
      })
    })
    .catch((error) => {
      loading.value = false
      console.error(error)
    })
}

fetchLogo()
</script>

<style scoped></style>
