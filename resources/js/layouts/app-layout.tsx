import { Loader } from '@/components/ui/loader'
import type { PagePropsData } from '@/types'
import type { AppLayoutProps, SidebarSection } from '@/types/type'
import { iconMap } from '@/types/type'
import { csrfToken } from '@/types/type'
import { usePage } from '@inertiajs/react'
import { IconBell, IconBitcoin, IconBrain, IconLogout, IconPerson, IconSearch, IconSettings } from 'justd-icons'
import type React from 'react'
import { useEffect, useState }  from 'react'
import { Toaster } from 'sonner'
import { Aside, Avatar, Button, Link, Menu, SearchField } from 'ui'
export const AppLayout: React.FC<AppLayoutProps> = ({ children, projects = [] }) => {
    const { auth } = usePage<PagePropsData>().props
    const [sidebarSections, setSidebarSections] = useState<SidebarSection[]>([])
    const [sidebarLoading, setSidebarLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState('')

    /**
     * Fetch the entire sidebar data (e.g., on page load)
     */
    const fetchSidebarData = async () => {
        try {
        setSidebarLoading(true)
        const response = await fetch('/sidebar-data', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''
            }
        })
        if (!response.ok) {
            throw new Error('Failed to fetch sidebar data')
        }
        const data = await response.json()
        setSidebarSections(data)
        } catch (error) {
        console.error('Failed to fetch sidebar data:', error)
        } finally {
        setSidebarLoading(false)
        }
    }


    /**
     * Fetch the server-side filtered data based on searchQuery
     */
    const fetchSearchData = async (query: string) => {
        try {
        setSidebarLoading(true)
        // Send the search query to /search, adjust the route/params as needed
        const response = await fetch(`/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''
            }
        })
        if (!response.ok) {
            throw new Error('Failed to fetch search results')
        }
        const data = await response.json()
        // Update the sidebar with filtered data from the server
        setSidebarSections(data)
        } catch (error) {
        console.error('Search error:', error)
        } finally {
        setSidebarLoading(false)
        }
    }

    /**
     * Whenever searchQuery changes, decide whether to show the full list or fetch filtered data
    */
    useEffect(() => {
        if (searchQuery.trim() === '') {
        // If search is empty, restore the full sidebar data
        fetchSidebarData()
        } else {
        // Otherwise fetch server-side filtered data
        fetchSearchData(searchQuery)
        }
        // We only want to trigger this when `searchQuery` changes
        // so we leave fetchSidebarData out of the dependency array
        // to avoid re-fetching the full list unnecessarily
    }, [searchQuery])

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                }
            })

            if (response.ok) {
                console.log('Logged out successfully')
                window.location.reload()
            } else {
                console.error('Logout failed')
            }
        } catch (error) {
            console.error('Error during logout:', error)
        }
    }

    const handleLogin = async () => {
        try {
            const response = await fetch('/login', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                }
            })

            if (response.ok) {
                window.location.href = '/login'
            } else {
                console.error('Login failed')
            }
        } catch (error) {
            console.error('Error during login:', error)
        }
    }

    return (
        <>
            <Toaster position="top-right" richColors />
            <Aside.Layout
                navbar={
                    <Aside.Responsive>
                        <Button aria-label="Inbox" appearance="plain" shape="circle" size="square-petite">
                            <IconBell />
                        </Button>
                        <Button aria-label="Search" appearance="plain" shape="circle" size="square-petite">
                            <IconSearch />
                        </Button>
                        <Menu>
                            <Button
                                appearance="plain"
                                size="square-petite"
                                shape="circle"
                                aria-label="Profile"
                                className="group"
                            >
                                <Avatar size="medium" src="https://github.com/BintangDiLangit.png" />
                            </Button>
                        </Menu>
                    </Aside.Responsive>
                }
                aside={
                    <>
                        <Aside.Header>
                            <Link className="flex items-center gap-x-2" href="#">
                                <IconBitcoin />
                                <strong>BINTANGMFHD</strong>
                            </Link>
                            <SearchField
                                aria-label="Search"
                                placeholder="Search"
                                className="pt-5"
                                value={searchQuery}
                                onChange={(value: string) => setSearchQuery(value)}
                            />
                        </Aside.Header>

                        <Aside.Content>
                            <Aside.Section key="overview" title="Overview">
                                {projects.map((project) => {
                                    const IconComponent = iconMap[project.icon]

                                    return (
                                        <Aside.Item key={project.name} href={project.href} icon={IconComponent}>
                                            {project.name}
                                        </Aside.Item>
                                    )
                                })}
                            </Aside.Section>
                            {sidebarLoading ? (
                                <Aside.Section title="">
                                    <Aside.Item href="#">
                                        <Loader variant="bars" />
                                    </Aside.Item>
                                </Aside.Section>
                            ) : (
                                sidebarSections.map((section) => (
                                    <Aside.Section key={section.id} title={section.title_section}>
                                        {section.sidebar_items?.map((item) => (
                                            <Aside.Item key={item.id} href={item.url} isCurrent={item.is_current}>
                                                {item.title}
                                            </Aside.Item>
                                        ))}
                                    </Aside.Section>
                                ))
                            )}
                        </Aside.Content>
                        {auth.user ? (
                            <Aside.Footer className="lg:flex lg:flex-row hidden items-center">
                                <Menu>
                                    <Button
                                        appearance="plain"
                                        aria-label="Profile"
                                        className="group w-full justify-start flex"
                                    >
                                        <Avatar
                                            size="extra-small"
                                            shape="square"
                                            className="-ml-1.5"
                                            src="https://github.com/BintangDiLangit.png"
                                        />
                                        Bintang Miftaqul Huda
                                    </Button>
                                    <Menu.Content placement="top" className="min-w-[--trigger-width]">
                                        <Menu.Item href="/settings">
                                            <IconSettings />
                                            Settings
                                        </Menu.Item>
                                        <Menu.Item href="/article-ai">
                                            <IconBrain />
                                            Article AI
                                        </Menu.Item>
                                        <Menu.Separator />
                                        <Menu.Item href="#" onAction={handleLogout}>
                                            <IconLogout />
                                            Log out
                                        </Menu.Item>
                                    </Menu.Content>
                                </Menu>
                            </Aside.Footer>
                        ) : (
                            <Aside.Footer className="lg:flex lg:flex-row hidden items-center">
                                <Menu>
                                    <Button
                                        appearance="plain"
                                        aria-label="Profile"
                                        className="group w-full justify-start flex"
                                        onPress={handleLogin}
                                    >
                                        <IconPerson />
                                        Login
                                    </Button>
                                </Menu>
                            </Aside.Footer>
                        )}
                    </>
                }
            >
                <main className="relative">{children}</main>
            </Aside.Layout>
        </>
    )
}
