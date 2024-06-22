import React from 'react'

import styles from './Area.module.css'
import nothing from '../../img/nothing.svg'
import checkSvg from '../../img/check.svg'
import penSvg from '../../img/pen.svg'
import trashSvg from '../../img/trash.svg'

function Area({ id, onDelete }) {
	//состояние, которео следит за активностью textarea (если активна - разворачиваем, показываем дополнительные кнопки,
	//иначе - сворачиваем и скрываем)
	const [isActive, setIsActive] = React.useState(false)
	const onClickTextArea = () => {
		setIsActive(!isActive)
	}

	//состояние, которое следит за кнопкой check (ставит галочку или убирает)
	const [isChecked, setIsChecked] = React.useState(false)
	const onClickButtonCheck = () => {
		setIsChecked(!isChecked)
	}

	//состояние, которое следит за возможностью редактирования textarea (можно/нельзя)
	const [isTouched, setIsTouched] = React.useState(false)
	const onClickButtonPen = () => {
		setIsTouched(!isTouched)
	}

	//а тут пополнение в нашем коллективе - useRef и useEffect, ещё и в связке
	//так, loading... совсем не пон, поясни-ка быстро!!!
	//useRef - ссылка в DOM-дереве на компонент, которая сохраняется между рендерингами компонентов
	//useEffect - позволяет выполнять дополнительные действия при изменении каких-то переменных (хз как иначе описать)
	//просто useEffect очень похож на useState, который срабатывает при изменении состояния
	//короче, у нас тут тема, которая при изменении isTouched перекидывает фокус на textarea
	const textareaRef = React.useRef(null)
	React.useEffect(() => {
		if (isTouched && textareaRef.current) {
			textareaRef.current.focus()
		}
	}, [isTouched])

	//ещё один useEffect
	//этот товарищ адаптивно изменяет высоту textarea в зависимости от текста в ней
	React.useEffect(() => {
		if (textareaRef.current) {
			const textarea = textareaRef.current //передаём текущую textarea
			const adjustHeight = () => {
				//функция пересчёта высоты
				textarea.style.height = '90px' //хз почему, но если указать 130px то при активной textarea она будет выше чем 130px
				textarea.style.height = `${Math.min(textarea.scrollHeight, 600)}px`
			}

			if (isActive) {
				//если активна - пересчитываем высоту в реалтайме при вводе
				adjustHeight()
				textarea.addEventListener('input', adjustHeight)
			} else {
				//иначе сбрасываем до заводских настроек
				textarea.style.height = '130px'
				textarea.removeEventListener('input', adjustHeight)
			}

			return () => {
				//а тут чтоб уж точно, ещё раз сбрасываем до стандартных
				textarea.style.height = '130px'
				textarea.removeEventListener('input', adjustHeight)
			}
		}
	}, [isActive])

	return (
		<div className={styles.bodyTextArea}>
			{!isActive ? (
				<div className={styles.notActiveTextArea}>
					<button className={styles.buttonCheck} onClick={onClickButtonCheck}>
						<img src={!isChecked ? nothing : checkSvg} alt='check' />
					</button>
					<textarea
						className={`${styles.textarea} ${
							isChecked ? styles.textareaChecked : styles.textareaUnchecked
						}`}
						onClick={onClickTextArea}
						readOnly={true}
					></textarea>
				</div>
			) : (
				<div className={styles.activeTextArea}>
					<button className={styles.buttonCheck} onClick={onClickButtonCheck}>
						<img src={!isChecked ? nothing : checkSvg} alt='check' />
					</button>
					<textarea
						className={`${styles.textarea} ${
							isChecked ? styles.textareaChecked : styles.textareaUnchecked
						}`}
						onClick={onClickTextArea}
						readOnly={!isTouched}
						ref={textareaRef}
					></textarea>
					<div>
						<button
							className={styles.buttonActivity}
							onClick={onClickButtonPen}
						>
							<img src={!isTouched ? penSvg : checkSvg} alt='pen' />
						</button>
						<button
							className={styles.buttonActivity}
							onClick={() => onDelete(id)}
						>
							<img src={trashSvg} alt='trash' />
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default Area
