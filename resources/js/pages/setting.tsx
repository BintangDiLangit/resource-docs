import AddDataComponent from '@/components/add-data'
import { AppLayout } from '@/layouts'
import { Project, SidebarSection } from '@/types/type'
import { Head } from '@inertiajs/react'
import React from 'react'

interface SettingProps {
    title: string
    content: string
    sidebarSections: SidebarSection[]
    projects: Project[]
}

const Setting: React.FC<SettingProps> = ({ title, content, sidebarSections, projects }) => {
    return (
        <AppLayout projects={projects}>
            <Head title="Setting" />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">{title}</h1>
                <AddDataComponent sidebarSections={sidebarSections} />
                {/* Edit Data Component */}
                {/* <EditDataComponent sidebarSections={sidebarSections} /> */}
            </div>
        </AppLayout>
    )
}

export default Setting
