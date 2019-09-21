import axios from 'axios'
axios.defaults.baseURL = 'http://192.168.10.49:3000'
export const getTreeList = () => {
    return axios.get('/getTreeList')
}