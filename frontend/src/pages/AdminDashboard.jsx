import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from '../components/UserManagement';
import DoctorVerification from '../components/DoctorVerification';
import AppointmentManagement from '../components/AppointmentManagement';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch users and doctors from API
        const [usersResponse, doctorsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/users'),
          fetch('http://localhost:5000/api/doctors')
        ]);

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
          
          // Calculate stats
          const totalUsers = usersData.length;
          const totalDoctors = usersData.filter(u => u.role === 'doctor').length;
          const totalPatients = usersData.filter(u => u.role === 'patient').length;
          
          setStats(prevStats => ({
            ...prevStats,
            totalUsers,
            totalDoctors,
            totalPatients
          }));
        }

        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json();
          setDoctors(doctorsData);
        }

        // Fetch appointments from API
        const appointmentsResponse = await fetch('http://localhost:5000/api/appointments');
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          setAppointments(appointmentsData);
          
          // Calculate appointment stats
          const totalAppointments = appointmentsData.length;
          const upcomingAppointments = appointmentsData.filter(a => a.status === 'upcoming' || a.status === 'scheduled').length;
          const completedAppointments = appointmentsData.filter(a => a.status === 'completed').length;
          
          setStats(prevStats => ({
            ...prevStats,
            totalAppointments,
            upcomingAppointments,
            completedAppointments
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Reload data every 30 seconds
      const loadData = async () => {
        try {
          const usersResponse = await fetch('http://localhost:5000/api/users');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData);
          }

          const appointmentsResponse = await fetch('http://localhost:5000/api/appointments');
          if (appointmentsResponse.ok) {
            const appointmentsData = await appointmentsResponse.json();
            setAppointments(appointmentsData);
          }
        } catch (error) {
          console.error('Error refreshing data:', error);
        }
      };

      loadData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const patients = users.filter(user => user.role === 'patient');
  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming' || apt.status === 'scheduled');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'verification'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Doctor Verification
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Appointment Management
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && <UserManagement />}
        
        {activeTab === 'verification' && <DoctorVerification />}

        {activeTab === 'appointments' && <AppointmentManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard; 