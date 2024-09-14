import * as adhan from "adhan";
import './App.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { Accordion, Button, Col, Container, Form, Modal, Row, Spinner } from "react-bootstrap";
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './Store/store';
import { getCalcMethod, getCity, setCalcMethod, setCity } from "./Store/slice/settingsSlice";
import {initialize} from "hijri-js";

import { FaGlobeAfrica } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { FaInfoCircle } from "react-icons/fa";
import { RiWifiOffLine } from "react-icons/ri";

import Clock from "./Components/Clock";
import TimeLeft from "./Components/TimeLeft";


function App() {

  const dispatch = useDispatch();

  const prayerKeys = ["fajr","dhuhr","asr","maghrib","isha"];
  const timeKeys = ["fajr","dhuhr","asr","maghrib","isha"];
  const calcMethodKeys = ["MuslimWorldLeague","Egyptian","Karachi","UmmAlQura","Dubai","MoonsightingCommittee","NorthAmerica","Kuwait","Qatar","Singapore","Tehran","Turkey"];

  const [currentDate,setCurrentDate] = useState(Date.now());
  const [currentTime,setCurrentTime] = useState(0);
  const [prayerDay,setPrayerDay] = useState("today");

  const [prayerTimes,setPrayerTimes] = useState();

  const city = useSelector(store => store.settings.city);
  const calcMethod = useSelector(store => store.settings.calcMethod);

  const loading = useSelector(store => store.settings.loading);

  const [cityInput,setCityInput] = useState({name:city.name,lat:"",lon:""});
  const [calcMethodInput,setCalcMethodInput] = useState(calcMethod);

  const [cityModal, setCityModal] = useState(false);

  const handleClose = () => setCityModal(false);
  const handleShow = () => setCityModal(true);

  const colors = {
    // fajr: ["#D37569","#95A1C8"],
    fajr: ["#595980","#37374d"],
    dhuhr: ["#95A1C8","#88A3FD"],
    asr: ["#FFF7D4","#DB7393"],
    maghrib: ["#E7663E","#7C5596"],
    isha: ["#3A3A55","#191923"],
    // midnight: ["#3A3A55","#191923"]
  };

  const [errorMessage,setErrorMessage] = useState("");

  async function getCityCoords(city)
  {
    let coords = null;
    let url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${process.env.REACT_APP_API_KEY}`;
    await fetch(url)
    .then(resp=>{
      if(!resp.ok) throw new Error(resp.statusText);
      return resp.json();
    })
    .then(data=>{
      let c = data[0];
      setErrorMessage("");
      if(c)
      {
        coords = {lat:c.lat,lon:c.lon};
      }
      else
      {
        setTimeout(() => {
          setErrorMessage("Invalid City");
        },0);
      }
    })
    .catch(console.err);

    return coords;
  }

  function handleCityInput(e)
  {
    setCityInput({...cityInput,[e.target.name]:e.target.value})
  }

  async function submitCityInput(e)
  {
    e.preventDefault();
    if(!cityInput.lat || !cityInput.lon)
    {
      if(navigator.onLine)
      {
        let coords = await getCityCoords(cityInput.name);
        if(coords)
        {
          dispatch(setCity({...cityInput,lat:coords.lat,lon:coords.lon}));
          dispatch(setCalcMethod(calcMethodInput));
          setErrorMessage(null); 
          handleClose();
        }
      }
      else
      {
        setErrorMessage("Please Enter Coordinates (Required Offline)")
      }
    }
    else
    {
      dispatch(setCity(cityInput));
      dispatch(setCalcMethod(calcMethodInput));
      setErrorMessage(null); 
      handleClose();
    }
    setCityInput({...cityInput,lat:"",lon:""});
  }

  function getTimeString(time)
  {
    let h = time.getHours();
    let m = time.getMinutes();
    return `${h>12 ? h-12 : (h>0 ? h : 12)}:${m<10 ? "0"+m : m} ${h>=12 ? "PM" : "AM"}`;
  }

  function getCurrentTime(prayerTimes)
  {
    let targetIndex = null;
    let newPrayerDay = "today";

    prayerKeys.forEach((prayerKey,index)=>{
      if(targetIndex===null)
      {
        if(currentDate < prayerTimes.today[prayerKey].getTime()+30*60*1000)
        {
          targetIndex = index; 
        }
      }
    });
    if(targetIndex===null)
    {
      targetIndex = 0;
      newPrayerDay = "tomorrow";
    }
    setCurrentTime(targetIndex);
    setPrayerDay(newPrayerDay);
  }
 
  function getPageColor(prayerTimes,date)
  {
    if(!prayerTimes) return "black";

    // const midnightTime = new Date();
    // midnightTime.setHours(24); midnightTime.setMinutes(0);
    // prayerTimes.midnight = midnightTime;

    let targetIndex = null;
    timeKeys.forEach((timeKey,index)=>{
      if(targetIndex===null)
      {
        if(date < prayerTimes.today[timeKey].getTime())
        {
          targetIndex = index;
        }
      }
    });
    if(targetIndex===null) targetIndex = 0;

    let previousIndex = targetIndex ? targetIndex-1 : timeKeys.length-1;

    let percent = (date - prayerTimes.today[timeKeys[previousIndex]])/(prayerTimes.today[timeKeys[targetIndex]] - prayerTimes.today[timeKeys[previousIndex]]) * 100;
    if(percent < 0) percent = 100 + percent;
    else if(percent > 100) percent = 200 - percent;
    
    let c1 = `color-mix(in srgb, ${colors[timeKeys[targetIndex]][0]} ${percent}%, ${colors[timeKeys[previousIndex]][0]})`;
    let c2 = `color-mix(in srgb, ${colors[timeKeys[targetIndex]][1]} ${percent}%, ${colors[timeKeys[previousIndex]][1]})`;
    let g = `linear-gradient(${c1},${c2})`;
    return g;

  }

  function getHijriDate()
  {
    const hirji = initialize();
    const date = hirji.today();
    return date.full;
  }

  useEffect(()=>{
    if(!loading && !city.name)
    {
      handleShow();
    }
  },[loading,city])

  useEffect(()=>{
    dispatch(getCity());
    dispatch(getCalcMethod());
  },[]);

  useEffect(()=>{
    if(city && calcMethod)
    {
      setCityInput({...cityInput,name:city.name});
      setCalcMethodInput(calcMethod);

      let todayDate = new Date();
      let tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate()+1);
      let tempPrayerTimes = {
        today: new adhan.PrayerTimes(new adhan.Coordinates(city.lat,city.lon), todayDate, adhan.CalculationMethod[calcMethod]()),
        tomorrow: new adhan.PrayerTimes(new adhan.Coordinates(city.lat,city.lon), tomorrowDate, adhan.CalculationMethod[calcMethod]())
      }
      setPrayerTimes(tempPrayerTimes);
      getCurrentTime(tempPrayerTimes);
    }
  },[city,calcMethod]);


  useEffect(()=>{
    const timer = setInterval(()=>{
        setCurrentDate(Date.now());
        getCurrentTime(prayerTimes);
    },1000);

    return ()=> clearInterval(timer);  
  },[currentDate,prayerTimes]);

  return (
    <div className="page-container text-white d-flex align-items-center justify-content-center"
    style={{background:getPageColor(prayerTimes,currentDate)}}
    >
      <div className="decoration-container position-absolute w-100 h-100" style={{pointerEvents:"none"}}>
        <div className="masjid-background position-absolute bottom-0 right-0"></div>
        <div className="corner-decoration position-absolute bottom-0 left-0"></div>
        <div className="corner-decoration position-absolute bottom-0 right-0" style={{scale: "-1 1"}}></div>
        <div className="corner-decoration position-absolute top-0 left-0" style={{scale: "1 -1"}}></div>
        <div className="corner-decoration position-absolute top-0 right-0" style={{scale: "-1 -1"}}></div>
      </div>

      {
        !navigator.onLine &&
        <div className="offline-text fw-semibold position-absolute bottom-0 fs-5 mb-2 bg-danger px-3 py-1 rounded-pill shadow d-flex align-items-center gap-2">
          You're Offline
          <RiWifiOffLine size={25} />
        </div>
      }
    {
      !loading ?
      <>
        <Row className="w-100 g-0 mt-5 mt-md-0 py-5 py-md-0" style={{zIndex:1}}>
          <Col className="col-12 col-md-4 col-xl-6 d-flex flex-column align-items-center justify-content-center">
            <div className="d-flex flex-column align-items-center">
              <Clock date={currentDate} />
              <hr className="w-100 border border-white border-2" />
              <span className="fs-3 text-shadow fw-semibold">{getHijriDate()}</span>
              <span className="fs-3 text-shadow fw-semibold" style={{opacity:0.5}}>{new Date().toLocaleDateString()}</span>
            </div>
          </Col>
          <Col className="col-12 col-md-8 col-xl-6 d-flex flex-column align-items-center justify-content-center pt-5 pt-md-0">
            <h1 className="text-shadow text-center">
            {
              city ? <>Prayer Times for <span className="text-capitalize">{city.name}</span></>
              :
              "Enter a city to start"
            }
            </h1>
            <p className="m-0 mb-5 text-capitalize text-shadow fs-5 fw-semibold" style={{opacity:0.75}}>{prayerDay}</p>

            <div className="prayer-times-container px-3 d-flex flex-column gap-3">
            {
              prayerTimes && city.name &&
              prayerKeys.map((prayerKey,index)=>
              <div className={`prayer-text fs-4 fw-semibold d-flex justify-content-between align-items-center p-2 px-4 ${index===currentTime ? "active" : "text-shadow"}`}
              key={`prayer-${prayerKey}`}
              // style={{color: "rgb(200, 80, 150)"}}
              style={{color:`color-mix(in srgb,${colors[prayerKeys[currentTime]][1]} 80%,black)`}}
              >
                <span>{prayerKey}</span>
                <span>  
                  {getTimeString(prayerTimes[prayerDay][prayerKey])}
                </span>
              </div>
              )
            }
            {
              prayerTimes && city.name &&
              <TimeLeft date={currentDate} colors={colors} currentTime = {prayerKeys[currentTime]} prayerTimes={prayerTimes[prayerDay]}/>
            }
            </div>

          </Col>

          
          

        </Row>
        <Button variant="transparent"
        className="city-button fs-1 p-4 d-flex align-items-center justify-content-center position-absolute top-0"
        onClick={handleShow}
        >
          <FaGlobeAfrica className="city-button-icon" />
          <div className="city-button-label position-absolute fs-6 px-3 py-2 rounded-3">Preferences</div>
        </Button>
      </>
        
      : <Spinner />
    }
    


      <Modal contentClassName="text-white modal-bg-blur" className="" show={cityModal} centered={true} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title className="w-100 text-center">Preferences</Modal.Title>
          <Button variant="danger" className="position-absolute right-0 me-3 p-1 d-flex align-items-center justify-content-center" style={{aspectRatio:1}} onClick={handleClose}>
            <IoCloseSharp size={20} />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitCityInput}>
            <Form.Group controlId="exampleForm.ControlInput1">
              <div className="d-flex gap-3 flex-column">
                <div className="d-flex gap-1 flex-column">
                <div className="d-flex gap-1 flex-row align-items-center mb-1">
                  <Form.Label className="m-0">Where are you from?</Form.Label>
                  <div className="info-container d-flex justify-content-center position-relative">
                      <Button variant="transparent" className="info-button text-white"><FaInfoCircle/></Button>
                      <div className="position-absolute info-text p-2 rounded-3">Enter City Name only and Automatically get its Coordinates. <br/>(Requires connection)</div>
                  </div>
                </div>
                  <Form.Control type="text" placeholder="City Name" name="name" value={cityInput.name} onChange={handleCityInput}
                  style={{zIndex:0}}
                  />
                  <Accordion defaultActiveKey={!navigator.onLine && "0"}>
                    <Accordion.Item eventKey="0" className="bg-transparent border-0">
                      <Accordion.Header>
                        <div className="d-flex flex-row gap-3 align-items-center text-white">
                          <div variant="transparent" className={`p-0 ${navigator.onLine ? "text-white-50" : ""}`}>City Coordinates? {navigator.onLine && "(optional)"}</div>
                          <div className="info-container d-flex justify-content-center position-relative">
                            <div variant="transparent" className="info-button text-white"><FaInfoCircle/></div>
                            <div className="position-absolute info-text p-2 rounded-3">Manually Enter City Coordinates.<br/>(Works Offline)</div>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body className="text-white p-0 d-flex align-items-center justify-content-between">
                      <div>
                        <Form.Label className="m-0 mb-2">Latitude?</Form.Label>
                        <Form.Control type="number" name="lat" value={cityInput.lat} onChange={handleCityInput} placeholder="Latitude?"/>
                      </div>
                      <div>
                        <Form.Label className="m-0 mb-2">Longitude?</Form.Label>
                        <Form.Control type="number" name="lon" value={cityInput.lon} onChange={handleCityInput} placeholder="Longitude?"/>
                      </div>

                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                  
                </div>
                <div className="d-flex gap-1 flex-column">
                  <Form.Label>Which Calculation Method do you use?</Form.Label>
                  <Form.Select placeholder="City Name" value={calcMethodInput} onChange={(e)=>setCalcMethodInput(e.target.value)} >
                  {
                    calcMethodKeys.map((calcMethodKey)=>
                    <option key={`calcMethod-${calcMethodKey}`} value={calcMethodKey}>{calcMethodKey}</option>
                    )
                  }
                  </Form.Select>
                </div>
                <Button className="submit-city-button border-3" type="submit">Enter</Button>
              </div>
              {
                errorMessage &&
                <p className="mt-1 mb-0 text-danger fw-semibold error-message">{errorMessage}</p>
              }
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
