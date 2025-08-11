import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('doctors');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  // Mock data
  useEffect(() => {
    // Mock doctors data
    const mockDoctors = [
      { id: 1, name: 'Dr. Sarah Johnson', specialization: 'Cardiology', experience: '15 years', rating: 4.8 },
      { id: 2, name: 'Dr. Michael Chen', specialization: 'Dermatology', experience: '12 years', rating: 4.6 },
      { id: 3, name: 'Dr. Emily Davis', specialization: 'Neurology', experience: '18 years', rating: 4.9 },
      { id: 4, name: 'Dr. Robert Wilson', specialization: 'Orthopedics', experience: '20 years', rating: 4.7 },
      { id: 5, name: 'Dr. Lisa Brown', specialization: 'Pediatrics', experience: '10 years', rating: 4.5 },
      { id: 6, name: 'Dr. James Miller', specialization: 'Psychiatry', experience: '14 years', rating: 4.4 },
    ];
    setDoctors(mockDoctors);

    // Mock appointments data
    const mockAppointments = [
      { id: 1, doctorName: 'Dr. Sarah Johnson', date: '2024-01-15', time: '10:00 AM', status: 'upcoming', reason: 'Heart checkup' },
      { id: 2, doctorName: 'Dr. Michael Chen', date: '2024-01-10', time: '2:00 PM', status: 'completed', reason: 'Skin rash' },
      { id: 3, doctorName: 'Dr. Emily Davis', date: '2024-01-20', time: '11:30 AM', status: 'upcoming', reason: 'Headache consultation' },
    ];
    setAppointments(mockAppointments);
  }, []);

  const filteredDoctors = doctors.filter(doctor => 
    !selectedSpecialization || doctor.specialization === selectedSpecialization
  );

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.doctorId || !bookingForm.date || !bookingForm.time || !bookingForm.reason) {
      alert('Please fill in all fields');
      return;
    }

    const selectedDoctor = doctors.find(d => d.id === parseInt(bookingForm.doctorId));
    const newAppointment = {
      id: Date.now(),
      doctorName: selectedDoctor.name,
      date: bookingForm.date,
      time: bookingForm.time,
      status: 'upcoming',
      reason: bookingForm.reason
    };

    setAppointments([...appointments, newAppointment]);
    setBookingForm({ doctorId: '', date: '', time: '', reason: '' });
    setActiveTab('appointments');
    alert('Appointment booked successfully!');
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'doctors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Find Doctors
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'book'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Book Appointment
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Appointments
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'doctors' && (
          <div>
            <div className="mb-6">
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Specialization
              </label>
              <select
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Specializations</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Psychiatry">Psychiatry</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Experience: {doctor.experience}</p>
                    <p className="text-sm text-gray-600">Rating: ⭐ {doctor.rating}/5</p>
                  </div>
                  <button
                    onClick={() => {
                      setBookingForm({ ...bookingForm, doctorId: doctor.id });
                      setActiveTab('book');
                    }}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'book' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>
            <form onSubmit={handleBookingSubmit} className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor
                  </label>
                  <select
                    id="doctorId"
                    value={bookingForm.doctorId}
                    onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <select
                      id="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <textarea
                    id="reason"
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    rows="3"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your symptoms or reason for consultation"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('doctors')}
                    className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500">No upcoming appointments</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                          <p className="text-gray-600">{appointment.date} at {appointment.time}</p>
                          <p className="text-gray-600">Reason: {appointment.reason}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Past Appointments</h2>
              {pastAppointments.length === 0 ? (
                <p className="text-gray-500">No past appointments</p>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                          <p className="text-gray-600">{appointment.date} at {appointment.time}</p>
                          <p className="text-gray-600">Reason: {appointment.reason}</p>
                        </div>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard; 