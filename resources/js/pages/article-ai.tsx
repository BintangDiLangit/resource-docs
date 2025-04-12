import { Button, Select, TextField } from '@/components/ui'
import { AppLayout } from '@/layouts'
import { csrfToken, type Project, type SidebarSection } from '@/types/type'
import { Head } from '@inertiajs/react'
import MDEditor from '@uiw/react-md-editor'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface SettingProps {
    title: string
    content: string
    sidebarSections: SidebarSection[]
    projects: Project[]
}

const ArticleAIPage: React.FC<SettingProps> = ({ title, content, sidebarSections, projects }) => {
    const [selectedSidebarSection, setSelectedSidebarSection] = useState<SidebarSection | null>(null)
    const [selectedSidebarItem, setSelectedSidebarItem] = useState<any | null>(null)
    const [sidebarItems, setSidebarItems] = useState<any[]>([])
    const [isCreatingNewSection, setIsCreatingNewSection] = useState(false)
    const [isCreatingNewItem, setIsCreatingNewItem] = useState(false)
    const [newSidebarSectionName, setNewSidebarSectionName] = useState('')
    const [newSidebarItemName, setNewSidebarItemName] = useState('')
    const [markdownContent, setMarkdownContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [prompt, setPrompt] = useState('')

    useEffect(() => {
        if (selectedSidebarSection?.id) {
            axios
                .get(`/api/sidebar-items?section_id=${selectedSidebarSection.id}`)
                .then((res) => setSidebarItems(res.data))
                .catch(() => setSidebarItems([]))
        } else {
            setSidebarItems([])
        }
    }, [selectedSidebarSection])

    const handleSubmit = async () => {
        if (!selectedSidebarSection && !newSidebarSectionName) {
            toast.warning('Please select or create a Sidebar Section.')
            return
        }

        if (!selectedSidebarItem && !newSidebarItemName) {
            toast.warning('Please select or create a Sidebar Item.')
            return
        }

        console.log(selectedSidebarSection?.title_section)
        console.log(selectedSidebarItem?.title)

        setIsSubmitting(true)

        const payload = {
            sidebarSectionId: selectedSidebarSection?.id || null,
            sidebarSectionName: selectedSidebarSection?.title_section ?? '',
            sidebarItemId: selectedSidebarItem?.id || null,
            sidebarItemName: selectedSidebarItem?.title ?? '',
            content: markdownContent
        }

        try {
            const res = await fetch('/article/create-or-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken ?? ''
                },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Article submitted successfully!')
            } else {
                toast.error(data.message || 'Submission failed')
            }
        } catch (err) {
            console.error('Error submitting:', err)
            toast.error('An error occurred while submitting the article.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AppLayout projects={projects}>
            <Head title="AI Article Generator" />
            <div className="container mx-auto p-4" data-color-mode="dark">
                <h1 className="text-3xl font-bold mb-4">Create AI Article</h1>

                {/* Sidebar Section */}
                <div className="mt-5">
                    <h3 className="text-lg font-semibold mb-2">Select or Create Sidebar Section</h3>
                    <div className="mb-4 flex">
                        {!isCreatingNewSection ? (
                            <Select
                                aria-label="Sidebar Section"
                                placeholder="Select a Sidebar Section"
                                onSelectionChange={(key) => {
                                    const section = sidebarSections.find((s) => s.id === key)
                                    if (section) {
                                        setSelectedSidebarSection(section)
                                        setSelectedSidebarItem(null)
                                    }
                                }}
                            >
                                <Select.Trigger />
                                <Select.List items={sidebarSections}>
                                    {(ss) => (
                                        <Select.Option key={ss.id} textValue={ss.title_section}>
                                            {ss.title_section}
                                        </Select.Option>
                                    )}
                                </Select.List>
                            </Select>
                        ) : (
                            <TextField
                                label="New Sidebar Section"
                                placeholder="Enter section title"
                                onChange={(value) =>
                                    setSelectedSidebarSection({
                                        id: 0,
                                        title_section: value,
                                        sidebar_items: []
                                    })
                                }
                            />
                        )}

                        <Button onPress={() => setIsCreatingNewSection(!isCreatingNewSection)} className="ml-4">
                            {isCreatingNewSection ? 'Cancel' : '+'}
                        </Button>
                    </div>
                </div>

                {/* Sidebar Item */}
                {selectedSidebarSection && (
                    <div className="mt-5">
                        <h3 className="text-lg font-semibold mb-2">Select or Create Sidebar Item</h3>
                        <div className="mb-4 flex">
                            {!isCreatingNewItem ? (
                                <Select
                                    aria-label="Sidebar Item"
                                    placeholder="Select a Sidebar Item"
                                    onSelectionChange={(key) => {
                                        const item = sidebarItems.find((i) => i.id === key)
                                        if (item) {
                                            setSelectedSidebarItem(item)
                                        }
                                    }}
                                >
                                    <Select.Trigger />
                                    <Select.List items={sidebarItems}>
                                        {(item) => (
                                            <Select.Option key={item.id} textValue={item.title}>
                                                {item.title}
                                            </Select.Option>
                                        )}
                                    </Select.List>
                                </Select>
                            ) : (
                                <TextField
                                    label="New Sidebar Item"
                                    placeholder="Enter item title"
                                    onChange={(value) =>
                                        setSelectedSidebarItem({
                                            id: 0,
                                            title: value,
                                            url: '',
                                            is_current: false,
                                            page: null
                                        })
                                    }
                                />
                            )}

                            <Button onPress={() => setIsCreatingNewItem(!isCreatingNewItem)} className="ml-4">
                                {isCreatingNewItem ? 'Cancel' : '+'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Prompt Input for AI Generation */}
                <div className="mt-3">
                    <h3 className="text-base font-semibold mb-2">Prompt for AI</h3>
                    <textarea
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full rounded-md border border-gray-600 bg-black text-white p-2 resize-none"
                        placeholder="e.g. Explain how AI can help in education"
                    />
                    <Button
                        className="mt-1"
                        onPress={async () => {
                            if (!prompt.trim()) return toast.warning('Please enter a prompt first.')
                            toast.info('Generating...')
                            try {
                                const res = await axios.post('/generate-article', { prompt })
                                setMarkdownContent(res.data.markdown || '')
                                toast.success('Generated successfully!')
                            } catch (err) {
                                toast.error('Failed to generate article.')
                            }
                        }}
                    >
                        Generate with AI
                    </Button>
                </div>

                {/* Content Editor */}
                {selectedSidebarItem && (
                    <div className="mt-5">
                        <h3 className="text-lg font-semibold mb-2">Page Content (Markdown)</h3>
                        <div className="dark-mode-editor">
                            <MDEditor
                                value={markdownContent}
                                onChange={(val) => setMarkdownContent(val || '')}
                                height={400}
                                preview="live"
                                data-color-mode="dark"
                            />
                        </div>
                    </div>
                )}

                <Button onPress={handleSubmit} isDisabled={isSubmitting} className="mt-6">
                    {isSubmitting ? 'Submitting...' : 'Submit Article'}
                </Button>
            </div>
        </AppLayout>
    )
}

export default ArticleAIPage
