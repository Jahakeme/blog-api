# Blog API

A RESTful API for managing a blog platform with user authentication, posts, comments, and administrator capabilities.

## Features

- **User Management**: Registration, authentication, profile management
- **Post Management**: Create, read, update, and delete blog posts
- **Comment System**: Add and manage comments on blog posts
- **Admin Dashboard**: Special routes for administrative tasks
- **Authentication**: JWT-based authentication with secure cookie storage
- **Authorization**: Role-based access control for different operations

## Technology Stack

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database (with Mongoose ODM)
- **JWT**: JSON Web Token for authentication
- **bcryptjs**: Password hashing
- **Cookie-parser**: Cookie handling for JWT storage

## API Documentation

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/users/signup` | Register a new user | No |
| POST | `/api/users/login` | Authenticate a user | No |
| GET | `/api/users/:id` | Get user profile | Yes |
| PUT | `/api/users/:id` | Update user profile | Yes |
| DELETE | `/api/users/:id` | Delete user account | Yes |
| POST | `/api/users/logout` | Logout user | No |

### Post Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/posts` | Create a new post | Yes |
| GET | `/api/posts` | Get all posts | No |
| GET | `/api/posts/search` | Search for posts | No |
| GET | `/api/posts/:id` | Get a specific post | No |
| PUT | `/api/posts/:id` | Update a post | Yes |
| DELETE | `/api/posts/:id` | Delete a post | Yes |

### Comment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/comments` | Add a comment | Yes |
| GET | `/api/comments` | Get all comments | No |
| GET | `/api/comments/:id` | Get a specific comment | No |
| PUT | `/api/comments/:id` | Update a comment | Yes |
| DELETE | `/api/comments/:id` | Delete a comment | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| DELETE | `/api/admin/posts/:id` | Delete any post | Yes (Admin) |
| DELETE | `/api/admin/comments/:id` | Delete any comment | Yes (Admin) |
| GET | `/api/admin/users` | Get all users | Yes (Admin) |
| GET | `/api/admin/users/:id` | Get any user | Yes (Admin) |

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or Atlas)
- Git

### Installation Steps

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd blog
   ```bash

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ``` javascript
   MONGODB=<your-mongodb-connection-string>
   PORT=5000
   JWT_SECRET=<your-jwt-secret-key>
   JWT_EXPIRE=3h
   ADMIN_EMAILS=admin1@example.com,admin2@example.com
   SHOW_STACK_TRACE=true  # Set to false in production
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. For production:

   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB | MongoDB connection string | `mongodb+srv://username:password@cluster.mongodb.net/database` |
| PORT | Port the server will run on | `5000` |
| JWT_SECRET | Secret key for JWT signing | `your-secret-key` |
| JWT_EXPIRE | JWT token expiration time | `3h` |
| ADMIN_EMAILS | Comma-separated list of admin emails | `admin@example.com,another@example.com` |
| SHOW_STACK_TRACE | Whether to show stack traces in errors | `true` or `false` |

## Data Models

### User Model

```javascript
{
  username: String,  // required
  password: String,  // required, min length 8
  email: String,     // required, unique
  profile: {
    country: String,
    city: String,
    phoneNumber: String,
    bio: String
  },
  role: [String]     // enum: ['admin', 'user'], default: ['user']
}
```

### Post Model

```javascript
{
  title: String,      // required
  content: String,    // required
  reads: Number,      // default: 0
  author: ObjectId,   // references User
  createdAt: Date,    // automatic
  updatedAt: Date     // automatic
}
```

### Comment Model

```javascript
{
  content: String,    // required
  author: ObjectId,   // references User
  post: ObjectId,     // references Post
  createdAt: Date,    // automatic
  updatedAt: Date     // automatic
}
```

## Authentication

The API uses JWT (JSON Web Token) for authentication, stored in HTTP-only cookies.

### Authentication Flow

1. User registers or logs in
2. Server validates credentials
3. Server generates JWT token with user ID and role
4. Token is stored in an HTTP-only cookie
5. Token is verified on protected routes
6. User ID is extracted from token and attached to request object

### Code Example - Login

```javascript
// Client-side example
async function loginUser(email, password) {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Important for cookies
    });
    
    return await response.json();
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

## Authorization

Routes are protected using middleware:

1. `authMiddleware`: Verifies JWT token and attaches user to request
2. `isAdmin`: Checks if the authenticated user has admin privileges

Admin status is determined by:

- Having 'admin' in the user's role array
- OR having an email that matches one in the ADMIN_EMAILS environment variable

## Usage Examples

### Creating a New Blog Post

```javascript
// Client-side example
async function createPost(title, content) {
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
      credentials: 'include' // For authentication cookie
    });
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create post:', error);
  }
}
```

### Searching for Posts

```javascript
// Client-side example
async function searchPosts(query) {
  try {
    const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`);
    return await response.json();
  } catch (error) {
    console.error('Search failed:', error);
  }
}
```

## Error Handling

The API uses a global error handler middleware that formats error responses consistently:

```json
{
  "message": "Error message description",
  "stack": "Error stack trace (only in development)"
}
```

## License

This project is licensed under the ISC License.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
