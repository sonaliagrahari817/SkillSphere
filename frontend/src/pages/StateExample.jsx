import { useState } from "react"

function StateExample() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <h1>{count}</h1>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </main>
  )
}

export default StateExample