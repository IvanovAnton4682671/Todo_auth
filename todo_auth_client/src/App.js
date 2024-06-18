import React from "react"

import Authorization from "./components/Authorization/Authorization"
import Body from "./components/Body/Body"

function App() {

  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  return (
    <div>
      {isAuthenticated ? (
          <Body></Body>
        ) : (
          <Authorization onLogin={() => setIsAuthenticated(true)}></Authorization>
        )
      }
    </div>
  )
}

export default App