import toast from "react-hot-toast"

const playSound = () => {
  const audio = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b6c6b.mp3")
  audio.play()
}

export const notifySuccess = (msg) => {
  playSound()
  toast.success(msg)
}

export const notifyError = (msg) => {
  playSound()
  toast.error(msg)
}