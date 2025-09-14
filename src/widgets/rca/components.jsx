import { Autocomplete } from "@/pages/dashboard/CategoricalTree";
import { getSuggestions } from "@/services/category";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button, Input } from "@material-tailwind/react";
import { useState } from "react";

export const StatusBar = ({ max, current, className }) => {
    // Calculate the percentage based on current and max values
    const percentage = Math.min((current / max) * 100, 100); // Ensure it doesn't exceed 100%

    return (
        <div className={className}>
            <div className="w-full bg-gray-300 rounded-lg h-6">
                <div
                    className="bg-blue-500 h-full rounded-lg"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export const RCALeaf = ({ max, current, value, ministry }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [category, setCategory] = useState(value)

    return (
        <div className={"grid grid-cols-1 md:grid-cols-7 gap-2 items-center flex-wrap"}>
            <StatusBar max={max} current={current} className={"col-span-1"} />

            <div className="col-span-6 flex gap-2">
                <span className="font-bold text-blue-600">400</span>

                {
                    isEditing
                        ? <>
                            <RCACategoryAutocomplete ministry={ministry} category={category} setCategory={setCategory} className={"h-[1.5rem]"} />

                            <Button onClick={() => setIsEditing(false)}
                                className={`h-[1.5rem] px-3 flex justify-center items-center select-none`}
                            > SAVE </Button>
                        </>
                        : <>
                            <span className='font-bold text-blue-gray-800'>
                                {category}
                            </span>

                            <PencilSquareIcon
                                height={"1.3rem"}
                                width={"1.3rem"}
                                className='ml-3 text-blue-700 cursor-pointer'
                                onClick={() => setIsEditing(true)}
                            />
                        </>
                }
            </div>
        </div>
    )
}

const RCACategoryAutocomplete = ({ ministry, category, setCategory, className = '' }) => {
    const getOptions = async search => {
        const response = await getSuggestions(ministry, search)
        console.log(response)
        return []
    }

    return (
        <Autocomplete
            options={getOptions}
            value={{ text: category, value: category }}
            onChange={(value) => setCategory(value?.text)}
            placeholder={"Enter Category"}
            title={""}
            className={className + " rca-category-autocomplete"}
            xMarkClassName={"h-[1rem] -mt-1"}
        />
    )
}
