import { useEffect, useState } from 'react'
import moment from 'moment'

const formatDuration = (totalSeconds: number) => {
  const duration = moment.duration(totalSeconds, 'seconds')

  const hours = Math.floor(duration.asHours())
  const minutes = duration.minutes()
  const seconds = duration.seconds()

  return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':')
}

export const useTimeProgress = (startTime: string | null) => {
    const [elapsedTime, setElapsedTime] = useState('00:00:00')

    useEffect(() => {
        if (!startTime) {
            setElapsedTime('00:00:00')
            return
        }

        const update = () => {
        const start = moment(startTime, 'YYYY-MM-DD HH:mm:ss')
        const now = moment()

        const diffSeconds = now.diff(start, 'seconds')

        setElapsedTime(formatDuration(diffSeconds))
        }

        update()

        const interval = setInterval(update, 1000)

        return () => clearInterval(interval)
    }, [startTime])

    return elapsedTime
}
