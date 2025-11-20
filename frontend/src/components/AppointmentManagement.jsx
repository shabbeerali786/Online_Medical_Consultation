import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AppointmentManagement = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Reset flag when component mounts
    isFetchingRef.current = false;
    
    if (user?.id) {
      fetchAppointments();
    }
    
    // Cleanup: reset flag when component unmounts
    return () => {
      isFetchingRef.current = false;
    };
  }, [selectedStatus, selectedDate]);

  const fetchAppointments = async () => {
    if (isFetchingRef.current) {
      console.log('Already fetching, skipping...');
      return;
    }
    
    if (!user?.id) {
      console.log('No user ID, skipping fetch');
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      let url = 'http://localhost:5000/api/appointments?';
      
      if (user.userType === 'patient') {
        url += `patientId=${user.id}`;
      } else if (user.userType === 'doctor') {
        // Get doctor ID from user ID using the dedicated endpoint
        const doctorResponse = await fetch(`http://localhost:5000/api/doctors/user/${user.id}`);
        
        if (doctorResponse.ok) {
          const doctor = await doctorResponse.json();
          url += `doctorId=${doctor._id}`;
        } else {
          console.error('Doctor profile not found');
          setAppointments([]);
          setLoading(false);
          isFetchingRef.current = false;
          return;
        }
      }
      
      if (selectedStatus !== 'all') {
        url += `&status=${selectedStatus}`;
      }
      
      if (selectedDate) {
        url += `&date=${selectedDate}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }
      
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleCancelSubmit = async (cancellationReason) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointment._id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancelledBy: user.id,
          cancellationReason
        })
      });
      
      if (response.ok) {
        fetchAppointments();
        setShowCancelModal(false);
        setSelectedAppointment(null);
        alert('Appointment cancelled successfully');
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment');
    }
  };

  const handleRescheduleSubmit = async (newDateTime, rescheduleReason) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointment._id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDateTime,
          rescheduledBy: user.id,
          rescheduleReason
        })
      });
      
      if (response.ok) {
        fetchAppointments();
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        alert('Appointment rescheduled successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert('Error rescheduling appointment');
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      console.log('Updating appointment:', appointmentId, 'to status:', newStatus);
      
      // Reset the fetching flag to allow refetch after update
      isFetchingRef.current = false;
      
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      console.log('Status update response:', response.status);
      
      if (response.ok) {
        const updatedAppointment = await response.json();
        console.log('Updated appointment:', updatedAppointment);
        
        // Update the appointment in the local state immediately
        setAppointments(prev => prev.map(apt => 
          apt._id === appointmentId ? updatedAppointment : apt
        ));
        
        alert('Appointment status updated successfully');
      } else {
        const errorData = await response.json();
        console.error('Status update failed:', errorData);
        alert(`Failed to update appointment status: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert(`Error updating appointment status: ${error.message}`);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Appointment Management</h1>
      
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Appointments</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
        
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Appointments Table */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                {user.userType === 'patient' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                )}
                {user.userType === 'doctor' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(appointment.dateTime)}
                  </td>
                  {user.userType === 'patient' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.doctor?.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.doctor?.specialization}
                        </div>
                      </div>
                    </td>
                  )}
                  {user.userType === 'doctor' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patient?.email}
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.reason || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {appointment.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleRescheduleAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'in-progress')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => handleRescheduleAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                      {appointment.status === 'in-progress' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Complete
                        </button>
                      )}
                      {['scheduled', 'confirmed'].includes(appointment.status) && (
                        <button
                          onClick={() => handleCancelAppointment(appointment)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <CancelModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
          }}
          onCancel={handleCancelSubmit}
        />
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
          onReschedule={handleRescheduleSubmit}
        />
      )}
    </div>
  );
};

const CancelModal = ({ appointment, onClose, onCancel }) => {
  const [cancellationReason, setCancellationReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    onCancel(cancellationReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Cancel Appointment</h2>
        <p className="mb-4 text-gray-600">
          Are you sure you want to cancel this appointment scheduled for {new Date(appointment.dateTime).toLocaleString()}?
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Cancel Appointment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Keep Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RescheduleModal = ({ appointment, onClose, onReschedule }) => {
  const [newDateTime, setNewDateTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDateTime) {
      alert('Please select a new date and time');
      return;
    }
    onReschedule(newDateTime, rescheduleReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Reschedule Appointment</h2>
        <p className="mb-4 text-gray-600">
          Current appointment: {new Date(appointment.dateTime).toLocaleString()}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Date & Time
            </label>
            <input
              type="datetime-local"
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rescheduling
            </label>
            <textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reschedule
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentManagement;
