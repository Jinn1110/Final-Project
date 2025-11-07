import axiosInstance from "./axiosConfig";

const deviceApi ={
    getAll: ()=> axiosInstance.get("/devices"),
    
}

export default deviceApi