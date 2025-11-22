import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const createLinkSchema = z.object({
    url: z.string().url('Invalid URL format'),
    shortCode: z.string().regex(/^[A-Za-z0-9]{6,8}$/, 'Short code must be 6-8 alphanumeric characters').optional()
})

// Helper to generate random short code
function generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validation = createLinkSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { url, shortCode } = validation.data
        const code = shortCode || generateShortCode()

        // Check if code already exists
        const existing = await prisma.link.findUnique({
            where: { shortCode: code }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Short code already exists' },
                { status: 409 }
            )
        }

        // Create the link
        const link = await prisma.link.create({
            data: {
                originalUrl: url,
                shortCode: code
            }
        })

        return NextResponse.json(link, { status: 201 })
    } catch (error) {
        console.error('Error creating link:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET /api/links - List all links
export async function GET() {
    try {
        const links = await prisma.link.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(links)
    } catch (error) {
        console.error('Error fetching links:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
