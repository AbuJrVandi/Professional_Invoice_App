# 📱 Invoice App

<div align="center">
  <h3 align="center">Professional Invoice & Receipt Management</h3>
</div>

![Alt Text](https://github.com/AbuJrVandi/Professional_Invoice_App/blob/57b1f8156f300c541fa6e819b0b555007908ed80/LOG.png)

## 📝 Description

Invoice App is a comprehensive mobile application built with React Native that helps businesses and freelancers manage their invoices and receipts efficiently. The app provides a seamless experience for creating, managing, and tracking invoices and receipts, with features like PDF generation, payment tracking, and detailed financial analytics.

## 🚀 Tech Stack

- **Frontend**
  - React Native (Expo)
  - TypeScript
  - React Navigation
  - React Native Paper
  - React Native Vector Icons
  - Expo PDF
  - Async Storage

- **Backend**
  - Node.js
  - Express.js
  - SQLite
  - PDFKit
  - JWT Authentication
  - Bcrypt

- **Development Tools**
  - Expo CLI
  - TypeScript
  - ESLint
  - Prettier

## ✨ Features

### 👤 User Management
- Secure email/password authentication
- User profile management
- Profile picture upload
- Password reset functionality

### 📊 Dashboard
- Total revenue tracking
- Invoice status overview
- Recent transactions
- Payment statistics

### 📄 Invoice Management
- Create professional invoices
- Customizable invoice templates
- Add multiple items
- Tax calculation
- Payment status tracking
- PDF generation and sharing

### 🧾 Receipt Management
- Generate receipts for payments
- Link receipts to invoices
- PDF generation
- Payment method tracking

### 💼 Business Features
- Client management
- Payment tracking
- Multiple payment methods support
- Tax calculations
- Professional PDF generation

### 🎨 UI/UX
- Clean and modern interface
- Bottom tab navigation
- Dark/Light theme support
- Responsive design
- Loading states and animations

## 📸 Screenshots

<div align="center">
  <h3 align="center">Login Screen </h3>
</div>

![Alt Text](https://github.com/AbuJrVandi/Professional_Invoice_App/blob/57b1f8156f300c541fa6e819b0b555007908ed80/Login.png)


<div align="center">
  <h3 align="center">Dashboard </h3>
</div>

![Alt Text](https://github.com/AbuJrVandi/Professional_Invoice_App/blob/57b1f8156f300c541fa6e819b0b555007908ed80/Dashboard.jpeg)


<div align="center">
  <h3 align="center"> Invoice PDF </h3>
</div>

![Alt Text](https://github.com/AbuJrVandi/Professional_Invoice_App/blob/57b1f8156f300c541fa6e819b0b555007908ed80/pdf_invoice.png)

<div align="center">
  <h3 align="center"> Receipt View </h3>
</div>

![Alt Text](https://github.com/AbuJrVandi/Professional_Invoice_App/blob/57b1f8156f300c541fa6e819b0b555007908ed80/Receipt.png)

## 🚦 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
  ```bash
  npm install -g expo-cli
  ```

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/invoice-app.git
   cd invoice-app
   ```

2. Install frontend dependencies
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies
   ```bash
   cd ../backend
   npm install
   ```

4. Create a .env file in the backend directory
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   ```

### Running the Application

1. Start the backend server
   ```bash
   cd backend
   npm start
   ```

2. Start the Expo development server
   ```bash
   cd frontend
   expo start
   ```

3. Use the Expo Go app on your mobile device or an emulator to run the application

## 📁 Project Structure

```
invoice-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   ├── App.tsx
│   └── package.json
└── README.md
```

## 🛠️ Building for Production

### Android
1. Install the latest Android Studio
2. Configure your development environment
3. Run the build command:
   ```bash
   cd frontend
   expo build:android
   ```

### iOS
1. Make sure you have Xcode installed
2. Configure your Apple Developer account
3. Run the build command:
   ```bash
   cd frontend
   expo build:ios
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [PDFKit](http://pdfkit.org/)
- [SQLite](https://www.sqlite.org/)

## 📧 Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/invoice-app](https://github.com/yourusername/invoice-app)

---

<div align="center">
  Made with by Abu Junior Vandi
</div> 
