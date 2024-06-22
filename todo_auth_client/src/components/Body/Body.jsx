import React from 'react'

import styles from './Body.module.css'
import Area from '../Area/Area'

function Body() {
	//состояние, которое отображает общее количество Area
	const [areas, setAreas] = React.useState([])

	//счётчик задач (в React такая магия работает, потому что переменная будет пересчитываться при каждом рендеринге компонента,
	//который перерендеривается буквально от любого чиха (сон приснился, сработал какой-то State, обновилось значение переменной и т.д.))
	const quantityAreas = areas.length

	const addArea = () => {
		const newId = areas.length ? areas[areas.length - 1].id + 1 : 1
		setAreas([...areas, { id: newId }])
	}

	//состояние, которое следит за тем какую textarea нужно удалить (по id)
	const deleteArea = id => {
		setAreas(areas.filter(area => area.id !== id))
	}

	return (
		<div className='wrapper'>
			<div className={styles.title}>
				<h2>Список задач</h2>
				<p>Задачи: {quantityAreas}</p>
			</div>
			<div className={styles.body}>
				<button className={styles.buttonSave}>Сохранить</button>
				{areas.map(area => (
					<Area key={area.id} id={area.id} onDelete={deleteArea}></Area>
				))}
				<button className={styles.buttonAdd} onClick={addArea}>
					+
				</button>
			</div>
		</div>
	)
}

export default Body
