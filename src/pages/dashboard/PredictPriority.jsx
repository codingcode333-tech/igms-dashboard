import { useState, useEffect } from 'react'
import { startLoading, stopLoading, useMaterialTailwindController } from '@/context';
import { Button, Input } from '@material-tailwind/react';
import { predictPriority } from '@/services/predict';

export function PredictPriority(props) {
  const [, dispatch] = useMaterialTailwindController()
  const [input, setInput] = useState('')
  const [isPriority, setIsPriority] = useState()

  const checkPriority = async () => {
    startLoading(dispatch)

    setIsPriority(await predictPriority(input))

    stopLoading(dispatch)
  }

  const updateInput = event => {
    setInput(event.target.value)
    setIsPriority()
  }

  return (
    <div className='flex flex-col gap-4 flex-wrap my-5'>
      <Input
        type='text'
        placeholder='Enter grievance'
        value={input}
        onChange={updateInput}
        onKeyDown={(e) => { if (e.key == 'Enter') checkPriority() }}
      />

      <div className="flex justify-between">
        <div className='mx-3 text-bold'>
          {
            isPriority != null &&
            (
              isPriority == 1
                ? <div className='text-green-500'>
                  Priority Grievance
                </div>
                : <div className='text-red-500'>
                  Not a Priority Grievance
                </div>
            )
          }
        </div>

        <Button className='self-end' onClick={checkPriority}> Predict </Button>
      </div>
    </div>
  )
}