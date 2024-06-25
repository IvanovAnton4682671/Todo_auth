import axios from 'axios'

//функция, которая получает нужную cookie по названию (например, достаёт CSRF-токен)
function getCookie(name) {
	let cookieValue = null
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';')
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim()
			if (cookie.substring(0, name.length + 1) === name + '=') {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
				break
			}
		}
	}
	return cookieValue
}

//создаём экземпляр axios
const axiosInstance = axios.create({
	baseURL: 'http://localhost:8000',
	withCredentials: true,
})

//интерсептор для запросов, добавляет токены в заголовок запроса
axiosInstance.interceptors.request.use(
	config => {
		//добавление JWTAccess-токена в заголовок, если он есть в localStorage
		const jwtAccessToken = localStorage.getItem('accessToken')
		if (jwtAccessToken) {
			config.headers['Authorization'] = `Bearer ${jwtAccessToken}`
		}

		//добавление CSRF-токена в заголовок, если он есть в cookie
		const csrfToken = getCookie('csrftoken')
		if (csrfToken) {
			config.headers['X-CSRFTOKEN'] = csrfToken
		}

		return config
	},
	error => {
		return Promise.reject(error)
	}
)

//функция, которая обновляет JWTAccess-токен при истечении срока его действия
const refreshJWTAccessToken = async () => {
	try {
		const jwtRefreshToken = localStorage.getItem('refreshToken')
		const response = await axiosInstance.post('/get_refresh_token', {
			refresh: jwtRefreshToken,
		})

		//сохранение новой пары токенов для дальнейшего использования
		localStorage.setItem('accessToken', response.data.access)
		localStorage.setItem('refreshToken', response.data.refresh)

		return response.data.access
	} catch (error) {
		console.error('Ошибка при обновлении jwtAccessToken: ', error)
		return null
	}
}

//интерсептор для ответов, если ошибка 401 (проблема с авторизацией), то меняет JWTAccess-токен
axiosInstance.interceptors.response.use(
	response => {
		return response
	},
	async error => {
		const originalRequest = error.config
		if (
			error.response.status === 401 &&
			!originalRequest._retry &&
			error.response.data.message === 'token_not_valid'
		) {
			originalRequest._retry = true
			const newJWTAccessToken = await refreshJWTAccessToken()
			if (newJWTAccessToken) {
				axios.defaults.headers.common[
					'Authorization'
				] = `Bearer ${newJWTAccessToken}`
				originalRequest.headers['Authorization'] = `Bearer ${newJWTAccessToken}`
				return axiosInstance(originalRequest)
			}
		}
		return Promise.reject(error)
	}
)

export default axiosInstance
