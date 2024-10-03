import { AppLayout } from '@/layouts/app-layout'
import { Project, SidebarSection } from '@/types/type'
import { Head } from '@inertiajs/react'
import React from 'react'
import ReactMarkdown from 'react-markdown'

interface PageProps {
    title: string
    content: string
    sidebarSections: SidebarSection[]
    projects: Project[]
}

const Page: React.FC<PageProps> = ({ title, content, sidebarSections, projects }) => {
    return (
        <AppLayout sidebarSections={sidebarSections} projects={projects}>
            <Head title={title} />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">{title}</h1>
                {/* Render Markdown content */}
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </AppLayout>
    )
}

export default Page
