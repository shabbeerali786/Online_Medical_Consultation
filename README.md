# Online Medical Consultation

A modern React-based frontend application for online medical consultation services. This application provides a comprehensive platform for patients, doctors, and administrators to manage medical appointments and consultations.

## Features

### 🏠 Home Page
- Project title and navigation bar
- Welcome section with call-to-action buttons
- Features overview and how-it-works section

### 🔐 User Authentication
- **Login Page**: Sign in for patients, doctors, and admins
- **Signup Page**: Registration for patients and doctors
- Role-based authentication with Context API
- Demo credentials provided for testing

### 👨‍⚕️ Patient Dashboard
- **Find Doctors**: Browse and filter doctors by specialization
- **Book Appointment**: Select doctor, date, time, and reason
- **My Appointments**: View upcoming and past appointments
- Responsive design with tabbed interface

### 🩺 Doctor Dashboard
- **View Appointments**: See upcoming and completed appointments
- **Upload Prescription**: Add/edit clinical notes and medications
- **Patient Management**: Track patient consultations
- Modal-based prescription form

### 👨‍💼 Admin Dashboard
- **User Management**: View all doctors and patients
- **Appointment Overview**: Monitor all appointments
- **Statistics**: Dashboard with key metrics
- Comprehensive data tables

## Tech Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/
│   └── Navbar.jsx
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── PatientDashboard.jsx
│   ├── DoctorDashboard.jsx
│   └── AdminDashboard.jsx
├── assets/
├── App.jsx
├── main.jsx
└── index.css
```

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd online-medical-consultation
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Demo Credentials

### Patient Login
- Email: `patient@demo.com`
- Password: `password123`

### Doctor Login
- Email: `doctor@demo.com`
- Password: `password123`

### Admin Login
- Email: `admin@demo.com`
- Password: `password123`

## Features in Detail

### Authentication System
- Role-based access control (Patient, Doctor, Admin)
- Protected routes with automatic redirection
- Persistent login state using localStorage
- Form validation and error handling

### Patient Features
- **Doctor Discovery**: Filter by specialization (Cardiology, Dermatology, Neurology, etc.)
- **Appointment Booking**: Select date, time, and provide consultation reason
- **Appointment History**: View upcoming and completed appointments
- **Responsive Interface**: Mobile-friendly design

### Doctor Features
- **Appointment Management**: View and manage patient appointments
- **Prescription System**: Add clinical notes, medications, and follow-up dates
- **Patient Records**: Track consultation history
- **Modal Interface**: Clean prescription form with validation

### Admin Features
- **User Overview**: Complete list of doctors and patients
- **Appointment Monitoring**: Track all system appointments
- **Statistics Dashboard**: Key metrics and insights
- **Data Tables**: Comprehensive user and appointment data

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Styling

The application uses Tailwind CSS for styling with:
- Responsive design
- Modern UI components
- Consistent color scheme
- Accessible design patterns

## Future Enhancements

- Backend integration with REST API
- Real-time chat functionality
- Video consultation features
- Payment integration
- File upload for medical documents
- Push notifications
- Advanced search and filtering
- Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 