import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AIChatWidget from '@/components/AIChatWidget'

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
            <AIChatWidget />
        </>
    )
}
