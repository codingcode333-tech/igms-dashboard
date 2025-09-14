import httpService from "./httpService";

const rowsPerPage = 20

function getSearch(pageno) {
    return httpService.auth.get('/profile', {
        params: {
            skiprecord: (pageno - 1) * rowsPerPage,
            size: rowsPerPage
        }
    });
}

function getDownloadPath(id) {
    return httpService.auth.get('/downloadid', {
        params: {
            idx: id
        }
    })
}

function deleteHistory(id) {
    return httpService.auth.get('/deleteid', {
        params: {
            idx: id
        }
    })
}


const UserSearchHistory = {
    getSearch,
    getDownloadPath,
    deleteHistory
}

export default UserSearchHistory