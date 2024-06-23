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

//интерсептор для добавления токенов в заголовок запроса
axiosInstance.interceptors.request.use(
	config => {
		//добавление JWT-токена в заголовок, если он есть в localStorage
		const jwtToken = localStorage.getItem('accessToken')
		if (jwtToken) {
			config.headers['Authorization'] = `Bearer ${jwtToken}`
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

export default axiosInstance
