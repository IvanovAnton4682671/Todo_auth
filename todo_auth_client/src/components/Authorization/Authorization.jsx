import React from 'react'
import {
	fetchCsrfToken,
	handleRequestAuthorization,
	handleRequestSendCode,
	handleRequestRegistration,
} from '../../utils/API/api'
import { SHA256 } from 'crypto-js'

import styles from './Authorization.module.css'

function Authorization({ onLogin }) {
	//useEffect, которые отрабатывает сразу 1 раз при рендеринге компонента
	React.useEffect(() => {
		fetchCsrfToken()
	}, [])

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
			//создаём копию структуры данных, но с хешем пароля
			const formDataWithHashedPassword = {
				...formAuthorizationData,
				authorizationPassword: SHA256(
					formAuthorizationData.authorizationPassword
				).toString(),
			}
			handleRequestAuthorization(formDataWithHashedPassword, onLogin)
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
			//создаём копию структуры данных, но с хешем пароля
			const formDataWithHashedPassword = {
				...formRegistrationData,
				registrationPassword: SHA256(
					formRegistrationData.registrationPassword
				).toString(),
			}
			handleRequestSendCode(formDataWithHashedPassword, setCodePassed)
		} else {
			alert(
				'Некоторые поля заполнены неверно: ',
				Object.keys(formRegistrationData.registrationErrors)
			)
		}
	}

	//функция, которая выполняет запрос о регистрации на сервер
	const handleSubmitRegistration = event => {
		event.preventDefault()

		//создаём копию структуры данных, но с хешем пароля
		const formDataWithHashedPassword = {
			...formRegistrationData,
			registrationPassword: SHA256(
				formRegistrationData.registrationPassword
			).toString(),
		}
		handleRequestRegistration(formDataWithHashedPassword, onLogin)
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
