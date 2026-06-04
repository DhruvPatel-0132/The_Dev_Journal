import BackgroundGlow from '@/components/common/BackgroundGlow'
import GridPattern from '@/components/common/GridPattern'
import BlogNavbar from '@/components/layout/BlogNavbar'

function DashboardPage() {
    return (
        <>
            <main className="min-h-screen overflow-hidden bg-[#0A0A0B] text-white relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <BackgroundGlow />
                    <GridPattern />
                </div>
                <BlogNavbar />
            </main>
        </>
    )
}

export default DashboardPage