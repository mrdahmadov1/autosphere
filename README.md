# AutoSphere

A modern car dealership website built with React, Vite, and Tailwind CSS.

## Overview

AutoSphere is a sophisticated car dealership platform designed with a focus on desktop-first experience. The application provides an elegant interface for browsing, searching, and exploring vehicles in an interactive manner.

## Features

- **Multi-page Application**: Includes Home, Car Details, About, and Contact pages
- **Modern UI**: Custom-designed interface using Tailwind CSS
- **Responsive Design**: Beautiful desktop-focused layout with responsive components
- **Interactive Elements**: Custom hover effects, transitions, and animations
- **Search & Filtering**: Find cars by brand, model, year, or price range
- **Detailed Car Information**: View comprehensive details for each vehicle

## Tech Stack

- **React**: Frontend library for building the user interface
- **Vite**: Next generation frontend tooling for faster development
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Router**: For seamless navigation between pages

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository

```
git clone https://github.com/your-username/autosphere.git
cd autosphere
```

2. Install dependencies

```
npm install
```

3. Start the development server

```
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` or the port shown in your terminal

## Project Structure

```
autosphere/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Application pages
│   ├── data/          # Mock data for cars
│   ├── index.css      # Global styles
│   └── App.jsx        # Main application component
├── index.html         # HTML entry point
├── tailwind.config.js # Tailwind CSS configuration
└── package.json       # Project dependencies
```

## Color Scheme

- **Primary**: #3a86ff - Used for main brand elements and CTAs
- **Secondary**: #ff5a5f - Used for highlights and secondary actions
- **Accent**: #ffbe0b - Used for important highlights and accents
- **Neutral**: Various shades for text and backgrounds

## Building for Production

```
npm run build
```

This will generate optimized assets in the `dist/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Car images from [Unsplash](https://unsplash.com)
- Icons from [Heroicons](https://heroicons.com)
