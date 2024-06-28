import axios from 'axios'

// prettier-ignore
//функция, которая получает нужную cookie по названию (например, достаёт CSRF-токен)
function getCookie(name) {
    let cookieValue = null                                                            //объявление переменной, которая в дальнейшем должна содержать значение cookie
    if (document.cookie && document.cookie !== '') {                                  //проверка на существование cookies в документе и что эта строка не пустая
        const cookies = document.cookie.split(';')                                    //разбиение строки с cookies в массив по символу ;
        for (let i = 0; i < cookies.length; i++) {                                    //перебор всех cookie в массиве
            const cookie = cookies[i].trim()                                          //удаление лишних пробелов в начале и конце строки
            if (cookie.substring(0, name.length + 1) === name + '=') {                //проверяем cookie на совпадение по имени
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))   //получение и декодирование значения cookie
                break                                                                 //если такая cookie есть - выходим из цикла
            }
        }
    }
    return cookieValue                                                                //возвращаем значение такой cookie
}
//эта функция не асинхронная, потому что работа с cookies происходит через синхронный интерфейс document.cookie

// prettier-ignore
//функция, которая через JWTRefresh-токен получает новую пару JWT-токенов
const getNewJWTTokenPair = async () => {                                        //объявление функции как асинхронной (выполняется независимо от других)
	try {                                                                       //открываем блок try для отлова возможных ошибок асинхронной функции
		const jwtRefreshToken = localStorage.getItem('refreshToken')            //получаем текущий JWTRefresh-токен
		const response = await axiosInstance.post('/get_new_token_pair', {      //выполнение запроса на получение новой пары токенов с использованием await (приостанавливает выполнение этой функции пока не выполнится POST-запрос)
			refresh: jwtRefreshToken,                                           //передаём текущий JWTRefresh-токен
		})
		localStorage.setItem('accessToken', response.data.access)               //запись полученного JWTAccess-токена в localStorage
		localStorage.setItem('refreshToken', response.data.refresh)             //запись нового JWTRefresh-токена в localStorage
		return response.data.access                                             //возвращение нового JWTAccess-токена
	} catch (error) {                                                           //если какая-то ошибка
		console.error('Ошибка при получении новой пары JWT-токенов: ', error)   //печать этой ошибки
		return null                                                             //и возврат ничего
	}
}
//эта функция асинхронная, что позволяет избежать блокировки основного потока выполнения при ожидании получения ответа от сервера

// prettier-ignore
//создаём экземпляр axios
const axiosInstance = axios.create({    //создание экземпляра соединения
	baseURL: 'http://localhost:8000',   //указания URL по умолчанию
	withCredentials: true,              //указание того, что браузер будет включать учётные данные (например, cookies) в запросы
})

// prettier-ignore
//интерсептор для запросов, добавляет CSRF и JWTAccess токены в заголовок запроса
axiosInstance.interceptors.request.use(                                    //перехват запросов, отправляемых через axiosInstance
	config => {                                                            //модификация конфигурации запроса
		const jwtAccessToken = localStorage.getItem('accessToken')         //получение JWTAccess-токена из localStorage
		if (jwtAccessToken) {                                              //если он есть
			config.headers['Authorization'] = `Bearer ${jwtAccessToken}`   //установка его в заголовок в специальном виде
		}
		const csrfToken = getCookie('csrftoken')                           //получение CSRF-токена из cookie
		if (csrfToken) {                                                   //если он есть
			config.headers['X-CSRFTOKEN'] = csrfToken                      //установка его в специальный заголовок запроса
		}
		return config                                                      //возвращение запроса с изменённой конфигурацией
	},
	error => {                                                             //если возникли ошибки
		return Promise.reject(error)                                       //передача по цепочке промисов чтобы ошибки можно было увидеть в блоке catch запроса
	}
)

// prettier-ignore
//интерсептор для ответов, если ошибка 401 (проблема с авторизацией), то получает новую пару JWT-токенов
axiosInstance.interceptors.response.use(                                                   //перехват ответа, полученных после отправки через axiosInstance
	response => {                                                                          //если получен успешный ответ (без ошибки)
		return response                                                                    //то просто возвращается для дальнейшей обработки
	},
	async error => {                                                                       //асинхронная обработка ошибки
		const originalRequest = error.config                                               //получение запроса, вызвавшего ошибку
		if (
			error.response.status === 401 &&                                               //если статус 401 (Unauthorized)
			!originalRequest._retry &&                                                     //и это первая попытка повторного выполнения запроса
			error.response.data.message === 'token_not_valid'                              //и сообщение об невалидном токене
		) {
			originalRequest._retry = true                                                  //изменяется статус повторной попытки выполнения запроса для предотвращения бесконечных попыток
			const newJWTAccessToken = await getNewJWTTokenPair()                           //ожидается выполнение функции для получения новой пары токенов
			if (newJWTAccessToken) {                                                       //если новый токен доступа получен
				axios.defaults.headers.common[                                             //то он устанавливается в стандартные заголовки запросов
					'Authorization'
				] = `Bearer ${newJWTAccessToken}`
				originalRequest.headers['Authorization'] = `Bearer ${newJWTAccessToken}`   //новый токен устанавливается в оригинальный запрос
				return axiosInstance(originalRequest)                                      //возвращается повторный запрос
			}
		}
		return Promise.reject(error)                                                       //передача по цепочке промисов чтобы ошибки можно было увидеть в блоке catch запроса
	}
)

export default axiosInstance
