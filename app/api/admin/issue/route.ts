import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { itemId, userId, quantity, date } = await request.json()

    // Validate input
    if (!itemId || !userId || !quantity || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if item exists and has sufficient stock
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (item.availableStock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock available' },
        { status: 400 }
      )
    }

    // Check if user exists and is approved
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!targetUser.isApproved) {
      return NextResponse.json(
        { error: 'User is not approved' },
        { status: 400 }
      )
    }

    // Create issue record
    const issueItem = await prisma.issueItem.create({
      data: {
        itemId,
        userId,
        quantity,
        date: new Date(date)
      }
    })

    // Update item stock
    await prisma.item.update({
      where: { id: itemId },
      data: {
        totalIssued: {
          increment: quantity
        },
        availableStock: {
          decrement: quantity
        }
      }
    })

    return NextResponse.json(issueItem, { status: 201 })
  } catch (error) {
    console.error('Error issuing item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 