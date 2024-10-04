import { Button, Select, TextField } from '@/components/ui'
import { SidebarItem, SidebarSection } from '@/types/type'
import { IconSidebar } from 'justd-icons'
import React, { useState } from 'react'

interface EditDataProps {
    sidebarSections: SidebarSection[]
}

const EditDataComponent: React.FC<EditDataProps> = ({ sidebarSections }) => {
    const [isFieldEditVisible, setIsEditFieldVisible] = useState(false)
    const [selectedSidebarItem, setSelectedSidebarItem] = useState<SidebarItem | null>(null)
    const handleSelectChange = (sidebarItem: SidebarItem) => {
        setSelectedSidebarItem(sidebarItem)
    }

    const handleEditDataClick = () => {
        setIsEditFieldVisible(!isFieldEditVisible)
    }

    return (
        <div className="container mx-auto p-4">
            {/* Button aligned to the right */}
            <Button onPress={handleEditDataClick} intent="success" className="mt-5 mb-10 flex">
                Edit Data
            </Button>

            {/* Conditionally render form field */}
            {isFieldEditVisible && (
                <>
                    {sidebarSections.length > 0 ? (
                        <Select
                            aria-label="Menu"
                            placeholder="Select a menu"
                            onSelectionChange={(key) => {
                                const selectedSection = sidebarSections.find((ss) =>
                                    ss.sidebar_items.some((si) => si.id === key)
                                )
                                const selectedItem = selectedSection?.sidebar_items.find((si) => si.id === key)
                                if (selectedItem) {
                                    handleSelectChange(selectedItem)
                                }
                            }}
                        >
                            <Select.Trigger />
                            <Select.List items={sidebarSections}>
                                {(ss) => (
                                    <Select.Section title={ss.title_section} items={ss.sidebar_items}>
                                        {(si) => (
                                            <Select.Option key={si.id} textValue={si.title}>
                                                <IconSidebar />
                                                {si.title}
                                            </Select.Option>
                                        )}
                                    </Select.Section>
                                )}
                            </Select.List>
                        </Select>
                    ) : (
                        <p>No sidebar sections available.</p>
                    )}

                    {/* Render Form for Selected Sidebar Item and Page */}
                    {selectedSidebarItem && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-4">Edit Sidebar Item and Page</h2>

                            <form>
                                {/* Sidebar Item Form */}
                                <div className="mb-4">
                                    <TextField
                                        value={selectedSidebarItem.title}
                                        onChange={(value) =>
                                            setSelectedSidebarItem({
                                                ...selectedSidebarItem,
                                                title: value
                                            })
                                        }
                                        label="Sidebar Item Title"
                                        className="mb-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <TextField
                                        label="Sidebar Item URL"
                                        type="text"
                                        value={selectedSidebarItem.url}
                                        onChange={(value) =>
                                            setSelectedSidebarItem({
                                                ...selectedSidebarItem,
                                                url: value
                                            })
                                        }
                                    />
                                </div>

                                {/* Associated Page Form */}
                                {selectedSidebarItem.page && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-lg font-semibold">Page Title</label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={selectedSidebarItem.page.title}
                                                onChange={(e) =>
                                                    setSelectedSidebarItem({
                                                        ...selectedSidebarItem,
                                                        page: {
                                                            ...selectedSidebarItem.page,
                                                            title: e.target.value
                                                        }
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-lg font-semibold">Page Slug</label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={selectedSidebarItem.page.slug}
                                                onChange={(e) =>
                                                    setSelectedSidebarItem({
                                                        ...selectedSidebarItem,
                                                        page: {
                                                            ...selectedSidebarItem.page,
                                                            slug: e.target.value
                                                        }
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-lg font-semibold">Page Content</label>
                                            <textarea
                                                className="textarea textarea-bordered w-full"
                                                value={selectedSidebarItem.page.content}
                                                onChange={(e) =>
                                                    setSelectedSidebarItem({
                                                        ...selectedSidebarItem,
                                                        page: {
                                                            ...selectedSidebarItem.page,
                                                            content: e.target.value
                                                        }
                                                    })
                                                }
                                            />
                                        </div>
                                    </>
                                )}

                                <Button onPress={() => alert('Pressed')}>Save Changes</Button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default EditDataComponent
