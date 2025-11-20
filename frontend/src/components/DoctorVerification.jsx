import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DoctorVerification = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, [selectedStatus]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const url = selectedStatus === 'all' 
        ? 'http://localhost:5000/api/doctors'
        : `http://localhost:5000/api/doctors?status=${selectedStatus}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowVerificationModal(true);
  };

  const handleVerificationSubmit = async (status, rejectionReason = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${selectedDoctor._id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          verifiedBy: user.id,
          rejectionReason
        })
      });
      
      if (response.ok) {
        fetchDoctors();
        setShowVerificationModal(false);
        setSelectedDoctor(null);
        alert(`Doctor ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      } else {
        alert(`Failed to ${status} doctor`);
      }
    } catch (error) {
      console.error('Error verifying doctor:', error);
      alert('Error verifying doctor');
    }
  };

  if (user?.userType !== 'admin') {
    return <div className="text-center text-red-600">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Doctor Verification</h1>
      
      {/* Status Filter */}
      <div className="mb-6">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Doctors</option>
          <option value="pending">Pending Verification</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Doctors Table */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doctor.user?.name}</div>
                      <div className="text-sm text-gray-500">{doctor.user?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.specialization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.licenseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.qualification}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.experience} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      doctor.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      doctor.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doctor.verificationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyDoctor(doctor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {doctor.verificationStatus === 'pending' ? 'Review' : 'View Details'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && selectedDoctor && (
        <VerificationModal
          doctor={selectedDoctor}
          onClose={() => {
            setShowVerificationModal(false);
            setSelectedDoctor(null);
          }}
          onVerify={handleVerificationSubmit}
        />
      )}
    </div>
  );
};

const VerificationModal = ({ doctor, onClose, onVerify }) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = () => {
    onVerify('approved');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onVerify('rejected', rejectionReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Doctor Verification Details</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{doctor.user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{doctor.user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{doctor.user?.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <p className="mt-1 text-sm text-gray-900">{doctor.specialization}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">License Number</label>
              <p className="mt-1 text-sm text-gray-900">{doctor.licenseNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Qualification</label>
              <p className="mt-1 text-sm text-gray-900">{doctor.qualification}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <p className="mt-1 text-sm text-gray-900">{doctor.experience} years</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
              <p className="mt-1 text-sm text-gray-900">${doctor.consultationFee}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <p className="mt-1 text-sm text-gray-900">{doctor.bio || 'No bio provided'}</p>
          </div>

          {doctor.verificationDocuments && doctor.verificationDocuments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Documents</label>
              <div className="mt-1 space-y-2">
                {doctor.verificationDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{doc.documentType}:</span>
                    <a 
                      href={doc.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {doctor.verificationStatus === 'rejected' && doctor.rejectionReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Previous Rejection Reason</label>
              <p className="mt-1 text-sm text-red-600">{doctor.rejectionReason}</p>
            </div>
          )}

          {doctor.verificationStatus === 'pending' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Rejection Reason (if rejecting)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Provide reason for rejection..."
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-6">
          {doctor.verificationStatus === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorVerification;
