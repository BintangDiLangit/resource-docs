import React, { useState } from 'react'
import { IconCheck, IconClipboard } from 'justd-icons'

interface CodeBlockProps {
    children: string
    language?: string
    className?: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
    children, 
    language = 'text',
    className = ''
}) => {
    const [copied, setCopied] = useState(false)

    // Ensure children is always a string
    const codeContent = typeof children === 'string' ? children : String(children || '')

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeContent)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <div className={`relative group ${className}`}>
            {/* Code Block Header */}
            <div className="code-block-header">
                <span className="code-block-language">
                    {language}
                </span>
                <div className="code-block-actions">
                    <button
                        onClick={handleCopy}
                        className={`copy-button ${copied ? 'copied' : ''}`}
                        title={copied ? 'Copied!' : 'Copy code'}
                    >
                        {copied ? (
                            <>
                                <IconCheck className="w-3 h-3" />
                                Copied
                            </>
                        ) : (
                            <>
                                <IconClipboard className="w-3 h-3" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Code Content */}
            <pre className="!m-0">
                <code className={language ? `language-${language}` : ''}>
                    {codeContent}
                </code>
            </pre>
        </div>
    )
}
