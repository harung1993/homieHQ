# HomieHQ - Home Management Platform

![HomieHQ Logo](https://github.com/yourusername/homiehq/raw/main/public/logo192.png)

HomieHQ is a comprehensive home management platform that helps homeowners and property investors streamline property management, maintenance tracking, and financial planning.

## 🏠 Features

HomieHQ offers a wide range of features to make home management easier:

- **Property Dashboard**: Get an at-a-glance view of your property statistics and status
- **Maintenance Tracking**: Manage maintenance tasks with seasonal checklists
- **Document Storage**: Securely store and organize important documents
- **Appliance Management**: Track warranties and maintenance schedules
- **Budget & Expense Tracking**: Monitor your home expenses and stay on budget
- **Project Management**: Plan and track home improvement projects
- **Tenant Management**: Organize tenant information and documents (for rental properties)
- **Financial Reporting**: Generate comprehensive reports on property expenses

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v7+) or yarn (v1.22+)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/homiehq.git
cd homiehq
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://your-api-server:port/api
```

4. Start the development server
```bash
npm start
# or
yarn start
```

## 🏗️ Project Structure

```
src/
├── App.js               # Main application component
├── index.js             # Entry point
├── index.css            # Global styles
├── components/          # UI components
│   ├── auth/            # Authentication components
│   │   ├── LoginForm.js
│   │   └── SignupForm.js
│   ├── homeowner/       # Homeowner-focused components
│   │   ├── HomieHQDashboard.js
│   │   ├── Maintenance.js
│   │   ├── Appliances.js
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── Navigation.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.js
│   ├── property/        # Property management components
│   │   ├── PropertyHub.js
│   │   ├── Properties.js
│   │   └── PropertyDetails.js
│   ├── services/        # Service modules
│   │   ├── applianceService.js
│   │   ├── DocumentService.js
│   │   ├── financeService.js
│   │   └── ...
│   └── tenant/          # Tenant management components
│       ├── Tenants.js
│       ├── TenantForm.js
│       └── TenantDocuments.js
└── services/            # Core services
    └── api.js           # API client configuration
```

## 🎨 Styling

HomieHQ uses a combination of:

- **Tailwind CSS** for utility-based styling
- **Custom CSS variables** for theming
- **CSS Modules** for component-specific styles

The color scheme is based on a dark theme with teal and orange accent colors for better visibility and user experience.

## 📱 Responsive Design

HomieHQ is fully responsive and works on:
- Desktop
- Tablet
- Mobile devices

The sidebar collapses on smaller screens and can be toggled with the menu button.

## 🔐 Authentication

The application includes a complete authentication system:
- User registration (signup)
- Login with JWT token
- Token refresh mechanism
- Protected routes

## 🔄 State Management

HomieHQ uses React's built-in state management with:
- `useState` for component state
- `useEffect` for side effects
- `useContext` for shared state (where needed)
- Custom service modules for API interaction

## 🔌 API Integration

HomieHQ communicates with a RESTful backend API:
- Custom `apiHelpers` for standardized API calls
- Automatic token handling and request/response processing
- Specialized service modules for different data types

## 📦 Dependencies

Key dependencies include:
- `react-router-dom` - For routing
- `axios` - For API requests
- `recharts` - For data visualization
- `jspdf` and `jspdf-autotable` - For PDF generation
- `date-fns` - For date manipulation

## 🧪 Testing

Run tests with:
```bash
npm test
# or
yarn test
```

## 🚀 Deployment

Build for production:
```bash
npm run build
# or
yarn build
```

The build files will be in the `build` directory, ready to be deployed to your hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Recharts](https://recharts.org/)