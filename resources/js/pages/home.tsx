import { Project, SidebarSection } from '@/types/type'
import { Container } from 'components/container'
import { Header } from 'components/header'
import { IconBrandJustd } from 'justd-icons'
import { Card, Grid, Link } from 'ui'
import { AppLayout } from '../layouts/app-layout'

const items = [
    {
        id: 1,
        name: 'Bintang Mf Hd.',
        url: 'https://bintangmfhd.com',
        icon: IconBrandJustd,
        description: 'Software Engineer.'
    }
]

interface HomeProps {
    sidebarSections: SidebarSection[]
    projects: Project[]
}

const Home = ({ sidebarSections, projects }: HomeProps) => {
    return (
        <AppLayout sidebarSections={sidebarSections} projects={projects}>
            <Header title="BINTANGMFHD Resources" />
            <Container>
                <div className="overflow-hidden rounded-lg border lg:border-border border-transparent">
                    <div>
                        <div className="sm:p-20">
                            <Link
                                href="https://bintangmfhd.com"
                                target="_blank"
                                className="grid place-content-center size-12 outline-1 outline-border rounded-full"
                            >
                                <img
                                    src="https://github.com/BintangDiLangit.png"
                                    alt="Bintang Miftaqul Huda"
                                    className="block size-7"
                                />
                            </Link>
                            <div className="max-w-2xl mb-8">
                                <div className="mt-6 text-xl sm:text-2xl">
                                    Documentation Platform by Bintang Miftaqul Huda
                                </div>
                                <div className="mt-4 text-muted-fg sm:text-lg">
                                    This platform serves as a comprehensive resource for developers and enthusiasts
                                    alike, offering detailed project documentation, tutorials, and guides to help you
                                    navigate the complexities of modern development!
                                </div>
                            </div>
                            <Grid columns={{ initial: 1, sm: 2 }} gap={4}>
                                <Grid.Collection items={items}>
                                    {(item) => (
                                        <Grid.Item className="relative" key={item.id}>
                                            <Link
                                                className="absolute inset-0 size-full"
                                                target="_blank"
                                                href={item.url}
                                            />
                                            <Card>
                                                <div className="px-6 pt-6">
                                                    <div className="size-8 grid place-content-center rounded-full border">
                                                        <item.icon />
                                                    </div>
                                                </div>
                                                <Card.Header>
                                                    <Card.Title>{item.name}</Card.Title>
                                                    <Card.Description>{item.description}</Card.Description>
                                                </Card.Header>
                                            </Card>
                                        </Grid.Item>
                                    )}
                                </Grid.Collection>
                            </Grid>
                        </div>
                    </div>
                </div>
            </Container>
        </AppLayout>
    )
}

export default Home
