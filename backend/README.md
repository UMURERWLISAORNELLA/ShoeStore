
# E-commerce Backend API

A comprehensive Node.js backend for an e-commerce application with MTN Mobile Money integration.

## Features

- User authentication and authorization
- Product management
- Order processing
- MTN Mobile Money payment integration
- PostgreSQL database with proper schema
- RESTful API design
- Input validation and error handling
- JWT-based authentication

## Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- MTN MoMo Developer Account (for payment integration)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Database credentials
   - JWT secret
   - MTN MoMo API credentials

5. Set up the database:
   ```bash
   # Connect to PostgreSQL and run the schema
   psql -U your_username -d your_database -f config/schema.sql
   ```

6. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `GET /api/orders` - Get user orders (all orders for admin)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status (admin only)

### Payments
- `POST /api/payments/mtn-momo` - Process MTN MoMo payment
- `GET /api/payments/status/:paymentId` - Check payment status
- `GET /api/payments/history` - Get payment history

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users` - Get all users (admin only)
- `PATCH /api/users/:id/role` - Update user role (admin only)

## MTN Mobile Money Integration

The application integrates with MTN Mobile Money API for payment processing:

### Configuration
Set up your MTN MoMo credentials in the `.env` file:
```
MTN_MOMO_ENVIRONMENT=sandbox
MTN_MOMO_USER_ID=your_user_id
MTN_MOMO_API_KEY=your_api_key
MTN_MOMO_PRIMARY_KEY=your_primary_key
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
```

### Payment Flow
1. User initiates payment with phone number and amount
2. Backend validates order and creates payment record
3. Request sent to MTN MoMo API
4. Payment status can be checked via status endpoint
5. Successful payments update order status automatically

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `payments` - Payment transactions
- `cart_items` - Shopping cart data

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS protection
- Helmet.js security headers
- Role-based access control

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Resource not found (404)
- Server errors (500)

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── config/           # Database and configuration files
├── middleware/       # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic services
├── .env.example     # Environment variables template
├── server.js        # Main application file
└── package.json     # Dependencies and scripts
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2
3. Set up SSL/TLS certificates
4. Configure reverse proxy (nginx)
5. Set up database backups
6. Monitor logs and performance

## API Testing

You can test the API using tools like Postman or curl. Example requests:

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","fullName":"Test User"}'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

### Process Payment
```bash
curl -X POST http://localhost:5000/api/payments/mtn-momo \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
   -d '{"orderId":"order-uuid","phoneNumber":"250700000000","amount":10000}'
```
