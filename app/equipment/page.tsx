import { Metadata } from 'next'
import { Microscope, Settings, Layers, Activity } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Graphene Equipment - USA Graphene',
    description: 'State-of-the-art equipment for graphene production and characterization.',
}

const equipment = [
    {
        name: 'CVD Systems',
        description: 'High-precision Chemical Vapor Deposition systems for growing high-quality monolayer graphene on various substrates.',
        icon: Layers,
    },
    {
        name: 'Exfoliation Units',
        description: 'Industrial-scale liquid phase exfoliation systems for producing high-yield graphene nanoplatelets.',
        icon: Settings,
    },
    {
        name: 'Characterization Suite',
        description: 'Advanced tools including Raman Spectroscopy and AFM for precise quality control and material analysis.',
        icon: Microscope,
    },
    {
        name: 'Transfer Systems',
        description: 'Automated systems for clean and damage-free transfer of graphene to target substrates.',
        icon: Activity,
    },
]

import Image from 'next/image'

export default function Equipment() {
    return (
        <div className="bg-white relative isolate">
            <div className="absolute inset-0 -z-10 h-full w-full">
                <Image
                    src="/graphene_1.jpg"
                    alt="Graphene Production Equipment"
                    fill
                    className="object-cover opacity-100"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white" />
            </div>
            <div className="py-24 sm:py-32 relative">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary-600">Technology</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Advanced Graphene Equipment
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            We utilize and supply cutting-edge machinery designed specifically for the scalable production and analysis of graphene materials.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                            {equipment.map((item) => (
                                <div key={item.name} className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                        <item.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                                        {item.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">{item.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}
