import React, { useEffect, useState } from 'react';

function Clock({date}) {

    const [seconds,setSeconds] = useState(0);
    const [minutes,setMinutes] = useState(0);
    const [hours,setHours] = useState(0);

    const [angleRounds,setAngleRounds] = useState({
        s: 0,
        m: 0,
        h: 0
    })

    useEffect(()=>{
        updateTime();
    },[date]);

    function updateTime()
    {
        let t = new Date();
        let s = t.getSeconds();
        let m = t.getMinutes();
        let h = t.getHours();

        const angleRoundsTemp = angleRounds;
        if(s===0 && seconds) angleRoundsTemp.s++;
        if(m===0 && minutes) angleRoundsTemp.m++;
        if(h===0 && hours) angleRoundsTemp.h++;

        setSeconds(s);
        setMinutes(m);
        setHours(h);
        setAngleRounds(angleRoundsTemp);
    }

    function getHourAngle()
    {
        return `${360*angleRounds.h + (hours>12 ? hours-12 : hours)*30 + minutes/2 }deg`;
    }

    function getMinuteAngle()
    {
        return `${360*angleRounds.m+minutes*6}deg`;
    }

    function getSecondAngle()
    {
        return `${360*angleRounds.s+seconds*6}deg`
    }

    function getTimeString()
    {
        return `${("0"+(hours%12 || 12)).slice(-2)}:${("0"+Math.floor(minutes)).slice(-2)} ${hours>=12 ? "PM" : "AM"}`;
    }

    return (
        <div className='d-flex flex-column align-items-center gap-3'>
            <div className='clock-container my-5 rounded-circle d-flex align-items-center justify-content-center'>
                <div className='clock-background position-absolute'></div>
                <div className='position-absolute clock-hand-transition d-flex align-items-center jusitfy-content-center' style={{rotate: getHourAngle()}}>
                    <div className='hours-hand rounded-pill' ></div>
                </div>
                <div className='position-absolute clock-hand-transition d-flex align-items-center jusitfy-content-center' style={{rotate: getMinuteAngle()}}>
                    <div className='minutes-hand rounded-pill' ></div>
                </div>
                <div className='position-absolute clock-hand-transition d-flex align-items-center jusitfy-content-center' style={{rotate: getSecondAngle()}}>
                    <div className='seconds-hand rounded-pill' ></div>
                </div>
                <div className='position-absolute rounded-circle bg-white' style={{height:"10px",aspectRatio:1}}></div>
            </div>
            <div className='fs-2 text-shadow'>{getTimeString()}</div>
        </div>
    );
}

export default Clock;