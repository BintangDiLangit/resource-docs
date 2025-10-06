import DonationCard from '@/components/donation-card'
import { Project, SidebarSection } from '@/types/type'
import { Container } from 'components/container'
import { Header } from 'components/header'
import { IconBrandInstagram, IconBrandJustd, IconBrandLinkedin, IconBrandYoutube } from 'justd-icons'
import { Grid, Link } from 'ui'
import { AppLayout } from '../layouts/app-layout'

const items = [
    {
        id: 1,
        imageUrl: '/images/GOPAY.jpeg',
        name: 'Bintang Miftaqul Huda.',
        icon: IconBrandJustd,
        description: 'Gopay'
    },
    {
        id: 2,
        imageUrl: '/images/SHOPEE.png',
        name: 'Bintang Miftaqul Huda.',
        icon: IconBrandJustd,
        description: 'Shopee'
    }
]

interface SupportMeProps {
    sidebarSections: SidebarSection[]
    projects: Project[]
}
const Home = ({ projects }: SupportMeProps) => {
    return (
        <AppLayout projects={projects}>
            <Header title="Support Me" />
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
                                    Support my journey by following me on social media or consider making a contribution
                                    to help grow this project!
                                </div>
                                <div className="mt-4 text-muted-fg sm:text-lg flex space-x-4">
                                    <Link
                                        href="https://www.instagram.com/bintangmf_hd"
                                        target="_blank"
                                        className="grid place-content-center size-12 outline-1 outline-border rounded-full"
                                    >
                                        <IconBrandInstagram />
                                    </Link>
                                    <Link
                                        href="https://www.linkedin.com/in/bintangmfhd"
                                        target="_blank"
                                        className="grid place-content-center size-12 outline-1 outline-border rounded-full"
                                    >
                                        <IconBrandLinkedin />
                                    </Link>
                                    <Link
                                        href="https://bintangmfhd.medium.com"
                                        target="_blank"
                                        className="grid place-content-center size-12 outline-1 outline-border rounded-full"
                                    >
                                        <IconBrandJustd />
                                    </Link>
                                    <Link
                                        href="https://youtube.com/@BintangDiLangit"
                                        target="_blank"
                                        className="grid place-content-center size-12 outline-1 outline-border rounded-full"
                                    >
                                        <IconBrandYoutube />
                                    </Link>
                                </div>
                            </div>
                            <Grid columns={{ initial: 1, sm: 2 }} gap={4}>
                                <Grid.Collection items={items}>
                                    {(item) => <DonationCard item={item} />}
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
