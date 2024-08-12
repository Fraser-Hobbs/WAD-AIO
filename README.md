
# Charity Shop Inventory System

This repository serves as the main entry point for the Charity Shop Inventory System, comprising both the frontend and backend services. The application facilitates the management of inventory for a local hospice charity's four shops, allowing volunteers and staff to manage items and the public to view available products.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Charity Shop Inventory System is a full-stack application designed to help manage inventory across multiple charity shops. The backend is built with Node.js and Express, and the frontend is powered by Angular. Docker Compose is used to facilitate easy deployment and management of both services.

## Getting Started

This repository contains the Docker Compose configuration that ties together the frontend and backend services.

## Directory Structure

```
.
├── backend/                # Backend service (Express)
├── frontend/               # Frontend service (Angular)
├── docker-compose.yml      # Docker Compose configuration for both services
└── README.md               # This file
```

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/myapp.git
   cd myapp
   ```

2. **Initialize and update submodules:**

   ```bash
   git submodule init
   git submodule update
   ```

3. **Build and start the services:**

   ```bash
   docker-compose up --build
   ```

   This command will build and start both the frontend and backend services.

## Usage

After starting the services, the application will be accessible at `http://localhost:8080`.

## Contributing

To contribute to this project, follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License
