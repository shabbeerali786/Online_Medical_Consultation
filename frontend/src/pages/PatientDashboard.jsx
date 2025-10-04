import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AppointmentManagement from '../components/AppointmentManagement';

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

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load doctors from backend
        const doctorsResponse = await fetch('http://localhost:5000/api/doctors');
        if (doctorsResponse.ok) {
          const backendDoctors = await doctorsResponse.json();
          // Transform backend doctors to frontend format
          const transformedDoctors = backendDoctors.map(doctor => ({
            id: doctor._id,
            name: doctor.user.name,
            specialization: doctor.specialization,
            experience: '15 years', // You can add this field to your Doctor model
            rating: 4.8, // You can add this field to your Doctor model
            bio: doctor.bio
          }));
          setDoctors(transformedDoctors);
        } else {
          console.error('Failed to load doctors from backend');
          setDoctors([]);
        }

        // Load appointments from backend
        const appointmentsResponse = await fetch('http://localhost:5000/api/appointments');
        if (appointmentsResponse.ok) {
          const backendAppointments = await appointmentsResponse.json();
          // Transform backend data to frontend format
          const transformedAppointments = backendAppointments.map(apt => ({
            id: apt._id,
            patientName: apt.patient?.name || 'Unknown Patient',
            doctorName: apt.doctor?.user?.name || 'Unknown Doctor',
            date: new Date(apt.dateTime).toISOString().split('T')[0],
            time: new Date(apt.dateTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            status: apt.status,
            reason: apt.reason
          }));
          setAppointments(transformedAppointments);
        } else {
          console.error('Failed to load appointments from backend');
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setDoctors([]);
        setAppointments([]);
      }
    };

    loadData();
  }, []);

  const filteredDoctors = doctors.filter(doctor => 
    !selectedSpecialization || doctor.specialization === selectedSpecialization
  );

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.doctorId || !bookingForm.date || !bookingForm.time || !bookingForm.reason) {
      alert('Please fill in all fields');
      return;
    }

    const selectedDoctor = doctors.find(d => d.id === bookingForm.doctorId);
    
    try {
      // Convert time format from "10:00 AM" to "10:00"
      const timeOnly = bookingForm.time.replace(/\s*(AM|PM)/i, '');
      const isPM = bookingForm.time.toUpperCase().includes('PM');
      let [hours, minutes] = timeOnly.split(':');
      hours = parseInt(hours);
      
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
      
      // Create appointment data for backend
      const appointmentData = {
        patient: user?.id, // logged-in patient id
        doctor: selectedDoctor.id, // backend doctor id
        dateTime: new Date(`${bookingForm.date}T${hours.toString().padStart(2, '0')}:${minutes}:00`).toISOString(),
        reason: bookingForm.reason
      };

      console.log('Sending appointment data:', appointmentData);

      // Make API call to backend
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const newAppointment = await response.json();
      
      // Update local state
      setAppointments([...appointments, {
        id: newAppointment._id,
        patientName: user?.name || 'John Patient',
        doctorName: selectedDoctor.name,
        date: bookingForm.date,
        time: bookingForm.time,
        status: 'scheduled',
        reason: bookingForm.reason
      }]);

      setBookingForm({ doctorId: '', date: '', time: '', reason: '' });
      setActiveTab('appointments');
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(`Failed to book appointment: ${error.message}`);
    }
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
              Appointment Management
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

        {activeTab === 'appointments' && <AppointmentManagement />}
      </div>
    </div>
  );
};

export default PatientDashboard; 