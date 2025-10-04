import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DocumentUpload = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    documentType: 'medical_report',
    description: '',
    appointmentId: '',
    sharedWith: []
  });
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    loadDocuments();
    loadAppointments();
    loadDoctors();
  }, [user]);

  const loadDocuments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/patient/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments?patientId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('patientId', user?.id);
    formData.append('documentType', uploadForm.documentType);
    formData.append('description', uploadForm.description);
    if (uploadForm.appointmentId) {
      formData.append('appointmentId', uploadForm.appointmentId);
    }
    if (uploadForm.sharedWith.length > 0) {
      formData.append('sharedWith', JSON.stringify(uploadForm.sharedWith));
    }

    try {
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([newDoc, ...documents]);
        setUploadForm({
          file: null,
          documentType: 'medical_report',
          description: '',
          appointmentId: '',
          sharedWith: []
        });
        // Reset file input
        document.getElementById('fileInput').value = '';
        alert('Document uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (docId, doctorIds) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${docId}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorIds })
      });

      if (response.ok) {
        loadDocuments();
        alert('Document shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document');
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/documents/${docId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc._id !== docId));
        alert('Document deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Upload Medical Document</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 mb-2">
              Select File (PDF, Images, Word - Max 10MB)
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {uploadForm.file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
              </p>
            )}
          </div>

          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              id="documentType"
              value={uploadForm.documentType}
              onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="medical_report">Medical Report</option>
              <option value="lab_result">Lab Result</option>
              <option value="prescription">Prescription</option>
              <option value="xray">X-Ray</option>
              <option value="scan">CT/MRI Scan</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="appointmentId" className="block text-sm font-medium text-gray-700 mb-2">
              Related Appointment (Optional)
            </label>
            <select
              id="appointmentId"
              value={uploadForm.appointmentId}
              onChange={(e) => setUploadForm({ ...uploadForm, appointmentId: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None</option>
              {appointments.map((apt) => (
                <option key={apt._id} value={apt._id}>
                  {apt.doctor?.user?.name} - {new Date(apt.dateTime).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add notes about this document"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with Doctors (Optional)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
              {doctors.map((doctor) => (
                <label key={doctor._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={uploadForm.sharedWith.includes(doctor.user._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setUploadForm({
                          ...uploadForm,
                          sharedWith: [...uploadForm.sharedWith, doctor.user._id]
                        });
                      } else {
                        setUploadForm({
                          ...uploadForm,
                          sharedWith: uploadForm.sharedWith.filter(id => id !== doctor.user._id)
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{doctor.user.name} - {doctor.specialization}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">My Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">
                        {doc.documentType === 'medical_report' && '📄'}
                        {doc.documentType === 'lab_result' && '🧪'}
                        {doc.documentType === 'prescription' && '💊'}
                        {doc.documentType === 'xray' && '🩻'}
                        {doc.documentType === 'scan' && '🔬'}
                        {doc.documentType === 'other' && '📋'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{doc.fileName}</h3>
                        <p className="text-sm text-gray-500">
                          {doc.documentType.replace('_', ' ').toUpperCase()} • {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                    )}
                    {doc.sharedWith && doc.sharedWith.length > 0 && (
                      <p className="text-sm text-gray-500">
                        Shared with: {doc.sharedWith.map(d => d.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={`http://localhost:5000${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      View
                    </a>
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Share Document</h3>
            <p className="text-sm text-gray-600 mb-4">Select doctors to share with:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {doctors.map((doctor) => (
                <label key={doctor._id} className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={selectedDoc.sharedWith?.some(d => d._id === doctor.user._id)}
                    onChange={(e) => {
                      const doctorId = doctor.user._id;
                      if (e.target.checked) {
                        handleShare(selectedDoc._id, [doctorId]);
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{doctor.user.name} - {doctor.specialization}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
