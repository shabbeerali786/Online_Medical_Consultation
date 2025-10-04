import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AppointmentManagement from '../components/AppointmentManagement';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    notes: '',
    medications: '',
    followUpDate: ''
  });

  // Mock data
  useEffect(() => {
    const mockAppointments = [
      {
        id: 1,
        patientName: 'John Smith',
        patientEmail: 'john.smith@email.com',
        date: '2024-01-15',
        time: '10:00 AM',
        status: 'upcoming',
        reason: 'Heart checkup',
        prescription: null
      },
      {
        id: 2,
        patientName: 'Sarah Wilson',
        patientEmail: 'sarah.wilson@email.com',
        date: '2024-01-10',
        time: '2:00 PM',
        status: 'completed',
        reason: 'Chest pain',
        prescription: {
          notes: 'Patient shows signs of mild angina. Prescribed nitroglycerin.',
          medications: 'Nitroglycerin 0.4mg sublingual as needed',
          followUpDate: '2024-02-10'
        }
      },
      {
        id: 3,
        patientName: 'Mike Johnson',
        patientEmail: 'mike.johnson@email.com',
        date: '2024-01-20',
        time: '11:30 AM',
        status: 'upcoming',
        reason: 'Blood pressure check',
        prescription: null
      },
      {
        id: 4,
        patientName: 'Emily Davis',
        patientEmail: 'emily.davis@email.com',
        date: '2024-01-08',
        time: '3:00 PM',
        status: 'completed',
        reason: 'Irregular heartbeat',
        prescription: {
          notes: 'Patient diagnosed with atrial fibrillation. Started on blood thinners.',
          medications: 'Warfarin 5mg daily, Metoprolol 25mg twice daily',
          followUpDate: '2024-01-22'
        }
      }
    ];
    setAppointments(mockAppointments);
  }, []);

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!prescriptionForm.notes || !prescriptionForm.medications) {
      alert('Please fill in notes and medications');
      return;
    }

    const updatedAppointments = appointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return {
          ...apt,
          prescription: {
            notes: prescriptionForm.notes,
            medications: prescriptionForm.medications,
            followUpDate: prescriptionForm.followUpDate
          }
        };
      }
      return apt;
    });

    setAppointments(updatedAppointments);
    setSelectedAppointment(null);
    setPrescriptionForm({ notes: '', medications: '', followUpDate: '' });
    alert('Prescription uploaded successfully!');
  };

  const openPrescriptionModal = (appointment) => {
    setSelectedAppointment(appointment);
    if (appointment.prescription) {
      setPrescriptionForm({
        notes: appointment.prescription.notes,
        medications: appointment.prescription.medications,
        followUpDate: appointment.prescription.followUpDate
      });
    } else {
      setPrescriptionForm({ notes: '', medications: '', followUpDate: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
          <p className="text-sm text-gray-500">Specialization: {user?.specialization}</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
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
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Prescription Management
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'appointments' && <AppointmentManagement />}

        {activeTab === 'completed' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Completed Appointments</h2>
            {completedAppointments.length === 0 ? (
              <p className="text-gray-500">No completed appointments</p>
            ) : (
              <div className="space-y-4">
                {completedAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                        <p className="text-gray-600">{appointment.patientEmail}</p>
                        <p className="text-gray-600">{appointment.date} at {appointment.time}</p>
                        <p className="text-gray-600">Reason: {appointment.reason}</p>
                        {appointment.prescription && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-md">
                            <h4 className="font-semibold text-gray-900 mb-2">Prescription</h4>
                            <p className="text-gray-600 mb-2"><strong>Notes:</strong> {appointment.prescription.notes}</p>
                            <p className="text-gray-600 mb-2"><strong>Medications:</strong> {appointment.prescription.medications}</p>
                            {appointment.prescription.followUpDate && (
                              <p className="text-gray-600"><strong>Follow-up:</strong> {appointment.prescription.followUpDate}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          {appointment.status}
                        </span>
                        <button
                          onClick={() => openPrescriptionModal(appointment)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          {appointment.prescription ? 'Edit Prescription' : 'Add Prescription'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prescription Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedAppointment.prescription ? 'Edit Prescription' : 'Add Prescription'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Patient: {selectedAppointment.patientName} | Date: {selectedAppointment.date}
                </p>
                
                <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Clinical Notes
                    </label>
                    <textarea
                      id="notes"
                      value={prescriptionForm.notes}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                      rows="3"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter clinical notes and diagnosis"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-2">
                      Medications
                    </label>
                    <textarea
                      id="medications"
                      value={prescriptionForm.medications}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medications: e.target.value })}
                      rows="3"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter prescribed medications and dosages"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="followUpDate"
                      value={prescriptionForm.followUpDate}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, followUpDate: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {selectedAppointment.prescription ? 'Update Prescription' : 'Save Prescription'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAppointment(null);
                        setPrescriptionForm({ notes: '', medications: '', followUpDate: '' });
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard; 