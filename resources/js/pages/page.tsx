import { AppLayout } from '@/layouts/app-layout'
import { PagePropsData } from '@/types'
import { csrfToken, Page as pagetype, Project, SidebarSection } from '@/types/type'
import { Head, usePage } from '@inertiajs/react'
import 'highlight.js/styles/github.css'
import { IconPencilBox, IconTrash } from 'justd-icons'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { Button, Form, Modal, TextField } from 'ui'
import '../../css/markdown-content.css'

interface PageProps {
    page: pagetype
    sidebarSections: SidebarSection[]
    projects: Project[]
}

const Page: React.FC<PageProps> = ({ page, projects }) => {
    const { auth } = usePage<PagePropsData>().props

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editTitle, setEditTitle] = useState(page.title)
    const [editContent, setEditContent] = useState(page.content)
    const [loading, setLoading] = useState(false)

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

    return (
        <AppLayout projects={projects}>
            <Head>
                <title>{page.title} - BINTANGMFHD</title>
                <meta name="description" content={page.content.slice(0, 150)} />
                <meta property="og:title" content={page.title} />
                <meta property="og:description" content={page.content.slice(0, 150)} />
                <meta
                    property="og:image"
                    content="https://bintangmfhd.s3.ap-southeast-3.amazonaws.com/photos/1/Tech/64e0bb014746fpueucwmxjg.png"
                />
                <meta property="og:url" content={`https://docs.bintangmfhd.com/page/${page.slug}`} />
                <meta
                    name="keywords"
                    content={`default, keywords, for, the, ${page.title}, bintangmfhd, bintang miftaqul huda`}
                />
                <meta name="twitter:title" content={page.title} />
                <meta name="twitter:description" content={page.content.slice(0, 150)} />
                <meta
                    name="twitter:image"
                    content="https://bintangmfhd.s3.ap-southeast-3.amazonaws.com/photos/1/Tech/64e0bb014746fpueucwmxjg.png"
                />
            </Head>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                    {page.title}{' '}
                    {auth.user && (
                        <span className="ml-2 flex space-x-2">
                            <IconPencilBox
                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                onClick={() => handleEdit(page.id)}
                            />
                            <IconTrash
                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                onClick={() => handleDelete(page.id)}
                            />
                        </span>
                    )}
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
