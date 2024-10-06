import { useState } from 'react'

const CopyButton = ({ code }: any) => {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
        })
    }

    return (
        <button className="copy-button" onClick={copyToClipboard} aria-label="Copy to clipboard">
            {copied ? 'Copied!' : 'Copy'}
        </button>
    )
}

export default CopyButton
