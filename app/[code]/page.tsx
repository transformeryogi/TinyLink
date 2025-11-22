import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function RedirectPage({
    params,
}: {
    params: Promise<{ code: string }>
}) {
    const { code } = await params

    try {
        const link = await prisma.link.findUnique({
            where: { shortCode: code }
        })

        if (!link) {
            // Return 404 if link not found
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                    <div className="text-center">
                        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                        <p className="text-xl text-gray-300">Link not found</p>
                    </div>
                </div>
            )
        }

        // Update click count and last clicked time
        await prisma.link.update({
            where: { shortCode: code },
            data: {
                clicks: { increment: 1 },
                lastClickedAt: new Date()
            }
        })

        // Perform redirect (inside try block)
        redirect(link.originalUrl)
    } catch (error) {
        // Only log actual errors, not NEXT_REDIRECT
        if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
            console.error('Error in redirect:', error)
        }
        
        // Re-throw NEXT_REDIRECT to let Next.js handle it
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        
        // Show error page for actual errors
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-4">Error</h1>
                    <p className="text-xl text-gray-300">Something went wrong</p>
                </div>
            </div>
        )
    }
}