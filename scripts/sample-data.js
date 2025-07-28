const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleData() {
  try {
    console.log('Creating sample data...')
    
    // Create sample items
    const items = await Promise.all([
      prisma.item.create({
        data: {
          name: 'Laptop',
          unitType: 'PCS',
          category: 'Electronics',
          description: 'High-performance laptop for office use',
          totalPurchased: 10,
          totalIssued: 3,
          availableStock: 7
        }
      }),
      prisma.item.create({
        data: {
          name: 'Cable Wire',
          unitType: 'M',
          category: 'Electrical',
          description: 'Copper cable wire for electrical installations',
          totalPurchased: 500,
          totalIssued: 150,
          availableStock: 350
        }
      }),
      prisma.item.create({
        data: {
          name: 'Paint',
          unitType: 'L',
          category: 'Construction',
          description: 'White paint for walls',
          totalPurchased: 100,
          totalIssued: 25,
          availableStock: 75
        }
      }),
      prisma.item.create({
        data: {
          name: 'Steel Bars',
          unitType: 'KG',
          category: 'Construction',
          description: 'Reinforcement steel bars',
          totalPurchased: 2000,
          totalIssued: 800,
          availableStock: 1200
        }
      })
    ])

    console.log('Sample items created:', items.length)

    // Create sample users (non-admin) - skip if they exist
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['john@example.com', 'jane@example.com', 'bob@example.com']
        }
      }
    })

    let users = existingUsers

    if (existingUsers.length < 3) {
      const usersToCreate = []
      
      if (!existingUsers.find(u => u.email === 'john@example.com')) {
        usersToCreate.push({
          name: 'John Doe',
          email: 'john@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s6i', // password123
          role: 'USER',
          isApproved: true
        })
      }
      
      if (!existingUsers.find(u => u.email === 'jane@example.com')) {
        usersToCreate.push({
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s6i', // password123
          role: 'USER',
          isApproved: true
        })
      }
      
      if (!existingUsers.find(u => u.email === 'bob@example.com')) {
        usersToCreate.push({
          name: 'Bob Wilson',
          email: 'bob@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s6i', // password123
          role: 'USER',
          isApproved: false
        })
      }

      if (usersToCreate.length > 0) {
        const newUsers = await Promise.all(
          usersToCreate.map(userData => prisma.user.create({ data: userData }))
        )
        users = [...existingUsers, ...newUsers]
      }
    }

    console.log('Sample users created:', users.length)

    // Get admin user ID
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('No admin user found. Skipping purchases.')
      return
    }

    // Create sample purchases with different dates for monthly analytics
    const purchases = await Promise.all([
      // January purchases
      prisma.purchase.create({
        data: {
          itemId: items[0].id,
          userId: adminUser.id,
          quantity: 10,
          unitType: 'PCS',
          amount: 50000,
          date: new Date('2024-01-15')
        }
      }),
      prisma.purchase.create({
        data: {
          itemId: items[1].id,
          userId: adminUser.id,
          quantity: 500,
          unitType: 'M',
          amount: 25000,
          date: new Date('2024-01-20')
        }
      }),
      prisma.purchase.create({
        data: {
          itemId: items[2].id,
          userId: adminUser.id,
          quantity: 100,
          unitType: 'L',
          amount: 15000,
          date: new Date('2024-01-25')
        }
      }),
      // February purchases
      prisma.purchase.create({
        data: {
          itemId: items[3].id,
          userId: adminUser.id,
          quantity: 1000,
          unitType: 'KG',
          amount: 75000,
          date: new Date('2024-02-10')
        }
      }),
      prisma.purchase.create({
        data: {
          itemId: items[0].id,
          userId: adminUser.id,
          quantity: 5,
          unitType: 'PCS',
          amount: 25000,
          date: new Date('2024-02-15')
        }
      }),
      // March purchases
      prisma.purchase.create({
        data: {
          itemId: items[1].id,
          userId: adminUser.id,
          quantity: 300,
          unitType: 'M',
          amount: 15000,
          date: new Date('2024-03-05')
        }
      }),
      prisma.purchase.create({
        data: {
          itemId: items[2].id,
          userId: adminUser.id,
          quantity: 50,
          unitType: 'L',
          amount: 7500,
          date: new Date('2024-03-20')
        }
      }),
      // April purchases
      prisma.purchase.create({
        data: {
          itemId: items[3].id,
          userId: adminUser.id,
          quantity: 800,
          unitType: 'KG',
          amount: 60000,
          date: new Date('2024-04-12')
        }
      }),
      // May purchases
      prisma.purchase.create({
        data: {
          itemId: items[0].id,
          userId: adminUser.id,
          quantity: 8,
          unitType: 'PCS',
          amount: 40000,
          date: new Date('2024-05-08')
        }
      }),
      prisma.purchase.create({
        data: {
          itemId: items[1].id,
          userId: adminUser.id,
          quantity: 400,
          unitType: 'M',
          amount: 20000,
          date: new Date('2024-05-22')
        }
      }),
      // June purchases
      prisma.purchase.create({
        data: {
          itemId: items[2].id,
          userId: adminUser.id,
          quantity: 75,
          unitType: 'L',
          amount: 11250,
          date: new Date('2024-06-15')
        }
      }),
      prisma.purchase.create({
        data: {
          itemId: items[3].id,
          userId: adminUser.id,
          quantity: 600,
          unitType: 'KG',
          amount: 45000,
          date: new Date('2024-06-28')
        }
      })
    ])

    console.log('Sample purchases created:', purchases.length)

    // Create sample issues
    const issues = await Promise.all([
      prisma.issueItem.create({
        data: {
          itemId: items[0].id,
          userId: users[0].id,
          quantity: 2,
          date: new Date('2024-02-01')
        }
      }),
      prisma.issueItem.create({
        data: {
          itemId: items[1].id,
          userId: users[1].id,
          quantity: 50,
          date: new Date('2024-02-05')
        }
      }),
      prisma.issueItem.create({
        data: {
          itemId: items[2].id,
          userId: users[0].id,
          quantity: 10,
          date: new Date('2024-02-10')
        }
      })
    ])

    console.log('Sample issues created:', issues.length)
    console.log('Sample data created successfully!')
    
  } catch (error) {
    console.error('Error creating sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleData() 