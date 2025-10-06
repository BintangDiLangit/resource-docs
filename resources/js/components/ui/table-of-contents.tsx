import React, { useEffect, useState } from 'react'
import { IconHamburger } from 'justd-icons'

interface TOCItem {
    id: string
    text: string
    level: number
    element: HTMLElement
}

interface TableOfContentsProps {
    className?: string
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ className = '' }) => {
    const [tocItems, setTocItems] = useState<TOCItem[]>([])
    const [activeId, setActiveId] = useState<string>('')
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const headings = document.querySelectorAll('.markdown h1, .markdown h2, .markdown h3, .markdown h4')
        
        const items: TOCItem[] = Array.from(headings).map((heading) => {
            const element = heading as HTMLElement
            const id = element.id || element.textContent?.toLowerCase().replace(/\s+/g, '-') || ''
            
            // Set ID if not already set
            if (!element.id) {
                element.id = id
            }
            
            return {
                id,
                text: element.textContent || '',
                level: parseInt(element.tagName.charAt(1)),
                element
            }
        })
        
        setTocItems(items)
        setIsVisible(items.length > 0)
    }, [])

    useEffect(() => {
        if (tocItems.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            {
                rootMargin: '-20% 0% -80% 0%',
                threshold: 0
            }
        )

        tocItems.forEach((item) => {
            observer.observe(item.element)
        })

        return () => {
            observer.disconnect()
        }
    }, [tocItems])

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    if (!isVisible) return null

    return (
        <div className={`bg-tertiary border border-border rounded-lg p-4 ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <IconHamburger className="w-4 h-4 text-muted-fg" />
                <h3 className="font-semibold text-sm text-fg">Table of Contents</h3>
            </div>
            
            <nav className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {tocItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors duration-200 ${
                            item.level === 1 ? 'font-medium text-sm leading-tight' : 
                            item.level === 2 ? 'ml-3 text-xs leading-tight' : 
                            'ml-6 text-xs leading-tight'
                        } ${
                            activeId === item.id
                                ? 'bg-primary text-primary-fg'
                                : 'text-muted-fg hover:text-fg hover:bg-secondary'
                        }`}
                        title={item.text}
                    >
                        <span className="block break-words hyphens-auto">
                            {item.text}
                        </span>
                    </button>
                ))}
            </nav>
        </div>
    )
}
