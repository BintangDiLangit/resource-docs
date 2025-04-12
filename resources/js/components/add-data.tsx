'use client'

import { Button, Select, TextField } from '@/components/ui'
import MDEditor from '@uiw/react-md-editor'
import type React from 'react'
import { useEffect, useState } from 'react'

import type { SidebarItem, SidebarSection } from '@/types/type'
import { csrfToken } from '@/types/type'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Loader } from './ui/loader'

interface AddDataProps {
    sidebarSections: SidebarSection[]
}

const AddDataComponent: React.FC<AddDataProps> = ({ sidebarSections }) => {
    const [isFieldEditVisible, setIsFieldEditVisible] = useState(false)
    const [selectedSidebarSection, setSelectedSidebarSection] = useState<SidebarSection | null>(null)
    const [selectedSidebarItem, setSelectedSidebarItem] = useState<SidebarItem | null>(null)
    const [isCreatingNewSection, setIsCreatingNewSection] = useState(false)
    const [isCreatingNewItem, setIsCreatingNewItem] = useState(false)
    const [markdownContent, setMarkdownContent] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedSidebarItem) {
            if (selectedSidebarItem.id) {
                fetch(`/settings/get-page/${selectedSidebarItem.id}`)
                    .then((response) => response.json())
                    .then((data) => {
                        setMarkdownContent(data.content || '')
                    })
                    .catch((error) => {
                        toast.error('Error fetching page content.')
                        console.error('Error fetching page content:', error)
                    })
            }
        }
    }, [selectedSidebarItem])

    // Save changes to the backend controller
    const handleSaveChanges = async () => {
        setLoading(true)
        if (!selectedSidebarItem) {
            toast.warning('Please select a Sidebar Item.')
            setLoading(false)
            return
        }

        if (!selectedSidebarSection) {
            toast.warning('Please select a Sidebar Section.')
            setLoading(false)
            return
        }

        const payload = {
            sidebarSectionId: selectedSidebarSection.id,
            sidebarSectionName: selectedSidebarSection.title_section,
            sidebarItemId: selectedSidebarItem.id,
            sidebarItemName: selectedSidebarItem.title,
            content: markdownContent
        }

        fetch('/settings/update-page', {
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
                    router.reload({
                        onSuccess: () => toast.success('Page was updated')
                    })
                } else {
                    toast.error('Failed to update the content')
                }
            })
            .catch((error) => {
                console.error('Error updating content:', error)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    const handleAddDataClick = () => {
        setIsFieldEditVisible(!isFieldEditVisible)
    }

    return (
        <div className="container mx-auto p-4" data-color-mode="dark">
            <Button onPress={handleAddDataClick} intent="success" className="mt-5 mb-10 flex">
                + Add Data
            </Button>

            {isFieldEditVisible && (
                <>
                    {/* Sidebar Section */}
                    <div className="mt-5">
                        <h3 className="text-lg font-semibold mb-2">Select or Create Sidebar Section</h3>
                        <div className="mb-4 flex">
                            {!isCreatingNewSection ? (
                                <Select
                                    aria-label="Sidebar Section"
                                    placeholder="Select a Sidebar Section"
                                    onSelectionChange={(key) => {
                                        const selectedSection = sidebarSections.find((ss) => ss.id === key)
                                        if (selectedSection) {
                                            setSelectedSidebarSection(selectedSection)
                                            setIsCreatingNewSection(false)
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
                                    label="New Sidebar Section Title"
                                    placeholder="Enter section title"
                                    onChange={(value) => {
                                        setSelectedSidebarSection({ id: 0, title_section: value, sidebar_items: [] })
                                    }}
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
                                            const selectedItem = selectedSidebarSection.sidebar_items.find(
                                                (si) => si.id === key
                                            )
                                            if (selectedItem) {
                                                setSelectedSidebarItem(selectedItem)
                                            }
                                        }}
                                    >
                                        <Select.Trigger />
                                        <Select.List items={selectedSidebarSection.sidebar_items}>
                                            {(si) => (
                                                <Select.Option key={si.id} textValue={si.title}>
                                                    {si.title}
                                                </Select.Option>
                                            )}
                                        </Select.List>
                                    </Select>
                                ) : (
                                    <TextField
                                        label="New Sidebar Item Title"
                                        placeholder="Enter item title"
                                        onChange={(value) => {
                                            setSelectedSidebarItem({
                                                id: 0,
                                                title: value,
                                                url: '',
                                                is_current: false,
                                                page: {
                                                    title: '',
                                                    slug: '',
                                                    content: '',
                                                    id: 0,
                                                    sidebar_item_id: 0
                                                }
                                            })
                                        }}
                                    />
                                )}

                                <Button onPress={() => setIsCreatingNewItem(!isCreatingNewItem)} className="ml-4">
                                    {isCreatingNewItem ? 'Cancel' : '+'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Page Markdown Editor */}
                    {selectedSidebarItem && (
                        <div className="mt-5">
                            <h3 className="text-lg font-semibold mb-2">Page Content (Markdown)</h3>
                            <div className="dark-mode-editor">
                                <MDEditor
                                    value={markdownContent}
                                    onChange={(value) => setMarkdownContent(value || '')}
                                    height={500}
                                    preview="live"
                                    data-color-mode="dark"
                                />
                            </div>
                        </div>
                    )}
                    {loading ? (
                        <Button className="mt-8" isDisabled>
                            <Loader variant="ring" /> Processing
                        </Button>
                    ) : (
                        <Button onPress={handleSaveChanges} className="mt-8">
                            Save Changes
                        </Button>
                    )}
                </>
            )}
        </div>
    )
}

export default AddDataComponent
