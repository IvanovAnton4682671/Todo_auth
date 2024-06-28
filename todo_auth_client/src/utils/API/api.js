import axiosInstance from '../Interceptor/axiosInstance'

export const fetchCsrfToken = async () => {
	try {
		await axiosInstance.get('/get_csrf_cookie')
		console.log('Получили CSRF-токен и установили его в cookie!')
	} catch (error) {
		console.error('Ошибка при получении CSRF-токена: ', error)
	}
}

export const handleRequestAuthorization = async (
	formDataWithHashedPassword,
	onLogin
) => {
	try {
		const response = await axiosInstance.post(
			'/authorization',
			formDataWithHashedPassword
		)
		console.log('Отправленные данные: ', formDataWithHashedPassword)
		console.log('Ответ сервера: ', response.data)
		if (response.status === 200) {
			console.log('Получилось авторизоваться!')
			alert('Вы успешно авторизовались!')
			localStorage.setItem('accessToken', response.data.access)
			localStorage.setItem('refreshToken', response.data.refresh)
			localStorage.setItem(
				'userEmail',
				formDataWithHashedPassword.authorizationEmail
			)
			onLogin()
		} else if (response.status === 201) {
			console.log('Такой пользователь не существует!')
			alert('Такой пользователь не существует!')
		} else if (response.status === 400) {
			console.log('Какого-то хрена отправился не POST-запрос при авторизации!')
		}
	} catch (error) {
		console.log(
			'Ошибка при отправке: ',
			formDataWithHashedPassword,
			' на сервер: ',
			error
		)
	}
}

export const handleRequestSendCode = async (
	formDataWithHashedPassword,
	setCodePassed
) => {
	try {
		const response = await axiosInstance.post(
			'/send_code',
			formDataWithHashedPassword
		)
		console.log('Отправленные данные: ', formDataWithHashedPassword)
		console.log('Ответ сервера: ', response.data)
		if (response.status === 200) {
			console.log('Получилось отправить код на почту!')
			alert('Вам на почту был отправлен код подтверждения регистрации!')
			setCodePassed(true)
		} else if (response.status === 201) {
			console.log('Пользователь с такими данными уже существует!')
			alert('Пользователь с такими данными уже существует!')
		} else if (response.status === 400) {
			console.log(
				'Какого-то хрена отправился не POST-запрос при отправке кода на почту!'
			)
		}
	} catch (error) {
		console.log(
			'Ошибка при отправке: ',
			formDataWithHashedPassword,
			' на сервер: ',
			error
		)
	}
}

export const handleRequestRegistration = async (
	formDataWithHashedPassword,
	onLogin
) => {
	try {
		const response = await axiosInstance.post(
			'/input_code',
			formDataWithHashedPassword
		)
		console.log('Отправленные данные: ', formDataWithHashedPassword)
		console.log('Ответ сервера: ', response.data)
		if (response.status === 200) {
			console.log(
				'Код введён верно и никакие данные не изменились, успешная регистрация!'
			)
			alert('Вы успешно зарегистрировались!')
			localStorage.setItem('accessToken', response.data.access)
			localStorage.setItem('refreshToken', response.data.refresh)
			onLogin()
		} else if (response.status === 201) {
			console.log('Код введён неверно!')
			alert('Вы ввели неверный код!')
		} else if (response.status === 499) {
			console.log('Глобальный код отсутствует, что-то жёстко пошло не так...')
		} else if (response.status === 498) {
			console.log('Изменились какие-то данные (шо за бред???)')
		} else if (response.status === 400) {
			console.log(
				'Какого-то хрена отправился не POST-запрос при проверке кода!'
			)
		}
	} catch (error) {
		console.log(
			'Ошибка при отправке: ',
			formDataWithHashedPassword,
			' на сервер: ',
			error
		)
	}
}

export const handleRequestLoadAreas = async (userEmail, setUserToDoAreas) => {
	try {
		const response = await axiosInstance.post('/load_areas', {
			email: userEmail,
		})
		console.log('Отправленные данные: ', userEmail)
		console.log('Ответ сервера: ', response.data)
		if (response.status === 200) {
			console.log('To Do Areas пользователя были загружены!')
			setUserToDoAreas(response.data.areas)
		} else if (response.status === 499) {
			console.log(
				'Почта пришла, однако такой пользователь не существует (максимально странно)...'
			)
		} else if (response.status === 498) {
			console.log(
				'Почта отсутствует в присланных данных (вот это вообще интересно)!'
			)
		} else if (response.status === 400) {
			console.log(
				'Какого-то хрена отправился не POST-запрос при загрузке To Do Areas!'
			)
		}
	} catch (error) {
		console.log('Ошибка при отправке: ', userEmail, ' на сервер: ', error)
	}
}

export const handleRequestSaveAreas = async dataToSave => {
	try {
		const response = await axiosInstance.post('/save_areas', dataToSave)
		console.log('Отправленные данные: ', dataToSave)
		console.log('Ответ сервера: ', response.data)
		if (response.status === 200) {
			console.log('Данные были сохранены!')
			alert('Данные были сохранены!')
		} else if (response.status === 499) {
			console.log(
				'Данные пришли, но такого пользователя нет в бд! (а ты харош, раз смог такую ошибку получить)'
			)
		} else if (response.status === 498) {
			console.log(
				'Данные пришли без почты, т.е. пользователь не авторизован! (ваще красота, смог это сделать вопреки JWT-токенам)'
			)
		} else if (response.status === 400) {
			console.log(
				'Какого-то хрена отправился не POST-запрос при сохранении данных!'
			)
		}
	} catch (error) {
		console.log('Ошибка при отправке: ', dataToSave, ' на сервер: ', error)
	}
}
