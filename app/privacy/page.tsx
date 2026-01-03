import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | USA Graphene',
    description: 'Privacy Policy for USA Graphene website.',
    alternates: {
        canonical: '/privacy',
    },
}

export default function PrivacyPolicy() {
    return (
        <div className="bg-white px-6 py-32 lg:px-8">
            <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Privacy Policy</h1>
                <p className="mt-6 text-xl leading-8">
                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>

                <div className="mt-10 max-w-2xl space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">1. Introduction</h2>
                        <p className="mt-4">
                            Welcome to USA Graphene ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (usa-graphene.com) and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">2. Information We Collect</h2>
                        <p className="mt-4">
                            We may collect, use, store, and transfer different kinds of personal data about you which we have grouped together follows:
                        </p>
                        <ul className="mt-4 list-disc pl-5 space-y-2">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address, and telephone number.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                            <li><strong>Usage Data:</strong> includes information about how you use our website, products, and services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">3. How We Use Your Personal Data</h2>
                        <p className="mt-4">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="mt-4 list-disc pl-5 space-y-2">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal obligation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">4. Data Security</h2>
                        <p className="mt-4">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">5. Third-Party Links</h2>
                        <p className="mt-4">
                            This website may include links to third-party websites, plug-ins, and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">6. Contact Us</h2>
                        <p className="mt-4">
                            If you have any questions about this privacy policy or our privacy practices, please contact us at:
                        </p>
                        <p className="mt-2 font-semibold">USA Graphene</p>
                        <p>Email: info@usa-graphene.com</p>
                    </section>
                </div>
            </div>
        </div>
    )
}
