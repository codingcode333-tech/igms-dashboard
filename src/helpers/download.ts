import httpService from "@/services/httpService"

export const downloadData = (filename, prefix = undefined) => {
    if (filename) {
        let route = downloadUrl(filename, prefix)

        console.log("Opening file on " + route)

        const element = document.createElement("a")
        element.href = route

        document.body.appendChild(element)
        element.click()

        element.remove()

        return route
    }

    return '#'
}

export const downloadUrl = (filename, prefix = "logs/data/") => {
    filename = filename.replace(prefix, '')

    return httpService.baseURL + prefix + filename
}