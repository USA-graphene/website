import { Metadata } from 'next'
import { Microscope, Settings, Layers, Activity, Zap } from 'lucide-react'

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
    {
        name: 'Flash Graphene Production',
        description: 'Automated Flash Joule Heating systems for rapid, bulk production of turbostratic graphene.',
        icon: Zap,
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

                    {/* Flash Graphene Machine Section */}
                    <div className="mt-32 overflow-hidden bg-gray-900 rounded-3xl shadow-2xl lg:grid lg:grid-cols-2 lg:gap-4">
                        <div className="px-6 pb-12 pt-10 sm:px-16 sm:pt-16 lg:py-16 lg:pr-0 xl:py-20 lg:pl-20">
                            <div className="lg:self-center">
                                <div className="flex items-center gap-x-3 mb-4">
                                    <Zap className="h-6 w-6 text-yellow-400" />
                                    <h2 className="text-base font-semibold leading-7 text-yellow-400">Flash Joule Heating</h2>
                                </div>
                                <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Automated Flash Graphene Production
                                </h3>
                                <p className="mt-6 text-lg leading-8 text-gray-300">
                                    Fully automated machine to produce 20 gr of turbostratic graphene in 20sec.
                                </p>
                                <p className="mt-4 text-base leading-7 text-gray-400">
                                    Experience the future of material synthesis. Engineered for unprecedented speed and precision, this powerhouse transforms raw carbon into high-quality turbostratic graphene in the blink of an eye. Capable of producing 20 grams in just 20 seconds, it redefines scalability, making industrial-grade graphene accessible on demand. No harsh chemicals, no long wait times—just pure, high-performance graphene at the push of a button.
                                </p>
                            </div>
                        </div>
                        <div className="aspect-h-9 aspect-w-16 mask-gradient lg:aspect-none lg:h-full">
                            <Image
                                className="w-full h-full object-cover bg-gray-800 lg:h-full"
                                src="/flash-graphene-machine.jpg"
                                alt="Flash Graphene Machine"
                                width={1024}
                                height={1024}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
