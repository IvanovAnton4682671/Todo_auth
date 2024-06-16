import React from "react"

import styles from "./Body.module.css"
import Area from "../Area/Area"

function Body() {

    const [quantityTextArea, setQuantityTextArea] = React.useState()
    const calculateQuantityTextArea = () => {
        //TODO
    }

    return (
        <div className="wrapper">
            <div className={styles.title}>
                <h2>Список задач</h2>
                <p>Задачи: 2</p>
            </div>
            <div className={styles.body}>
                <Area></Area>
                <Area></Area>
            </div>
        </div>
    )
}

export default Body
