import httpService from "./httpService";

export const predictPriority = text => httpService
    .post('/dpg_priority/', {
        input: text
    })