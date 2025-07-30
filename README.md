# Inventory Management System

A comprehensive Inventory Management System built with Next.js and PostgreSQL, featuring unit-based stock control for both countable and measurable items.

## Features

### Authentication
- **User Sign Up**: New users can register (pending admin approval)
- **Admin Login**: Admins can log in to approve users and manage the system
- **Role-based Access**:
  - **Admin**: Full access to all features
  - **User**: View-only access to their issued items

### Item Master Management
- **Add New Items**: Admins can add items with name, unit type, category, and description
- **Unit Types**: Supports PCS (pieces), M (meters), L (liters), KG (kilograms)
- **Stock Tracking**: Automatically tracks total purchased, total issued, and available stock

### Purchase Entry
- **Record Purchases**: Admins can log new purchases with item, quantity, unit type, date, and amount
- **Stock Updates**: Automatically updates total purchased and available stock in item master

### Issue Stock (Indent)
- **Issue Items**: Admins can issue stock to approved users
- **Validation**: System checks available quantity before issuing
- **Stock Updates**: Updates total issued and available quantity in item master

### Reports
- **Stock Summary**: View overall stock summary with filtering options
- **Export to CSV**: Export stock reports to CSV format
- **Filtering**: Filter by date range, item, or person

### User Dashboard
- **View Issued Items**: Approved users can view items issued to them
- **Item History**: See item details and transaction history

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ims-nextJS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ims_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   JWT_SECRET="your-jwt-secret-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Create an admin user**
   ```bash
   # Start the development server
   npm run dev
   ```
   
   Then visit `http://localhost:3000/auth/signup` to create your first admin account. You'll need to manually update the user role to 'ADMIN' in the database.

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Users
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: User full name
- `password`: Hashed password
- `role`: ADMIN or USER
- `isApproved`: Boolean for user approval status

### Items
- `id`: Unique identifier
- `name`: Item name
- `unitType`: PCS, M, L, or KG
- `category`: Item category
- `description`: Optional item description
- `totalPurchased`: Total quantity purchased
- `totalIssued`: Total quantity issued
- `availableStock`: Current available stock

### Purchases
- `id`: Unique identifier
- `itemId`: Reference to item
- `userId`: Reference to user who recorded purchase
- `quantity`: Purchase quantity
- `unitType`: Unit type for purchase
- `amount`: Purchase amount
- `date`: Purchase date

### IssueItems
- `id`: Unique identifier
- `itemId`: Reference to item
- `userId`: Reference to user who received item
- `quantity`: Issued quantity
- `date`: Issue date

## Usage

### Admin Workflow
1. **Approve Users**: Go to User Management to approve new user registrations
2. **Add Items**: Use Item Master to add inventory items
3. **Record Purchases**: Use Purchase Entry to log new stock purchases
4. **Issue Stock**: Use Issue Stock to distribute items to users
5. **View Reports**: Use Reports to analyze stock levels and export data

### User Workflow
1. **Register**: Sign up for an account (pending approval)
2. **Login**: Once approved, users can log in
3. **View Items**: See items issued to them in their dashboard

## Key Features

### Unit-Based Stock Control
- Supports both countable (PCS) and measurable (M, L, KG) items
- Automatic validation prevents issuing more than available
- Real-time stock updates

### Transaction Logging
- All purchases and issues are logged with timestamps
- Complete audit trail for inventory movements
- User attribution for all transactions

### Security
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Admin approval system for new users

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Admin Management
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/[id]/approve` - Approve user
- `DELETE /api/admin/users/[id]` - Delete user

### Item Management
- `GET /api/admin/items` - Get all items
- `POST /api/admin/items` - Create item
- `PUT /api/admin/items/[id]` - Update item
- `DELETE /api/admin/items/[id]` - Delete item

### Purchase Management
- `GET /api/admin/purchases` - Get all purchases
- `POST /api/admin/purchases` - Create purchase

### Issue Management
- `POST /api/admin/issue` - Issue item to user
- `GET /api/admin/issue-history` - Get issue history

### Reports
- `GET /api/admin/reports/stock-summary` - Get stock summary

### User
- `GET /api/user/issued-items` - Get user's issued items

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

### Database Management
```bash
# View database in Prisma Studio
npm run db:studio

# Reset database (development only)
npx prisma db push --force-reset
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 

