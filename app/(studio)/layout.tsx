import StyledComponentsRegistry from '@/lib/StyledComponentsRegistry'

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section data-gramm-ignore="true">
            <StyledComponentsRegistry>
                {children}
            </StyledComponentsRegistry>
        </section>
    )
}
