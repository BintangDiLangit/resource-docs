import React, { useEffect, useState } from 'react'

interface ReadingProgressProps {
    className?: string
}

export const ReadingProgress: React.FC<ReadingProgressProps> = ({ className = '' }) => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = (scrollTop / docHeight) * 100
            setProgress(Math.min(100, Math.max(0, scrollPercent)))
        }

        window.addEventListener('scroll', updateProgress)
        updateProgress() // Initial call

        return () => {
            window.removeEventListener('scroll', updateProgress)
        }
    }, [])

    return (
        <div className={`fixed top-0 left-0 w-full h-1 bg-transparent z-50 ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
