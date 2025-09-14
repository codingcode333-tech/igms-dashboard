import axios from "axios";
import httpService from "./httpService";


export const loginUser = (username, password) => {
    return axios.post(
        httpService.baseURL + "login",
        new URLSearchParams(
            {
                username: username,
                password: password
            }
        )
    )
}

export const getUserData = () => {
    return httpService.auth.get("get_current_user")
}

export const changePass = (oldPass, newPass) => {
    return httpService.auth.post("/update_password/", {
        'password': oldPass,
        'updated_password': newPass
    })
}