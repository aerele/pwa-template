import router from '@/router'
import { computed, reactive } from 'vue'
import { createResource } from 'frappe-ui'
import { userResource } from './user'

export function sessionUser() {
	const cookies = new URLSearchParams(document.cookie.split('; ').join('&'))
	let _sessionUser = cookies.get('user_id')
	if (_sessionUser === 'Guest') {
		_sessionUser = null
	}
	return _sessionUser
}

export function sessionRoles(value) {
	const cookies = new URLSearchParams(document.cookie.split('; ').join('&'))
	const _sessionRoles = cookies.get('roles')
	return _sessionRoles ? JSON.parse(_sessionRoles) : value
}

export const session = reactive({
	login: createResource({
		url: 'login',
		makeParams({ email, password }) {
			return {
				usr: email,
				pwd: password,
			}
		},
		onSuccess(data) {
			userResource.reload()
			session.user = sessionUser()
			const userRole = createResource({
				url: 'frappe.desk.form.load.getdoc',
				method: 'GET', 
				params:{
					doctype: 'User',
					name: sessionUser(),
					_: Date.now()
				}
			})
			userRole.fetch()
				.then(() => {
					let Roles = []
					userRole.data.docs[0].roles.forEach(role => {
						Roles.push(role.role)
					})
					session.roles = sessionRoles(Roles)
					document.cookie = `roles=${JSON.stringify(session.roles)}; path=/;`
					session.login.reset()
				})
			router.replace(data.default_route || '/')
			}
	}),

	logout: createResource({
		url: 'logout',
		onSuccess() {
			userResource.reset()
			session.user = sessionUser()
			session.roles = []
			document.cookie = 'roles=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'

			router.replace({ name: 'Login' })
		},
	}),
	user: sessionUser(),
	roles: sessionRoles(),
	isLoggedIn: computed(() => !!session.user),
})
