import { Button, Card, Table } from '@/components/ui'
import { AppLayout } from '@/layouts'
import { PagePropsData } from '@/types/index'
import { SidebarSection } from '@/types/type'
import { Head, Link } from '@inertiajs/react'
import { 
    IconPencilBox, 
    IconEye, 
    IconFolder, 
    IconPlus, 
    IconSettings, 
    IconTrash,
    IconBrain,
    IconChart,
    IconClock
} from 'justd-icons'
import React from 'react'

interface DashboardStats {
    total_articles: number
    total_sections: number
    total_sidebar_items: number
}

interface RecentArticle {
    id: number
    title: string
    slug: string
    section: string
    updated_at: string
    url: string
}

interface ArticlesBySection {
    id: number
    title: string
    articles_count: number
    pages_count: number
}

interface DashboardProps extends PagePropsData {
    stats: DashboardStats
    recent_articles: RecentArticle[]
    articles_by_section: ArticlesBySection[]
    sidebarSections: SidebarSection[]
}

export default function Dashboard({ 
    auth, 
    stats, 
    recent_articles, 
    articles_by_section, 
    sidebarSections 
}: DashboardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const StatCard = ({ title, value, icon: Icon, color = "blue" }: {
        title: string
        value: number
        icon: React.ComponentType<any>
        color?: string
    }) => (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-fg">{title}</p>
                    <p className="text-2xl font-bold text-fg">{value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
                    <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
            </div>
        </Card>
    )

    return (
        <AppLayout projects={[]}>
            <Head title="Dashboard" />
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-fg">Welcome back, {auth.user.name}!</h1>
                        <p className="text-muted-fg">Your complete content management hub</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/article/create">
                            <Button intent="primary">
                                <IconPlus className="h-4 w-4" />
                                New Article
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Articles"
                        value={stats.total_articles}
                        icon={IconPencilBox}
                        color="blue"
                    />
                    <StatCard
                        title="Content Sections"
                        value={stats.total_sections}
                        icon={IconFolder}
                        color="green"
                    />
                    <StatCard
                        title="Sidebar Items"
                        value={stats.total_sidebar_items}
                        icon={IconChart}
                        color="purple"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Articles */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Recent Articles</Card.Title>
                            <Card.Description>Your latest content updates</Card.Description>
                        </Card.Header>
                        <Card.Content>
                            {recent_articles.length > 0 ? (
                                <div className="space-y-3">
                                    {recent_articles.map((article) => (
                                        <div key={article.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-fg truncate">{article.title}</h4>
                                                <p className="text-sm text-muted-fg">{article.section}</p>
                                                <p className="text-xs text-muted-fg flex items-center gap-1">
                                                    <IconClock className="h-3 w-3" />
                                                    {formatDate(article.updated_at)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Link href={article.url} target="_blank">
                                                    <Button size="small" appearance="plain" shape="circle">
                                                        <IconEye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/article/${article.id}/edit`}>
                                                    <Button size="small" appearance="plain" shape="circle">
                                                        <IconPencilBox className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-fg">
                                    <IconPencilBox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No articles found</p>
                                    <Link href="/article-ai">
                                        <Button className="mt-2" intent="primary" size="small">
                                            Create your first article
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Articles by Section */}
                    <Card>
                        <Card.Header>
                            <Card.Title>Articles by Section</Card.Title>
                            <Card.Description>Content distribution across sections</Card.Description>
                        </Card.Header>
                        <Card.Content>
                            {articles_by_section.length > 0 ? (
                                <div className="space-y-3">
                                    {articles_by_section.map((section) => (
                                        <div key={section.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div>
                                                <h4 className="font-medium text-fg">{section.title}</h4>
                                                <p className="text-sm text-muted-fg">
                                                    {section.pages_count} articles • {section.articles_count} items
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-primary">{section.pages_count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-fg">
                                    <IconFolder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No sections found</p>
                                </div>
                            )}
                        </Card.Content>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <Card.Header>
                        <Card.Title>Quick Actions</Card.Title>
                        <Card.Description>Common tasks for content management</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/article-ai">
                                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" intent="primary">
                                    <IconBrain className="h-6 w-6" />
                                    <span>Create New Article</span>
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2" intent="secondary">
                                    <IconEye className="h-6 w-6" />
                                    <span>View Live Site</span>
                                </Button>
                            </Link>
                        </div>
                    </Card.Content>
                </Card>
            </div>
        </AppLayout>
    )
}
