import axios from "axios"
const api = axios.create({
  baseURL: "https://skillsphere-backend-puyd.onrender.com/api"
})

export default api