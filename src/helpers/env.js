import { dateBefore, formatDate } from "./date"

export const countDayDuration = 7

export const pageSize = 20

export const defaultThreshold = '1.2'

export const mapUrl = "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmlzaGVldGhzIiwiYSI6ImNrbDAzdWI1ejAxZWYycXQ3bWZreWNpbHMifQ.ERCOXWF81KOAgtBflWQrLg"

export const defaultFrom = dateBefore(countDayDuration)

export const defaultTo = formatDate()
