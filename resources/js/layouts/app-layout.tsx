import { Loader } from '@/components/ui/loader'
import type { PagePropsData } from '@/types'
import type { AppLayoutProps, SidebarSection } from '@/types/type'
import { iconMap } from '@/types/type'
import { csrfToken } from '@/types/type'
import { usePage } from '@inertiajs/react'
import { IconBell, IconBitcoin, IconBrain, IconLogout, IconPerson, IconSearch, IconSettings, IconChevronLeft, IconChevronRight, IconHamburger } from 'justd-icons'
import type React from 'react'
import { useCallback, useEffect, useRef, useState }  from 'react'

// Extend Window interface to include scrollTimeout
declare global {
    interface Window {
        scrollTimeout?: NodeJS.Timeout;
    }
}
import { Toaster } from 'sonner'
import { Aside, Avatar, Button, Link, Menu, SearchField } from 'ui'
export const AppLayout: React.FC<AppLayoutProps> = ({ children, projects = [] }) => {
    const { auth } = usePage<PagePropsData>().props
    const [sidebarSections, setSidebarSections] = useState<SidebarSection[]>([])
    const [sidebarLoading, setSidebarLoading] = useState(false)
    const [isClient, setIsClient] = useState(typeof window !== 'undefined')

    const [searchQuery, setSearchQuery] = useState('')
    const sidebarScrollRef = useRef<HTMLDivElement>(null)
    const [sidebarScrollPosition, setSidebarScrollPosition] = useState(0)
    
    // Collapsible sidebar state
    const [isCollapsed, setIsCollapsed] = useState(false)
    
    // Initialize collapsed state from localStorage on desktop only
    useEffect(() => {
        const initializeCollapsedState = () => {
            if (typeof window !== 'undefined') {
                // Only apply collapsible behavior on desktop (>= 1024px)
                if (window.innerWidth >= 1024) {
                    const savedCollapsedState = localStorage.getItem('sidebarCollapsed')
                    setIsCollapsed(savedCollapsedState === 'true')
                } else {
                    // On mobile, always keep expanded (let Aside.Layout handle mobile behavior)
                    setIsCollapsed(false)
                }
            }
        }

        // Initialize on mount
        initializeCollapsedState()

        // Add resize listener
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', initializeCollapsedState)
            return () => window.removeEventListener('resize', initializeCollapsedState)
        }
    }, [])

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
     * Initial load - only fetch sidebar data once
     */
    useEffect(() => {
        // Only fetch data on client side
        if (typeof window !== 'undefined') {
            fetchSidebarData()
        }
    }, []) // Empty dependency array to run only once on mount

    // Fallback: if no data after 3 seconds, try to fetch again (only if client and no search)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isClient && sidebarSections.length === 0 && !sidebarLoading && searchQuery.trim() === '') {
                fetchSidebarData()
            }
        }, 3000)

        return () => clearTimeout(timer)
    }, [sidebarSections.length, sidebarLoading, isClient, searchQuery])

    /**
     * Whenever searchQuery changes, decide whether to show the full list or fetch filtered data
    */
    useEffect(() => {
        // Only process search if client is ready
        if (!isClient) return
        
        if (searchQuery.trim() === '') {
        // If search is empty and we have no data, fetch it
        if (sidebarSections.length === 0) {
        fetchSidebarData()
        }
        } else {
        // Otherwise fetch server-side filtered data
        fetchSearchData(searchQuery)
        }
    }, [searchQuery, isClient])

    /**
     * Preserve sidebar scroll position (debounced)
     */
    const handleSidebarScroll = useCallback(() => {
        if (sidebarScrollRef.current) {
            const scrollTop = sidebarScrollRef.current.scrollTop
            // Debounce scroll position updates
            clearTimeout(window.scrollTimeout)
            window.scrollTimeout = setTimeout(() => {
                setSidebarScrollPosition(scrollTop)
            }, 100)
        }
    }, [])

    /**
     * Restore sidebar scroll position after content updates
     */
    useEffect(() => {
        if (sidebarScrollRef.current && sidebarScrollPosition > 0) {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                if (sidebarScrollRef.current) {
                    sidebarScrollRef.current.scrollTop = sidebarScrollPosition
                }
            })
        }
    }, [sidebarSections, sidebarScrollPosition])

    /**
     * Store scroll position in sessionStorage for persistence across navigations
     */
    useEffect(() => {
        if (typeof window !== 'undefined' && sidebarScrollPosition > 0) {
            sessionStorage.setItem('sidebarScrollPosition', sidebarScrollPosition.toString())
        }
    }, [sidebarScrollPosition])

    /**
     * Restore scroll position from sessionStorage on mount
     */
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedScrollPosition = sessionStorage.getItem('sidebarScrollPosition')
            if (savedScrollPosition) {
                const position = parseInt(savedScrollPosition, 10)
                setSidebarScrollPosition(position)
            }
        }
    }, [])

    /**
     * Toggle sidebar collapse state (only on desktop)
     */
    const toggleSidebar = useCallback(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            const newCollapsedState = !isCollapsed
            setIsCollapsed(newCollapsedState)
            localStorage.setItem('sidebarCollapsed', newCollapsedState.toString())
            console.log('🔄 Sidebar toggled:', newCollapsedState ? 'collapsed' : 'expanded')
            
            // Direct DOM manipulation as fallback
            setTimeout(() => {
                const sidebarElement = document.querySelector('.fixed.inset-y-0.left-0, [data-slot="aside"]') as HTMLElement
                if (sidebarElement) {
                    const targetWidth = newCollapsedState ? '4rem' : '17rem'
                    sidebarElement.style.width = targetWidth
                    sidebarElement.style.minWidth = targetWidth
                    sidebarElement.style.transition = 'width 0.3s ease-in-out, min-width 0.3s ease-in-out'
                    console.log('🎯 Direct DOM manipulation applied:', targetWidth)
                }
                
                const mainElement = document.querySelector('main') as HTMLElement
                if (mainElement) {
                    const targetPadding = newCollapsedState ? '4rem' : '17rem'
                    mainElement.style.paddingLeft = targetPadding
                    mainElement.style.transition = 'padding-left 0.3s ease-in-out'
                    console.log('🎯 Main padding applied:', targetPadding)
                }
            }, 50)
        } else {
            console.log('❌ Toggle blocked: not desktop or window unavailable')
        }
    }, [isCollapsed])

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
                className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
                style={{
                    '--sidebar-width': isCollapsed ? '4rem' : '17rem'
                } as React.CSSProperties}
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
                            <div className="flex items-center justify-between">
                                <Link className={`flex items-center gap-x-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} href="#">
                                <IconBitcoin />
                                    {!isCollapsed && <strong>BINTANGMFHD</strong>}
                            </Link>
                                {/* Desktop-only toggle button */}
                                <div className="hidden lg:block">
                                    <Button
                                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                        appearance="plain"
                                        shape="circle"
                                        size="square-petite"
                                        onPress={toggleSidebar}
                                        className="transition-transform duration-300"
                                    >
                                        {isCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
                                    </Button>
                                </div>
                            </div>
                            {!isCollapsed && (
                            <SearchField
                                aria-label="Search"
                                placeholder="Search"
                                    className="pt-5 transition-all duration-300"
                                value={searchQuery}
                                onChange={(value: string) => setSearchQuery(value)}
                            />
                            )}
                        </Aside.Header>

                        <div className="flex h-full min-h-0 flex-col">
                            {/* Full Content - Show when expanded */}
                            {!isCollapsed && (
                                <div className="flex flex-col overflow-y-auto p-4 [&>section+section]:mt-8 transition-all duration-300">
                                    <div 
                                        ref={sidebarScrollRef}
                                        onScroll={handleSidebarScroll}
                                        className="overflow-y-auto max-h-[calc(100vh-12rem)]"
                                    >
                                        <div className="flex flex-col gap-y-0.5 mb-8">
                                            <h3 className="text-sm px-3 text-muted-fg font-medium">Overview</h3>
                                            {auth.user && (
                                                <Link 
                                                    href="/dashboard"
                                                    className="flex items-center gap-x-4 px-3 py-2 rounded-lg lg:text-sm leading-6 hover:bg-secondary text-secondary-fg transition-colors"
                                                >
                                                    Dashboard
                                                </Link>
                                            )}
                                            {projects.map((project) => (
                                                <Link 
                                                    key={project.name} 
                                                    href={project.href}
                                                    className="flex items-center gap-x-4 px-3 py-2 rounded-lg lg:text-sm leading-6 hover:bg-secondary text-secondary-fg transition-colors"
                                                >
                                                {project.name}
                                                </Link>
                                            ))}
                                        </div>
                                        {typeof window === 'undefined' || !isClient ? (
                                            <div className="flex flex-col gap-y-0.5 mb-8">
                                                <div className="flex items-center justify-center px-3 py-8">
                                                    <span className="text-sm text-muted-fg">Loading...</span>
                                                </div>
                                            </div>
                                        ) : sidebarLoading ? (
                                            <div className="flex flex-col gap-y-0.5 mb-8">
                                                <div className="flex items-center justify-center px-3 py-8">
                                                    <span className="text-sm text-muted-fg">Loading...</span>
                                                </div>
                                            </div>
                                        ) : sidebarSections.length > 0 ? (
                                            sidebarSections.map((section) => (
                                                <div key={section.id} className="flex flex-col gap-y-0.5 mb-6">
                                                    <h3 className="text-xs font-semibold px-3 py-2 text-accent-fg bg-accent/10 border-b border-border/50 uppercase tracking-wider">
                                                        {section.title_section}
                                                    </h3>
                                                    <div className="flex flex-col gap-y-0.5">
                                                        {section.sidebar_items?.map((item) => (
                                                            <Link 
                                                                key={item.id} 
                                                                href={item.url}
                                                                className={`
                                                                    block px-3 py-1.5 text-sm leading-relaxed rounded
                                                                    hover:bg-secondary text-secondary-fg transition-colors
                                                                    ${item.is_current ? 'bg-accent text-accent-fg font-medium' : 'text-fg'}
                                                                `}
                                                            >
                                                                {item.title}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col gap-y-0.5 mb-8">
                                                <div className="flex items-center justify-center px-3 py-8">
                                                    <span className="text-gray-500">No data available</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Collapsed Navigation Icons - Show when collapsed */}
                            {isCollapsed && (
                                <div className="flex flex-col items-center justify-center gap-4 p-4 h-full">
                                    <Link 
                                        href="/"
                                        className="p-3 rounded-lg hover:bg-secondary transition-colors"
                                        aria-label="Overview"
                                    >
                                        <IconBitcoin className="w-6 h-6" />
                                    </Link>
                                    {auth.user && (
                                        <Link 
                                            href="/dashboard"
                                            className="p-3 rounded-lg hover:bg-secondary transition-colors"
                                            aria-label="Dashboard"
                                        >
                                            <IconSettings className="w-6 h-6" />
                                        </Link>
                                    )}
                                    <Link 
                                        href="/support-me"
                                        className="p-3 rounded-lg hover:bg-secondary transition-colors"
                                        aria-label="Support Me"
                                    >
                                        <IconPerson className="w-6 h-6" />
                                    </Link>
                                    {auth.user && (
                                        <>
                                            <Link 
                                                href="/settings"
                                                className="p-3 rounded-lg hover:bg-secondary transition-colors"
                                                aria-label="Settings"
                                            >
                                                <IconSettings className="w-6 h-6" />
                                            </Link>
                                            <Link 
                                                href="/article-ai"
                                                className="p-3 rounded-lg hover:bg-secondary transition-colors"
                                                aria-label="Article AI"
                                            >
                                                <IconBrain className="w-6 h-6" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {auth.user ? (
                            <Aside.Footer className={`lg:flex lg:flex-row hidden items-center transition-all duration-300 ${isCollapsed ? 'justify-center p-2' : ''}`}>
                                <Menu>
                                    <Button
                                        appearance="plain"
                                        aria-label="Profile"
                                        className={`group flex transition-all duration-300 ${isCollapsed ? 'w-auto justify-center' : 'w-full justify-start'}`}
                                    >
                                        <Avatar
                                            size="extra-small"
                                            shape="square"
                                            className="-ml-1.5"
                                            src="https://github.com/BintangDiLangit.png"
                                        />
                                        {!isCollapsed && "Bintang Miftaqul Huda"}
                                    </Button>
                                    <Menu.Content placement="top" className="min-w-[--trigger-width]">
                                        <Menu.Item href="/dashboard">
                                            <IconSettings />
                                            Dashboard
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
