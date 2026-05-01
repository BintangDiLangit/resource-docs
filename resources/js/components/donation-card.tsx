import { useState } from 'react'

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
            <div className="rounded-xl border border-border overflow-hidden bg-bg shadow-sm">
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="cursor-pointer w-full block"
                    onClick={openModal}
                />
                <div className="px-6 py-5 space-y-1.5">
                    <p className="font-semibold leading-none tracking-tight break-all">{item.name}</p>
                    <p className="text-sm text-muted-fg">{item.description}</p>
                </div>
            </div>

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
