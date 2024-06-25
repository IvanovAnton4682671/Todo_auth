import React from 'react'
import axiosInstance from './Interceptor/axiosInstance'

import Authorization from './components/Authorization/Authorization'
import Body from './components/Body/Body'

function App() {
	//состояние, которое следит за состоянием аутентификации пользователя
	const [isAuthenticated, setIsAuthenticated] = React.useState(false)

	//состояние, которое хранит загруженные To Do блоки пользователя
	const [userToDoAreas, setUserToDoAreas] = React.useState([])

	//функция, которая отправляет запрос на загрузку всех To Do блоков пользователя с сервера
	const fetchUserToDoAreas = () => {
		const userEmail = localStorage.getItem('userEmail')

		axiosInstance
			.post('/load_areas', { email: userEmail })
			.then(response => {
				console.log(
					'Выполнен запрос на загрузку данных. Ответ сервера: ',
					response.data
				)

				if (response.status === 200) {
					console.log('To Do Areas пользователя были загружены!')
					setUserToDoAreas(response.data.areas)
				} else if (response.status === 400) {
					console.log(
						'Какого-то хрена отправился не POST-запрос при загрузке To Do Areas!'
					)
				}
			})
			.catch(error => {
				console.log('Ошибка при отправке: ', userEmail, ' на сервер: ', error)
			})
	}

	//эффект, который при установке аутентификации выполняет запрос на загрузку данных на сервер
	React.useEffect(() => {
		if (isAuthenticated) {
			fetchUserToDoAreas()
		}
	}, [isAuthenticated])

	const handleLogout = () => {
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		localStorage.removeItem('userEmail')
		setIsAuthenticated(false)
		alert('Вы вышли из своего аккаунта!')
	}

	return (
		<div>
			{isAuthenticated ? (
				<Body userToDoAreas={userToDoAreas} onLogout={handleLogout} />
			) : (
				<Authorization onLogin={() => setIsAuthenticated(true)} />
			)}
		</div>
	)
}

export default App
