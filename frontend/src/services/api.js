import axios from "axios"
const api = axios.create({
  baseURL: "https://BuildOrbit-backend-puyd.onrender.com/api"
})

export default api