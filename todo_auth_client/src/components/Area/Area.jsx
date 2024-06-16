import React from "react"

import styles from "./Area.module.css"
import nothing from "../../img/nothing.svg"
import checkSvg from "../../img/check.svg"
import penSvg from "../../img/pen.svg"
import trashSvg from "../../img/trash.svg"

function Area() {

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

    return(
        <div className={styles.bodyTextArea}>
            {!isActive ? (
                    <div className={styles.notActiveTextArea}>
                        <button className={styles.buttonCheck} onClick={onClickButtonCheck}>
                            <img src={!isChecked ? nothing : checkSvg}/>
                        </button>
                        <textarea className={styles.textarea} onClick={onClickTextArea} readOnly="true">
                        </textarea>
                    </div>
                ) : (
                    <div className={styles.activeTextArea}>
                        <button className={styles.buttonCheck} onClick={onClickButtonCheck}>
                            <img src={!isChecked ? nothing : checkSvg}/>
                        </button>
                        <textarea className={styles.textarea} onClick={onClickTextArea} readOnly={!isTouched} ref={textareaRef}>
                        </textarea>
                        <div>
                            <button className={styles.buttonActivity} onClick={onClickButtonPen}>
                                <img src={!isTouched ? penSvg : checkSvg}/>
                            </button>
                            <button className={styles.buttonActivity}>
                                <img src={trashSvg}/>
                            </button>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default Area