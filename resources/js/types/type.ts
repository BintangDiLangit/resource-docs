// resources/js/types.ts

import { IconCreditCard, IconDashboard } from 'justd-icons'
import { FC, SVGProps } from 'react'

export interface SidebarItem {
    id: number
    title: string
    url: string
    page: Page
    is_current: boolean
}

export interface SidebarSection {
    id: number
    title_section: string
    sidebar_items: SidebarItem[]
}

export interface Project {
    name: string
    href: string
    icon: string
}

export interface AppLayoutProps {
    children: React.ReactNode
    sidebarSections: SidebarSection[]
    projects: Project[]
}

export const iconMap: { [key: string]: FC<SVGProps<SVGSVGElement>> } = {
    IconDashboard: IconDashboard,
    IconCreditCard: IconCreditCard
}

export const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

export interface Page {
    id: number
    title: string
    slug: string
    content: string
    sidebar_item_id: number
}
