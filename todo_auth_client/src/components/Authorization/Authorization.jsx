import React from 'react'
import { SHA256 } from 'crypto-js'
import axios from 'axios'

import styles from './Authorization.module.css'

function Authorization({ onLogin }) {
	//функция, которая получает CSRF-токен и устанавливает его в cookie
	const fetchCsrfToken = async () => {
		try {
			await axios.get('http://localhost:8000/get_csrf_cookie', {
				withCredentials: true,
			})
		} catch (error) {
			console.error('Ошибка при получении CSRF-токена', error)
		}
	}

	//useEffect, которые отрабатывает сразу 1 раз при рендеринге компонента
	React.useEffect(() => {
		fetchCsrfToken()
	}, [])

	//функция, которая получает CSRF-токен из cookie
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

	//состояние, которое следит за отображением формы (показывает нужную)
	const [formChanged, setFormChanged] = React.useState(false)
	const clickFormChanged = () => {
		setFormChanged(!formChanged)
		setCodePassed(false)
	}

	//состояние, которое хранит данные из формы авторизации
	const [formAuthorizationData, setFormAuthorizationData] = React.useState({
		authorizationEmail: '',
		authorizationPassword: '',
		authorizationErrors: {},
	})

	//функция, которая при каждом новом символе в поле обновляет данные формы авторизации
	const handleAuthorizationInput = event => {
		const { name, value } = event.target
		setFormAuthorizationData({ ...formAuthorizationData, [name]: value })
	}

	//функция, которая проверяет валидацию формы авторизации
	const formAuthorizationValidate = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{1,50}$/
		const errors = {}

		if (!emailRegex.test(formAuthorizationData.authorizationEmail)) {
			errors.emailRegex = true
		}

		if (!passwordRegex.test(formAuthorizationData.authorizationPassword)) {
			errors.passwordRegex = true
		}

		setFormAuthorizationData({
			...formAuthorizationData,
			authorizationErrors: errors,
		})

		//считаем количество ключей в словаре errors (если их 0, то возвращается true)
		return Object.keys(errors).length === 0
	}

	//функция, которая при корректных данных формы авторизации выполняет запрос на сервер с полученными данными
	const handleSubmitAuthorization = event => {
		event.preventDefault()
		const isFormValid = formAuthorizationValidate()
		if (isFormValid) {
			//получаем куки ИМЕННО С НАЗВАНИЕМ csrftoken, потому что такая куки создаётся автоматически на сервере
			const csrfToken = getCookie('csrftoken')

			const hashPassword = SHA256(
				formAuthorizationData.authorizationPassword
			).toString()
			setFormAuthorizationData(
				(formAuthorizationData.authorizationPassword = hashPassword)
			)

			axios
				.post('http://localhost:8000/authorization', formAuthorizationData, {
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFTOKEN': csrfToken,
					},
					withCredentials: true,
				})
				.then(response => {
					console.log('Отправленные данные: ', formAuthorizationData)
					console.log('Ответ сервера: ', response.data)

					if (response.status === 200) {
						console.log('Получилось авторизоваться!')
						alert('Вы успешно авторизовались!')
						onLogin()
					} else if (response.status === 201) {
						console.log('Такой пользователь уже существует!')
						alert('Такой пользователь уже существует!')
					} else if (response.status === 400) {
						console.log(
							'Какого-то хрена отправился не POST-запрос при авторизации!'
						)
					}
				})
				.catch(error => {
					console.log(
						'Ошибка при отправке: ',
						formAuthorizationData,
						' на сервер: ',
						error
					)
				})
		} else {
			alert(
				'Некоторые поля заполнены неверно: ',
				Object.keys(formAuthorizationData.authorizationErrors)
			)
		}
	}

	//состояние, которое хранит данные из формы регистрации
	const [formRegistrationData, setFormRegistrationData] = React.useState({
		registrationEmail: '',
		registrationPassword: '',
		registrationCode: '',
		registrationErrors: {},
	})

	//функция, которая при каждом новом символе в поле обновляет данные формы авторизации
	const handleRegistrationInput = event => {
		const { name, value } = event.target
		setFormRegistrationData({ ...formRegistrationData, [name]: value })
	}

	//функция, которая проверяет валидацию формы авторизации
	const formRegistrationValidate = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{1,50}$/
		const errors = {}

		if (!emailRegex.test(formRegistrationData.registrationEmail)) {
			errors.emailRegex = true
		}

		if (!passwordRegex.test(formRegistrationData.registrationPassword)) {
			errors.passwordRegex = true
		}

		setFormRegistrationData({
			...formRegistrationData,
			registrationErrors: errors,
		})

		//считаем количество ключей в словаре errors (если их 0, то возвращается true)
		return Object.keys(errors).length === 0
	}

	//состояние, которое проверяет данные формы и отправляет код на почту
	const [codePassed, setCodePassed] = React.useState(false)
	const clickCodePassed = event => {
		event.preventDefault()
		const isFormValid = formRegistrationValidate()
		if (isFormValid) {
			//получаем куки ИМЕННО С НАЗВАНИЕМ csrftoken, потому что такая куки создаётся автоматически на сервере
			const csrfToken = getCookie('csrftoken')

			//создаём копию структуры данных, но с хэшем пароля
			const formDataWithHashedPassword = {
				...formRegistrationData,
				registrationPassword: SHA256(
					formRegistrationData.registrationPassword
				).toString(),
			}

			axios
				.post('http://localhost:8000/send_code', formDataWithHashedPassword, {
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFTOKEN': csrfToken,
					},
					withCredentials: true,
				})
				.then(response => {
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
				})
				.catch(error => {
					console.log(
						'Ошибка при отправке: ',
						formDataWithHashedPassword,
						' на сервер: ',
						error
					)
				})
		} else {
			alert(
				'Некоторые поля заполнены неверно: ',
				Object.keys(formRegistrationData.registrationErrors)
			)
		}
	}

	const handleSubmitRegistration = event => {
		event.preventDefault()
		const csrfToken = getCookie('csrftoken')

		//создаём копию структуры данных, но с хэшем пароля
		const formDataWithHashedPassword = {
			...formRegistrationData,
			registrationPassword: SHA256(
				formRegistrationData.registrationPassword
			).toString(),
		}

		axios
			.post('http://localhost:8000/input_code', formDataWithHashedPassword, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFTOKEN': csrfToken,
				},
				withCredentials: true,
			})
			.then(response => {
				console.log('Отправленные данные: ', formDataWithHashedPassword)
				console.log('Ответ сервера: ', response.data)

				if (response.status === 200) {
					console.log(
						'Код введён верно и никакие данные не изменились, успешная регистрация!'
					)
					alert('Вы успешно зарегистрировались!')
					onLogin()
				} else if (response.status === 201) {
					console.log('Код введён неверно!')
					alert('Вы ввели неверный код!')
				} else if (response.status === 401) {
					console.log(
						'Глобальный код отсутствует, что-то жёстко пошло не так...'
					)
				} else if (response.status === 402) {
					console.log('Изменились какие-то данные (шо за бред???)')
				} else if (response.status === 400) {
					console.log(
						'Какого-то хрена отправился не POST-запрос при проверке кода!'
					)
				}
			})
			.catch(error => {
				console.log(
					'Ошибка при отправке: ',
					formDataWithHashedPassword,
					' на сервер: ',
					error
				)
			})
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.mainForm}>
				{!formChanged ? (
					<form
						className={styles.formColumn}
						onSubmit={handleSubmitAuthorization}
					>
						<p>Добро пожаловать!</p>
						<input
							placeholder='Почта'
							type='email'
							name='authorizationEmail'
							value={formAuthorizationData.authorizationEmail}
							onChange={handleAuthorizationInput}
						/>
						<input
							placeholder='Пароль'
							type='password'
							name='authorizationPassword'
							value={formAuthorizationData.authorizationPassword}
							onChange={handleAuthorizationInput}
						/>
						<button type='submit'>Войти</button>
						<p>Не зарегистрированы?</p>
						<button onClick={clickFormChanged} type='button'>
							Регистрация
						</button>
					</form>
				) : (
					<form
						className={styles.formColumn}
						onSubmit={handleSubmitRegistration}
					>
						<p>Здравствуйте!</p>
						{!codePassed ? (
							<div>
								<input
									placeholder='Почта'
									type='email'
									name='registrationEmail'
									value={formRegistrationData.registrationEmail}
									onChange={handleRegistrationInput}
								/>
								<input
									placeholder='Пароль'
									type='password'
									name='registrationPassword'
									value={formRegistrationData.registrationPassword}
									onChange={handleRegistrationInput}
								/>
								<button onClick={clickCodePassed} type='button'>
									Отправить код
								</button>
								<div>
									<p>Уже зарегистрированы?</p>
									<button onClick={clickFormChanged} type='button'>
										Авторизация
									</button>
								</div>
							</div>
						) : (
							<div>
								<input
									placeholder='Код с почты'
									type='password'
									name='registrationCode'
									value={formRegistrationData.registrationCode}
									onChange={handleRegistrationInput}
								/>
								<button type='submit'>Подтвердить</button>
							</div>
						)}
					</form>
				)}
			</div>
		</div>
	)
}

export default Authorization
