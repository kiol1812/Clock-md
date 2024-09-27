'use client'
import React, { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

function updateCalendar(date:Date) {
  const dayNames_char = ["S", "M", "T", "W", "T", "F", "S"];
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  var calendarGrid:React.ReactNode[]=[];
  dayNames_char.forEach((obj)=>{
    calendarGrid.push(<div className={styles.calendar_grid_span} id={`${obj}`}>{obj}</div>);
  });
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarGrid.push(<div className={styles.calendar_grid_span} id={`${i}`}></div>);
  }
  for (let day=1; day <= daysInMonth; day++) {
    calendarGrid.push(day==date.getDate()?<div className={styles.today} id={`${day}`}>{day}</div>:<div className={styles.calendar_grid_span} id={`${day}`}>{day}</div>);
  }
  return calendarGrid;
}

export default function Home() {
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.error(
                `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
            );
        });
    } else {
        document.exitFullscreen();
    }
  }
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const timerRef = useRef<NodeJS.Timeout|null>(null);
  const [now_time, setTime] = useState<Date|null>(null);
  const [monthName, setMonthName] = useState<String>("");
  const [minute, setMinute] = useState<String>("");
  const [hour, setHour] = useState<String>("");
  const [calender, setCalender] = useState<React.ReactNode[]|null>(null);
  useEffect(()=>{
    timerRef.current = setInterval(()=>{
      const now = new Date();
      const month = now.getMonth();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const s_hour = hours < 10 ? "0" + hours : ""+hours;
      const s_minute = minutes < 10 ? "0" + minutes : ""+minutes;
      if(monthNames[month]!=monthName) setMonthName(monthNames[month]);
      if(hour!=s_hour) setHour(s_hour);
      if(minute!=s_minute) setMinute(s_minute);
      setTime(now);
    }, 1000); //1s
    return ()=>{
      if(timerRef.current) clearInterval(timerRef.current);
    }
  }, []);
  useEffect(()=>{
    console.log("update year and month");
    setCalender(updateCalendar(now_time||new Date()));
  }, [monthName])
  return (
    <div>
      <main>
        <div className={styles.clock_container}>
            <div id="time" className={styles.clock} onClick={toggleFullscreen}>{`${hour}:${minute}`}</div>
            <div className={styles.calendar_container}>
                <div id="month_name" className={styles.month_name}>{monthName}</div>
                <div className={styles.calendar_grid} id="calendar_grid">{calender}</div>
            </div>
        </div>
      </main>
      {/* <footer>
      </footer> */}
    </div>
  );
}
