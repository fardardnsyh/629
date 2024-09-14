import React, { useEffect, useState } from 'react';

function TimeLeft({date,colors,prayerTimes,currentTime}) {

    const prayerTime = prayerTimes[currentTime];
    const [timeLeft,setTimeLeft] = useState(prayerTime.getTime() - Date.now());

    useEffect(()=>{
        setTimeLeft(prayerTime.getTime() - Date.now());
    },[date]);

  

    function getTimeLeftString()
    {
        
        let h = "" + Math.abs(parseInt(timeLeft /(1000 * 60 * 60) % 60));
        let m = "" + Math.abs(parseInt(timeLeft / (1000 * 60) % 60));
        let s = "" + Math.abs(parseInt(timeLeft / 1000 % 60));
        return `${("0"+Math.floor(h)).slice(-2)}:${("0"+Math.floor(m)).slice(-2)}:${("0"+Math.floor(s)).slice(-2)}`;
    }

    return (
        <div className='text-capitalize text-dark fs-3 text-center fw-semibold mt-5 bg-white w-100 p-2 rounded-2 shadow'    >
            {
            prayerTime>=Date.now() ?
            <>
                Upcoming Prayer <span style={{color:`color-mix(in srgb,${colors[currentTime][1]} 80%,black)`}}>
                    {currentTime}
                </span> in
            </> 
            :
            <>
                <span style={{color:`color-mix(in srgb,${colors[currentTime][1]} 80%,black)`}}>
                    {currentTime}
                </span> Prayer Started since
            </>
            }: <div className='px-2'>{getTimeLeftString()}</div>
        </div>
    );
}

export default TimeLeft;