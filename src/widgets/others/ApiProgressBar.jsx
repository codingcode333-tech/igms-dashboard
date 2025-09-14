import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ totalDuration = 80000 }) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [timeLeftString, setTimeLeftString] = useState('')

    useEffect(() => {
        let interval;
        let startTime = Date.now();

        const simulateProgress = () => {
            interval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const percentage = Math.min((elapsedTime / totalDuration) * 100, 95);

                let time_left = (totalDuration - elapsedTime) / 10 ** 3
                let time_string = ` second${time_left >= 2 ? 's' : ''}`

                if (time_left >= 60) {
                    time_left = time_left / 60
                    time_string = ` minute${time_left >= 2 ? 's' : ''}`
                }

                setProgress(percentage);

                setTimeLeftString(`${Math.floor(time_left)}${time_string} left`)

                if (percentage >= 95) {
                    clearInterval(interval);
                }
            }, 100);
        };

        const fetchData = async () => {
            simulateProgress();

            // try {
            //     await apiCall(); // Wait for the API response
            //     clearInterval(interval);
            //     setProgress(100);
            //     setIsComplete(true);
            // } catch (error) {
            //     console.error('API call failed:', error);
            //     clearInterval(interval);
            //     setIsComplete(true);
            // }
        };

        fetchData();

        return () => clearInterval(interval);
    }, [totalDuration]);

    return (
        <div className="flex justify-center items-center h-[70vh] bg-gray-100">
            <div>
                <div className="relative h-4 w-[30vw] bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-blue-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                    ></motion.div>
                </div>
                <p className="mt-2 flex justify-between text-sm text-gray-600 px-2">
                    <span>{isComplete ? 'Completed' : 'Loading...'}</span>

                    <span>{timeLeftString}</span>
                </p>
            </div>
        </div>
    );
};

export default ProgressBar;
