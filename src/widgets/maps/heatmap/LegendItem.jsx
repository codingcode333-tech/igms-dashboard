export default function LegendItem(props) {
    return (
        <div className='flex py-1 sm:py-2 gap-3'>
            <div className={`w-[18px] h-[18px] rounded-[3px] border-2 border-solid border-black ${props.className}`}></div>
            <div className='text-black font-bold text-[13px]' dangerouslySetInnerHTML={{ __html: props.text }}></div>
        </div>
    )
}