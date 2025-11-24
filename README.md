# Hotel Management System

## 🚀 Installation & Setup

### 1. Install Softwares
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm
-ensure node and npm are available on the command line


### 2. Install Dependencies
```bash
# Run all commands in sequence inside vscode terminal

# Inside root folder run
npm install
# go inside server directory
cd server
# Install server dependencies
npm install
# Exit server directory and go to client directory
cd ../client
# Install client dependencies
npm install
```

### 3. Database Setup
1. Open the MySQL Command Line Client
2. Enter your mysql password
3- Run the following commands

```
SOURCE C:\path\to\your\project\server\with\these\inverted\slashes\database.sql;
```

### 4. Environment Configuration
Create a `.env` file in the server directory:

-change DB_PASSWORD to your pc's mysql password

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-pcs-mysql-password 
DB_NAME=hotel_management
JWT_SECRET=your-super-secret-jwt-key
```

### 5. Run the Application
```bash

#  run them separately on two terminals:
# Backend (from root)
npm run server

# Frontend (from root)
npm run client
```


