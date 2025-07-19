import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/users/route'

// Mock global Request for Next.js API routes
global.Request = Request

// Mock MongoDB client
const mockDb = {
  collection: jest.fn(() => ({
    findOne: jest.fn(),
    insertOne: jest.fn(),
    find: jest.fn(() => ({
      project: jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue([]),
      })),
    })),
  })),
}

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    db: jest.fn(() => mockDb),
  }),
}))


// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashedPassword')),
}))

describe('/api/users API Route', () => {
  it('creates a new user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'ouvrier',
      lot: 'LOT-A'
    }

    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const response = await POST(request)
    
    expect(response.status).toBe(201)
  })

  it('returns error for missing required fields', async () => {
    const incompleteData = {
      name: 'John Doe',
      email: 'john@example.com',
      // Missing password, role, lot
    }

    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteData),
    })

    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})
