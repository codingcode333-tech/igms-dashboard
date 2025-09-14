import React, { useState } from 'react';

const BulletPointCreator = () => {
    const [inputValue, setInputValue] = useState('');
    const [bulletPoints, setBulletPoints] = useState([]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            setBulletPoints([...bulletPoints, inputValue]);
            setInputValue(''); // Clear the input after adding a bullet point
        }
    };

    return (
        <div>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type and press Enter to add a bullet point"
                style={{ padding: '8px', width: '80%', marginBottom: '10px', fontSize: '16px' }}
                className="no-print"
            />
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                {bulletPoints.map((point, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BulletPointCreator;
