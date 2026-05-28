import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DeferredAIChatWidget from '@/components/DeferredAIChatWidget'

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            {children}
            <Footer />
            <DeferredAIChatWidget />
        </>
    )
}
