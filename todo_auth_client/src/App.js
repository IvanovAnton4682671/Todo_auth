import React from 'react'
import { handleRequestLoadAreas } from './utils/API/api'

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

		handleRequestLoadAreas(userEmail, setUserToDoAreas)
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
