import styles from "./Body.module.css"
import Area from "../Area/Area"

function Body() {
    return (
        <div className="wrapper">
            <div className={styles.title}>
                <h2>Список задач</h2>
                <p>Задачи: 1</p>
            </div>
            <div className={styles.body}>
                <Area></Area>
            </div>
        </div>
    )
}

export default Body
