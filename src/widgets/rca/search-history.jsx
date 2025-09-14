import { SearchRounded } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';

const SearchHistory = ({ history, search }) => {
    const handleSelectHistory = (item) => {
        search(item);
    };

    useEffect(() => {
        console.log({ len: history.length, history })
    }, [history])

    return (
        <div className="max-w-xxl mx-auto mt-8 p-4 bg-white rounded-2xl shadow-md mb-4">
            {history.length > 0 && (
                <div className="">
                    <p className="text-gray-500 text-sm mb-2">Recent Searches:</p>
                    <ul className="space-y-1">
                        {history.map((item, idx) => (
                            <li
                                key={idx}
                                onClick={() => handleSelectHistory(item)}
                                className="cursor-pointer px-3 py-1 hover:bg-gray-100 rounded-lg text-gray-700 flex justify-between group"
                            >
                                <div>{item.start_date}~{item.end_date} {item.ministry}</div>

                                <SearchRounded className='invisible group-hover:visible' />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchHistory;
