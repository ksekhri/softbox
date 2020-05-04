// Constants
const HIDE_INFO_WRAPPER_MS = 2500

// Globals
let timeout = null

// Fullscreen
const toggleFullscreenDefault = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen?.()
  }
}

const toggleFullscreenSafari = () => {
  if (!document.webkitFullscreenElement) {
    document.documentElement.webkitRequestFullscreen()
  } else {
    document.webkitCancelFullScreen?.()
  }
}

const toggleFullscreen = document.documentElement?.requestFullscreen
? toggleFullscreenDefault
: document.documentElement?.webkitRequestFullscreen
  ? toggleFullscreenSafari
  : () => {}

// Info wrapper
const showInfoWrapper = () => {
  document.querySelector('#info-wrapper').classList.add('show')
}

const hideInfoWrapper = () => {
  document.querySelector('#info-wrapper').classList.remove('show')
}

const showInfoWrapperOnMove = () => {
  clearTimeout(timeout)
  showInfoWrapper()
  timeout = setTimeout(() => {
    hideInfoWrapper()
  }, HIDE_INFO_WRAPPER_MS)
}

// Settings

const openSettings = () => {
  document.body.classList.add('settings')
}

const closeSettings = () => {
  document.body.classList.remove('settings')
  showInfoWrapperOnMove()
}

// Dark Mode

const toggleDarkMode = () => {
  if (document.body.classList.contains('dark-mode')) {
    document.body.classList.add('dark-mode-off')
    setTimeout(() => {document.body.classList.remove('dark-mode-off')}, 250)
  }
  document.body.classList.toggle('dark-mode')
}

const disableDarkMode = () => {
  if (document.body.classList.contains('dark-mode')) {
    toggleDarkMode()
  }
}


const normalizeRgbValue = (rawValue) => Math.round(Math.min(Math.max(0, rawValue), 255))
const normalizeRgb = ({red, green, blue}) => ({
  red: normalizeRgbValue(red),
  green: normalizeRgbValue(green),
  blue: normalizeRgbValue(blue)
})

// https://github.com/neilbartlett/color-temperature/blob/8f6e08781321e24a24375a4bb2c9bf01487f3fdf/index.js#L93
const colorTemperatureToRgb = (colorTemperature) => {
  const adjustedTemperature = colorTemperature / 100

  const red = adjustedTemperature < 66
    ? 255
    : 351.97690566805693 + 0.114206453784165 * (adjustedTemperature - 55) - 40.25366309332127 * Math.log(adjustedTemperature - 55)

  const green = adjustedTemperature < 66
    ? -155.25485562709179 - 0.44596950469579133 * (adjustedTemperature - 2) + 104.49216199393888 * Math.log(adjustedTemperature - 2)
    : 325.4494125711974 + 0.07943456536662342 * (adjustedTemperature - 50) - 28.0852963507957 * Math.log(adjustedTemperature - 50)

  const blue = adjustedTemperature >= 66
    ? 255
    : adjustedTemperature <= 20
      ? 0
      : -254.76935184120902 + 0.8274096064007395 * (adjustedTemperature - 10) + 115.67994401066147 * Math.log(adjustedTemperature - 10)

  return normalizeRgb({
    red,
    green,
    blue,
  })
}

const temperatureToBackgroundMap = {}
const backgroundToTemperatureMap = {}
const reverseTemperatureMap = () => {
  Object.keys(temperatureToBackgroundMap).forEach((temperature) => {
    backgroundToTemperatureMap[temperatureToBackgroundMap[temperature]] = temperature
  })
}
const processTemperatureToBackground = () => {
  for (let i=3600; i<=7200; i+=25) {
    setTimeout(() => {
      const { red, green, blue } = colorTemperatureToRgb(i)
      temperatureToBackgroundMap[i] = `rgb(${red}, ${green}, ${blue})`
    })
  }
  setTimeout(() => {reverseTemperatureMap()})
}

const setBackground = (background) => {
  document.querySelector('#background').style.background = background
  setLocalStorage(background)
}

const reset = () => {
  disableDarkMode()
  document.querySelector('#color-temperature-slider').value = 5775
  setBackground('rgb(255, 240, 232)')
  window.localStorage.clear()
}

// Local Storage

const setBackgroundFromStorage = () => {
  const localStorageBackground = window.localStorage.getItem('background')
  setBackground(localStorageBackground ?? 'rgb(255, 240, 232)')
  document.querySelector('#color-temperature-slider').value =
    backgroundToTemperatureMap[localStorageBackground] ?? 5775
}

const setLocalStorage = (background) => {
  window.localStorage.setItem('background', background)
}

window.addEventListener('storage', () => setBackgroundFromStorage());

const onload = () => {
  processTemperatureToBackground()
  setTimeout(setBackgroundFromStorage)
  document.ondblclick = toggleFullscreen
  document.onmousemove = showInfoWrapperOnMove
  document.querySelector('#settings-gear').onclick = openSettings
  document.querySelector('#close-settings').onclick = closeSettings
  document.querySelector('#settings-gear').ondblclick = (event) => {
    event.stopPropagation()
  }
  setTimeout(() => {
    showInfoWrapperOnMove()
  }, 250)
  document.querySelector('#year').appendChild(document.createTextNode(`${new Date().getFullYear()} `))
  document.querySelector('#color-temperature-slider').oninput = (event) => {
    disableDarkMode()
    setBackground(temperatureToBackgroundMap[event.target.value])
  }
  document.querySelector('#dark-mode-toggle').onclick = toggleDarkMode
  document.querySelector('#dark-mode-toggle').ondblclick = (event) => {
    event.stopPropagation()
  }
}
