import React from 'react'
import axiosInstance from '../../Interceptor/axiosInstance'

import styles from './Body.module.css'
import Area from '../Area/Area'

function Body({ userToDoAreas, onLogout }) {
	//состояние, которое отображает общее количество Area
	const [areas, setAreas] = React.useState([])

	//эффект, который отображает загруженные To Do блоки пользователя
	React.useEffect(() => {
		if (userToDoAreas.length > 0) {
			setAreas(
				userToDoAreas.map(area => ({
					id: area.block_id,
					complete: area.complete,
					text: area.text,
				}))
			)
		}
	}, [userToDoAreas])

	//счётчик задач (в React такая магия работает, потому что переменная будет пересчитываться при каждом рендеринге компонента,
	//который перерендеривается буквально от любого чиха (сон приснился, сработал какой-то State, обновилось значение переменной и т.д.))
	const quantityAreas = areas.length

	//функция, которая добавляет новую Area при нажатии на + и присваивает ей корректный id
	const addArea = () => {
		const newId = areas.length ? areas[areas.length - 1].id + 1 : 1
		setAreas([...areas, { id: newId }])
	}

	//состояние, которое следит за тем какую textarea нужно удалить (по id)
	const deleteArea = id => {
		setAreas(areas.filter(area => area.id !== id))
	}

	//функция, которая следит и обновляет состояние блока после любых изменений
	const updateArea = (id, complete, text) => {
		setAreas(
			areas.map(area => (area.id === id ? { ...area, complete, text } : area))
		)
	}

	const saveAreas = event => {
		event.preventDefault()

		const userEmail = localStorage.getItem('userEmail')
		if (!userEmail) {
			console.log('Пользователь не авторизован (куда ты лезешь, пользователь?)')
			alert('Вы не авторизованы!')
			return
		}

		const dataToSave = { email: userEmail, areas: areas }

		axiosInstance
			.post('/save_areas', dataToSave)
			.then(response => {
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
			})
			.catch(error => {
				console.log('Ошибка при отправке: ', dataToSave, ' на сервер: ', error)
			})
	}

	return (
		<div className='wrapper'>
			<div className={styles.title}>
				<h2>Список задач</h2>
				<p>Задачи: {quantityAreas}</p>
				<button className={styles.buttonLogout} onClick={onLogout}>
					Выйти
				</button>
			</div>
			<div className={styles.body}>
				<button className={styles.buttonSave} onClick={saveAreas}>
					Сохранить
				</button>
				{areas.map(area => (
					<Area
						key={area.id}
						id={area.id}
						complete={area.complete}
						areaText={area.text}
						onDelete={deleteArea}
						onUpdate={updateArea}
					></Area>
				))}
				<button className={styles.buttonAdd} onClick={addArea}>
					+
				</button>
			</div>
		</div>
	)
}

export default Body
