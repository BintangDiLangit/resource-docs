import { PagePropsData } from '@/types'
import { AppLayoutProps, csrfToken, iconMap } from '@/types/type'
import { usePage } from '@inertiajs/react'
import { IconBell, IconBitcoin, IconLogout, IconPerson, IconSearch, IconSettings } from 'justd-icons'
import React from 'react'
import { Aside, Avatar, Button, Link, Menu, SearchField } from 'ui'

export const AppLayout: React.FC<AppLayoutProps> = ({ children, sidebarSections = [], projects = [] }) => {
    const { auth } = usePage<PagePropsData>().props
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
                console.error('Logout failed')
            }
        } catch (error) {
            console.error('Error during logout:', error)
        }
    }

    return (
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
                        <SearchField aria-label="Search" placeholder="Search" className={'pt-5'} />
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
                        {sidebarSections.map((section) => (
                            <Aside.Section key={section.id} title={section.title_section}>
                                {section.sidebar_items?.map((item) => (
                                    <Aside.Item key={item.id} href={item.url} isCurrent={item.is_current}>
                                        {' '}
                                        {item.title}
                                    </Aside.Item>
                                ))}
                            </Aside.Section>
                        ))}
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
    )
}
