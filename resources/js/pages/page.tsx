import { AppLayout } from '@/layouts/app-layout'
import { PagePropsData } from '@/types'
import { csrfToken, Page as pagetype, Project, SidebarSection } from '@/types/type'
import { Head, usePage } from '@inertiajs/react'
import 'highlight.js/styles/github.css'
import { IconBrandFacebook, IconBrandLinkedin, IconBrandWhatsapp, IconBrandX, IconPencilBox, IconRocket, IconTrash } from 'justd-icons'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Button, Form, Modal, TextField } from 'ui'
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
    const [editTitle, setEditTitle] = useState(page.title)
    const [editContent, setEditContent] = useState(page.content)
    const [loading, setLoading] = useState(false)
    const [isShareOpen, setIsShareOpen] = useState(false);

    const handleEdit = (pageId: number) => {
        setIsModalOpen(true)
    }

    const handleDelete = (pageId: number) => {
        const confirmed = window.confirm(`Are you sure you want to delete this page?`)

        if (confirmed) {
            console.log('Deleting item:', pageId)
            deleteItem(pageId)
                .then((response) => {
                    console.log('Item deleted successfully:', response)
                })
                .catch((error) => {
                    console.error('Error deleting item:', error)
                })
        }
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
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                    {page.title}{' '}
                    <span className="ml-2 flex space-x-2">
                        {auth.user && (
                            <>
                                <IconPencilBox
                                    style={{ cursor: 'pointer', marginRight: '10px' }}
                                    onClick={() => handleEdit(page.id)}
                                />
                                <IconTrash
                                    style={{ cursor: 'pointer', marginRight: '10px' }}
                                    onClick={() => handleDelete(page.id)}
                                />
                            </>
                        )}

                        {/* Share Icon and Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsShareOpen(!isShareOpen)}
                                className="flex items-center space-x-1 p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                            >
                                <IconRocket/>
                            </button>
                            {isShareOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white border border-gray-600 rounded shadow-lg">
                                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-700">
                                        <IconBrandLinkedin/>
                                    </a>
                                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-700">
                                        <IconBrandX/>
                                    </a>
                                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-700">
                                        <IconBrandFacebook/>
                                    </a>
                                    <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-700">
                                        <IconBrandWhatsapp/>
                                    </a>
                                </div>
                            )}
                        </div>
                    </span>
                </h1>
                {/* Render Markdown content */}
                <hr style={{ borderTop: '1px solid grey', margin: '20px 0' }} />
                <ReactMarkdown
                    className="markdown"
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                    remarkPlugins={[remarkGfm]}
                    components={{}}
                >
                    {page.content}
                </ReactMarkdown>
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
