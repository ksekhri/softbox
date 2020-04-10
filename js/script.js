// Constants
const HIDE_INFO_WRAPPER_MS = 2500

// Globals
let timeout = null

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

const onload = () => {
  document.querySelector('#background').style.background = '#FFF0E8'
  document.ondblclick = toggleFullscreen
  document.onmousemove = showInfoWrapperOnMove
  setTimeout(() => {
    showInfoWrapper()
    setTimeout(hideInfoWrapper, HIDE_INFO_WRAPPER_MS)
  }, 250)
  document.querySelector('#year').appendChild(document.createTextNode(`${new Date().getFullYear()} `))
}
