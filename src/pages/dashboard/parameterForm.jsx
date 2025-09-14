import PropTypes from 'prop-types';
import React, { useState } from 'react';

const ParameterForm = ({ onSubmit }) => {
  const [level, setLevel] = useState('');
  const [threshold, setThreshold] = useState('');
  const [ministry, setMinistry] = useState('');
  // const [locationName, setLocationName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ level, threshold, ministry });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="level" className="block text-gray-700 font-semibold mb-1">Level:</label>
          <input
            type="text"
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="threshold" className="block text-gray-700 font-semibold mb-1">Threshold:</label>
          <input
            type="text"
            id="threshold"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="ministry" className="block text-gray-700 font-semibold mb-1">Parent Name:</label>
          <input
            type="text"
            id="ministry"
            value={ministry}
            onChange={(e) => setMinistry(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        {/* <div className="flex-1">
          <label htmlFor="location" className="block text-gray-700 font-semibold mb-1">Location Type:</label>
          <input
            type="text"
            id="location"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div> */}

      </div>
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
      >
        Fetch Data
      </button>
    </form>
  );
};

// Define PropTypes for the component
ParameterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default ParameterForm;
