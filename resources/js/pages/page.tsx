import { AppLayout } from '@/layouts/app-layout'
import { PagePropsData } from '@/types'
import { csrfToken, Page as pagetype, Project, SidebarSection } from '@/types/type'
import { Head, usePage, router } from '@inertiajs/react'
import 'highlight.js/styles/github.css'
import { IconBrandFacebook, IconBrandLinkedin, IconBrandWhatsapp, IconBrandX, IconPencilBox, IconRocket, IconTrash, IconLink } from 'justd-icons'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Button, Form, Modal, TextField } from 'ui'
import { CodeBlock } from '@/components/ui/code-block'
import { TableOfContents } from '@/components/ui/table-of-contents'
import { ReadingProgress } from '@/components/ui/reading-progress'
import '../../css/markdown-content.css'


interface ClientSeoProps {
    title: string,
    description: string,
    image: string,
    url: string
}

interface PageProps {
    page: pagetype
    sidebarSections: SidebarSection[]
    projects: Project[]
    clientSeo: ClientSeoProps
}

const Page: React.FC<PageProps> = ({ page, projects, clientSeo }) => {
    const { auth } = usePage<PagePropsData>().props

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [editTitle, setEditTitle] = useState(page.title)
    const [editContent, setEditContent] = useState(page.content)
    const [loading, setLoading] = useState(false)
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [openTag, setOpenTag] = useState<string | null>(null)
    const [tagResults, setTagResults] = useState<any[]>([])
    const [tagLoading, setTagLoading] = useState(false)

    const tagsMatch = /^\s*Tags:\s*(.+)$/mi.exec(page.content || '')
    const tags: string[] = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean) : []
    const contentWithoutTags = (page.content || '').replace(/^\s*Tags:.*$/mi, '').trim()

    const handleOpenTag = async (tag: string) => {
        if (openTag === tag) {
            setOpenTag(null)
            return
        }
        setOpenTag(tag)
        setTagLoading(true)
        try {
            const res = await fetch(`/search?query=${encodeURIComponent(tag)}`)
            const data = await res.json()
            // Flatten section/items into simple list of links
            const items: { title: string; url: string }[] = []
            data.forEach((section: any) => {
                (section.sidebar_items || []).forEach((it: any) => items.push({ title: it.title, url: it.url }))
            })
            setTagResults(items.slice(0, 8))
        } catch (e) {
            setTagResults([])
        } finally {
            setTagLoading(false)
        }
    }

    const handleEdit = (pageId: number) => {
        // Navigate to the rich edit screen
        router.visit(`/article/${pageId}/edit`)
    }

    const handleDelete = (pageId: number) => {
        setIsDeleteOpen(true)
    }

    const handleSave = () => {
        console.log('Saving changes to:', { title: editTitle, content: editContent })

        if (!editTitle) {
            alert('Please fill the title.')
            return
        }

        const payload = {
            sidebarTitleName: editTitle,
            pageId: page.sidebar_item_id
        }

        fetch('/settings/update-sidebar-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(payload)
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert('Content updated successfully!')
                } else {
                    alert('Failed to update content.')
                }
            })
            .catch((error) => {
                console.error('Error updating content:', error)
            })
        setIsModalOpen(false)
    }

    const deleteItem = async (pageId: number) => {
        // Simulate an API call to delete the item
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`Item with ID ${pageId} deleted`)
                resolve({ success: true })
            }, 1000)
        })
    }

    const socialLinks = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${clientSeo.url}`,
        twitter: `https://twitter.com/intent/tweet?url=${clientSeo.url}&text=${clientSeo.title}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${clientSeo.url}`,
        whatsapp: `https://api.whatsapp.com/send?text=${clientSeo.title} - ${clientSeo.url}`
    };

    return (
        <AppLayout projects={projects}>
            <Head title={clientSeo?.title}>
                <meta name="description" content={clientSeo?.description} />
                <meta property="og:title" content={clientSeo?.title} />
            </Head>
            <ReadingProgress />
            <div className="flex gap-6 xl:gap-8 max-w-7xl mx-auto">
                {/* Main Content */}
                <div className="flex-1 p-4 min-w-0">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <h1 className="text-2xl lg:text-3xl font-bold leading-tight flex-1">
                        {page.title}
                    </h1>
                    <div className="flex items-center gap-1">
                        {auth.user && (
                            <>
                                <Button appearance="plain" shape="circle" size="square-petite" aria-label="Edit" onPress={() => handleEdit(page.id)}>
                                    <IconPencilBox />
                                </Button>
                                <Button appearance="plain" shape="circle" size="square-petite" aria-label="Delete" onPress={() => handleDelete(page.id)}>
                                    <IconTrash />
                                </Button>
                            </>
                        )}
                        <div className="relative">
                            <Button appearance="plain" shape="circle" size="square-petite" aria-label="Share" onPress={() => setIsShareOpen(!isShareOpen)}>
                                <IconRocket />
                            </Button>
                            {isShareOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-border rounded-lg shadow-xl p-2 z-50">
                                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary">
                                        <IconBrandLinkedin/> <span>LinkedIn</span>
                                    </a>
                                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary">
                                        <IconBrandX/> <span>Twitter/X</span>
                                    </a>
                                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary">
                                        <IconBrandFacebook/> <span>Facebook</span>
                                    </a>
                                    <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary">
                                        <IconBrandWhatsapp/> <span>WhatsApp</span>
                                    </a>
                                    <button onClick={() => { navigator.clipboard.writeText(clientSeo.url); setIsShareOpen(false); }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary">
                                        <IconLink/> <span>Copy link</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="mb-4 flex items-center flex-wrap gap-2">
                        {tags.map((t) => (
                            <div key={t} className="relative">
                                <button onClick={() => handleOpenTag(t)} className="px-2.5 py-1 rounded-full text-xs bg-secondary border border-border hover:bg-secondary/70">
                                    #{t}
                                </button>
                                {openTag === t && (
                                    <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-border rounded-lg shadow-xl p-2 z-50">
                                        <div className="px-2 py-1 text-xs text-muted-fg">Related to “{t}”</div>
                                        {tagLoading ? (
                                            <div className="px-2 py-2 text-sm text-muted-fg">Loading…</div>
                                        ) : tagResults.length > 0 ? (
                                            <div className="flex flex-col">
                                                {tagResults.map((it, idx) => (
                                                    <a key={idx} href={it.url} className="px-2 py-1.5 rounded hover:bg-secondary text-sm">{it.title}</a>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-2 py-2 text-sm text-muted-fg">No related items</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {/* Render Markdown content */}
                <hr style={{ borderTop: '1px solid grey', margin: '20px 0' }} />
                <ReactMarkdown
                    className="markdown"
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code: ({ className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '')
                            const language = match ? match[1] : 'text'
                            
                            if (match) {
                                // Handle children more robustly
                                let codeContent = ''
                                
                                if (Array.isArray(children)) {
                                    codeContent = children.map(child => {
                                        if (typeof child === 'string') {
                                            return child
                                        }
                                        // For non-string children, try to extract text content
                                        if (typeof child === 'object' && child !== null) {
                                            // If it's a React element with children, extract text
                                            if (child.props && child.props.children) {
                                                return child.props.children
                                            }
                                            // Otherwise, convert to string
                                            return String(child)
                                        }
                                        return String(child || '')
                                    }).join('')
                                } else if (typeof children === 'string') {
                                    codeContent = children
                                } else {
                                    // For any other type, convert to string
                                    codeContent = String(children || '')
                                }
                                
                                return (
                                    <CodeBlock
                                        language={language}
                                        className={className}
                                    >
                                        {codeContent.replace(/\n$/, '')}
                                    </CodeBlock>
                                )
                            }
                            
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            )
                        },
                        blockquote: ({ children, ...props }) => (
                            <blockquote className="alert alert-info" {...props}>
                                {children}
                            </blockquote>
                        ),
                        table: ({ children, ...props }) => (
                            <div className="overflow-x-auto">
                                <table {...props}>{children}</table>
                            </div>
                        ),
                        img: ({ src, alt, ...props }) => (
                            <img 
                                src={src} 
                                alt={alt} 
                                className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                                {...props} 
                            />
                        ),
                        h1: ({ children, ...props }) => (
                            <h1 className="scroll-mt-20" {...props}>
                                {children}
                            </h1>
                        ),
                        h2: ({ children, ...props }) => (
                            <h2 className="scroll-mt-16" {...props}>
                                {children}
                            </h2>
                        ),
                        h3: ({ children, ...props }) => (
                            <h3 className="scroll-mt-16" {...props}>
                                {children}
                            </h3>
                        ),
                        pre: ({ children, ...props }) => {
                            // Check if this pre contains a code element with language
                            if (children && typeof children === 'object' && 'props' in children) {
                                const childProps = children.props
                                if (childProps && childProps.className && childProps.className.includes('language-')) {
                                    // Let our code component handle this
                                    return <>{children}</>
                                }
                            }
                            return <pre {...props}>{children}</pre>
                        }
                    }}
                >
                    {contentWithoutTags}
                </ReactMarkdown>

                {/* Delete Confirmation */}
                <Modal isOpen={isDeleteOpen} onOpenChange={() => setIsDeleteOpen(false)}>
                    <Modal.Content>
                        <Modal.Header>Delete Article?</Modal.Header>
                        <div className="p-2">
                            <p className="text-sm text-muted-fg">This action cannot be undone. The article will be permanently removed.</p>
                        </div>
                        <Modal.Footer>
                            <Button appearance="outline" onPress={() => setIsDeleteOpen(false)}>Cancel</Button>
                            <Button intent="danger" onPress={() => { setIsDeleteOpen(false); deleteItem(page.id) }}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>
                </div>
                
                {/* Table of Contents Sidebar */}
                <div className="hidden xl:block w-72 flex-shrink-0">
                    <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
                        <TableOfContents />
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
                <Modal.Content>
                    <Modal.Header>Edit Page</Modal.Header>
                    <Form>
                        <TextField
                            label="Title"
                            value={editTitle}
                            onChange={(value: string) => setEditTitle(value)}
                            placeholder="Enter title"
                        />
                    </Form>
                    <Modal.Footer>
                        <Button appearance="outline" onPress={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button appearance="solid" intent="success" onPress={handleSave}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </AppLayout>
    )
}

export default Page
