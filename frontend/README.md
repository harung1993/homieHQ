# HomieHQ Frontend

HomieHQ is a comprehensive home management solution designed to help homeowners and landlords efficiently manage their properties, documents, maintenance tasks, and tenant relationships.

## Features

- **Property Management**: Track all your properties in one place
- **Document Management**: Store and organize important property documents
- **Maintenance Tracking**: Schedule and monitor maintenance tasks
- **Tenant Management**: Manage tenant details, leases, and communications
- **Expense Tracking**: Monitor property-related expenses
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React**: Frontend library
- **React Router**: For navigation
- **Tailwind CSS**: For styling
- **Axios**: For API communication

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Docker (optional, for containerized development)

### Installation

#### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/harung1993/homieHQ.git
   cd homiehq/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The application will be available at `http://localhost:3000`

#### Docker Development

1. Build the Docker image:
   ```bash
   docker build -t harung43/homiehq:frontend .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 harung43/homiehq:frontend
   ```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
REACT_APP_API_URL=/api
```

## Project Structure

```
frontend/
├── public/              # Static files
├── src/                 # Source files
│   ├── components/      # React components
│   │   ├── auth/        # Authentication components
│   │   ├── homeowner/   # Homeowner dashboard components
│   │   ├── layout/      # Layout components
│   │   ├── property/    # Property management components
│   │   └── tenant/      # Tenant management components
│   ├── pages/           # Page components
│   ├── services/        # API and utility services
│   ├── App.js           # Main App component
│   └── index.js         # Entry point
├── .dockerignore        # Docker ignore file
├── .gitignore           # Git ignore file
├── docker-compose.yaml  # Docker Compose configuration
├── docker-entrypoint.sh # Docker entry point script
├── Dockerfile           # Docker configuration file
├── package.json         # Package dependencies
├── postcss.config.js    # PostCSS configuration
├── README.md            # Project documentation
└── tailwind.config.js   # Tailwind CSS configuration
```

## Docker Deployment

The project includes Docker configuration files for easy deployment. The Dockerfile uses a multi-stage build process to create an optimized production image.

To build and push the Docker image:

```bash
# Build the image
docker build -t harung43/homiehq:frontend .

# Push to Docker Hub
docker push harung43/homiehq:frontend
```

## Development Guidelines

- Use functional components with hooks
- Follow the provided component and file structure
- Use Tailwind CSS for styling
- Implement proper error handling for API requests
- Include comments for complex logic
- Write meaningful commit messages

## Testing

Run tests with:

```bash
npm test
```

## License

[MIT](LICENSE)

## Contact

