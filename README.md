# PDF Gallery MERN Application

A modern, feature-rich PDF management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js). The application provides a beautiful UI for uploading, managing, and sharing PDF documents with robust user authentication and authorization.

## 🚀 Features

- **User Authentication**
  - Register with email verification
  - Login with JWT authentication
  - Password reset functionality
  - Profile management

- **PDF Management**
  - Upload PDFs with metadata (title, description, tags)
  - Public/Private visibility control
  - Download PDFs
  - Search PDFs by title, description, or tags
  - Filter by visibility (public/private)
  - Sort by date, name
  - Tag-based organization

- **User Interface**
  - Modern, responsive design
  - Gradient themes and animations
  - Interactive components
  - Toast notifications
  - Loading states and error handling

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI library
- **TailwindCSS** - Styling and UI components
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications
- **Heroicons** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing
- **Nodemailer** - Email services

## 📁 Folder Structure

```
pdf-gallery-mern/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── pdf.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── pdf.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── pdf.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── config/
│   │   └── db.config.js
│   └── server.js
└── README.md
```

## 📊 Database Schema

### User Collection
```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

### PDF Collection
```javascript
{
  title: { type: String, required: true },
  description: { type: String },
  filePath: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number },
  isPublic: { type: Boolean, default: true },
  tags: [{ type: String }],
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

## 🔗 Entity Relationship Diagram

```
+---------------+          +---------------+
|     User      |          |     PDF       |
+---------------+          +---------------+
| _id           |1        *| _id           |
| username      |<---------| uploadedBy    |
| email         |          | title         |
| password      |          | description   |
| createdAt     |          | filePath      |
| updatedAt     |          | fileName      |
|               |          | fileSize      |
|               |          | isPublic      |
|               |          | tags          |
|               |          | createdAt     |
|               |          | updatedAt     |
+---------------+          +---------------+
```

## 🔌 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
- **Body**: `{ username, email, password }`
- **Response**: `{ message, user }`

#### POST /api/auth/login
Login user
- **Body**: `{ email, password }`
- **Response**: `{ token, user }`

#### POST /api/auth/reset-password
Request password reset
- **Body**: `{ email }`
- **Response**: `{ message }`

### PDF Endpoints

#### POST /api/pdfs/upload
Upload new PDF
- **Auth**: Required
- **Body**: `FormData{ title, description, tags, isPublic, file }`
- **Response**: `{ message, pdf }`

#### GET /api/pdfs
Get all PDFs (with filters)
- **Auth**: Required
- **Query**: `?search&sort&filter&searchBy`
- **Response**: `{ pdfs: [...] }`

#### GET /api/pdfs/:id
Get PDF details
- **Auth**: Required
- **Response**: `{ pdf }`

#### GET /api/pdfs/:id/download
Download PDF file
- **Auth**: Required
- **Response**: PDF file stream

#### PUT /api/pdfs/:id
Update PDF metadata
- **Auth**: Required
- **Body**: `{ title, description, tags, isPublic }`
- **Response**: `{ message, pdf }`

#### DELETE /api/pdfs/:id
Delete PDF
- **Auth**: Required
- **Response**: `{ message }`

### User Endpoints

#### GET /api/users/profile
Get user profile
- **Auth**: Required
- **Response**: `{ user }`

#### PUT /api/users/profile
Update user profile
- **Auth**: Required
- **Body**: `{ username, email }`
- **Response**: `{ message, user }`

#### PUT /api/users/password
Change password
- **Auth**: Required
- **Body**: `{ currentPassword, newPassword }`
- **Response**: `{ message }`

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/pdf-gallery-mern.git
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
Create .env files in both frontend and backend directories:

Backend (.env):
```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

Frontend (.env):
```bash
REACT_APP_API_URL=http://localhost:5000
```

4. Start the application
```bash
# Start backend (from backend directory)
npm start

# Start frontend (from frontend directory)
npm start
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 About the Creator

Hi! I'm **Bodheesh** (you can call me Bodhi), a passionate developer and tech enthusiast. BodhiTech Pro is my contribution to the developer community, aimed at making technical interview preparation more engaging and effective.

## 📫 Connect with Me

I'm always excited to connect with fellow developers and tech enthusiasts! Reach out through any of these channels:

- 📧 **Email**: [bodheeshvc.developer@gmail.com](mailto:bodheeshvc.developer@gmail.com)
- 💼 **LinkedIn**: [linkedin.com/in/bodheeshvc](https://linkedin.com/in/bodheeshvc)
- 🐱 **GitHub**: [github.com/BODHEESH](https://github.com/BODHEESH)
- 📺 **YouTube**: [BodhiTechTalks](https://youtube.com/@BodhiTechTalks)
- 📝 **Medium**: [medium.com/@bodheeshvc.developer](https://medium.com/@bodheeshvc.developer)
- 🐦 **Twitter**: [x.com/Bodheesh_](https://x.com/Bodheesh_)

Let's connect and build something amazing together! Whether you have questions about my projects or want to discuss potential collaborations, I'm always happy to chat.

## 🙏 Acknowledgments

- Special thanks to all future contributors
- Inspired by modern interview preparation needs
- Built with ❤️ for the developer community

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/BODHEESH">Bodheesh (Bodhi)</a>
  <br>
  Happy Coding! 🚀
</p>
