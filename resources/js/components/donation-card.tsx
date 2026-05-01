import { useState } from 'react'
import { Card } from './ui'

interface DonationCardItem {
    id: number
    imageUrl: string
    name: string
    description: string
}

interface DonationCardProp {
    item: DonationCardItem
}

const DonationCard = ({ item }: DonationCardProp) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    return (
        <>
            <Card key={item.id}>
                <img src={item.imageUrl} alt={item.name} className="cursor-pointer w-full" onClick={openModal} />
                <Card.Header>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Description>{item.description}</Card.Description>
                </Card.Header>
            </Card>

            {/* Modal for zoomed image */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
                    onClick={closeModal}
                >
                    <div className="relative">
                        <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full" />
                        <button className="absolute top-2 right-2 text-white text-2xl" onClick={closeModal}>
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default DonationCard
