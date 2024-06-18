import React from "react"

import styles from "./Authorization.module.css"

function Authorization({onLogin}) {

    //состояние, которое следит за отображением формы (показывает нужную)
    const [formChanged, setFormChanged] = React.useState(false)
    const clickFormChanged = () => {
        setFormChanged(!formChanged)
        setCodePassed(false)
    }

    //состояние, которое следит за отправкой кода на почту
    const [codePassed, setCodePassed] = React.useState(false)
    const clickCodePassed = () => {
        setCodePassed(!codePassed)
    }

    const handleLogin = (event) => {
        event.preventDefault()
        onLogin()
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.mainForm}>
                {!formChanged ? (
                        <form className={styles.formAuthorization} onSubmit={handleLogin}>
                            <p>Добро пожаловать!</p>
                            <div>
                                <p>Почта</p>
                                <input></input>
                            </div>
                            <div>
                                <p>Пароль</p>
                                <input></input>
                            </div>
                            <button type="submit">
                                Войти
                            </button>
                            <div>
                                <p>Не зарегистрированы?</p>
                                <button onClick={clickFormChanged} type="button">
                                    Регистрация
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className={styles.formRegistration} onSubmit={handleLogin}>
                            <p>Здравствуйте!</p>
                            <div>
                                <p>Почта</p>
                                <input></input>
                            </div>
                            <div>
                                <p>Пароль</p>
                                <input></input>
                            </div>
                        {!codePassed ? (
                                <button onClick={clickCodePassed} type="button">
                                    Отправить код
                                </button>
                            ) : (
                                <div>
                                    <div>
                                        <p>Код с почты</p>
                                        <input></input>
                                    </div>
                                    <button type="submit">
                                        Подтвердить
                                    </button>
                                </div>
                            )
                        }
                            <div>
                                <p>Уже зарегистрированы?</p>
                                <button onClick={clickFormChanged} type="button">
                                    Авторизация
                                </button>
                            </div>
                        </form>
                    )
                }
            </div>
        </div>
    )
}

export default Authorization