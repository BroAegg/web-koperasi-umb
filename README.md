# Koperasi UMB

Koperasi UMB is a React.js application designed for managing cooperative functionalities, including user authentication, inventory management, and broadcasting features.

## Project Structure

```
koperasi-umb
├── public
│   └── index.html          # Main HTML file for the React application
├── src
│   ├── assets
│   │   └── images          # Directory for image assets
│   ├── components
│   │   ├── Broadcast       # Component for broadcasting features
│   │   ├── Dashboard       # Component for the dashboard view
│   │   ├── Inventory       # Component for managing inventory
│   │   ├── Login           # Component for login functionality
│   │   ├── Membership      # Component for membership-related features
│   │   ├── Sidebar         # Component for sidebar navigation
│   │   └── common          # Shared components
│   ├── context
│   │   └── AuthContext.js  # Authentication context
│   ├── hooks
│   │   └── useAuth.js      # Custom hook for authentication logic
│   ├── pages
│   │   ├── BroadcastPage.js # Page for broadcasting features
│   │   ├── DashboardPage.js # Page for the dashboard
│   │   ├── InventoryPage.js # Page for inventory management
│   │   ├── LoginPage.js     # Page for user login
│   │   └── MembershipPage.js # Page for membership management
│   ├── styles
│   │   └── index.css        # Global styles
│   ├── utils
│   │   └── api.js           # Utility functions for API calls
│   ├── App.js               # Main application component
│   └── index.js             # Entry point for the React application
├── package.json             # npm configuration file
├── README.md                # Project documentation
└── .gitignore               # Git ignore file
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd koperasi-umb
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

## Features

- User authentication
- Inventory management
- Broadcasting features
- Membership management
- Responsive design

## License

This project is licensed under the MIT License.