'use client'
import React, { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { Editor } from "@/components/md_editor";
import { Viewer } from "@/components/md_viewer";

import { useHotkeys } from "@mantine/hooks";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdowm from 'react-markdown';
import Script from "next/script";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import hljs from "highlight.js";
import "highlight.js/styles/agate.css"

function updateCalendar(date:Date) {
  const dayNames_char = ["S", "M", "T", "W", "T", "F", "S"];
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarGrid:React.ReactNode[]=[];
  dayNames_char.forEach((obj)=>{ calendarGrid.push(<div className={styles.calendar_grid_span} id={`${obj}`}>{obj}</div>); });
  for (let i = 0; i < firstDayOfMonth; i++) calendarGrid.push(<div className={styles.calendar_grid_span} id={`${i}`}></div>);
  for (let day=1; day <= daysInMonth; day++) calendarGrid.push(day==date.getDate()?<div className={styles.today} id={`${day}`}>{day}</div>:<div className={styles.calendar_grid_span} id={`${day}`}>{day}</div>);
  return calendarGrid;
}

export default function Home() {
  const [isFullScreen, setFullScreen] = useState<boolean>(false);
  const [isediting, setEditing] = useState<boolean>(true);
  const [worksapce, setWorksapce] = useState<boolean>(true);
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.error(
                `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
            );
        });
        setFullScreen(true);
        setEditing(false);
    } else {
        document.exitFullscreen();
        setFullScreen(false);
    }
  }
  const timerRef = useRef<NodeJS.Timeout|null>(null);
  const [monthName, setMonthName] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [hour, setHour] = useState<string>("");
  const [calender, setCalender] = useState<React.ReactNode[]|null>(null);
  const [text, setText] = useState<string>("");
  useEffect(()=>{
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
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
    }, 1000); //1s
    return ()=>{
      if(timerRef.current) clearInterval(timerRef.current);
    }
  }, [hour, minute, monthName]);
  useEffect(()=>{
    console.log("update year and month");
    setCalender(updateCalendar(new Date()));
  }, [monthName]);
  useEffect(()=>{
    hljs.highlightAll();
  }, [text]);
  useHotkeys([['/', ()=>setWorksapce(!worksapce)]]);
  return (
    <div>
      <main>
        <div className={styles.clock_container}>
            <div id="offset" style={{width:`55px`}} />
            <div id="time" className={styles.clock} onClick={toggleFullscreen}>{`${hour}:${minute}`}</div>
            <div className={styles.calendar_container}>
                <div id="month_name" className={styles.month_name}>{monthName}</div>
                <div className={styles.calendar_grid} id="calendar_grid">{calender}</div>
            </div>
        </div>
        {worksapce?
        <div className={styles.workspace}>
          {isediting?<Editor>
            <textarea placeholder="type something or choose a template." value={text} onChange={e=>setText(e.target.value)} />
          </Editor>:<></>}
          <div onClick={()=>{setEditing(!isediting)}}>
            <Viewer w={isediting?384:768} >
              <h4>{(!isFullScreen)?(isediting)?"Click to close editor.":"Click to editing.":""}</h4>
              <div>
                <ReactMarkdowm
                  className={styles.doc}
                  remarkPlugins={[remarkGfm, remarkMath]} 
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                  disallowedElements={["katex-html"]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
                          style={a11yDark}
                          PreTag="div"
                          language={match[1]}
                          // {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className ? className : ""} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {matter(text).content||text}
                </ReactMarkdowm>
                <Script
                    id="load mermaid"
                    type='module'
                    strategy='afterInteractive'
                    dangerouslySetInnerHTML={{
                      __html: `
                      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@9/dist/mermaid.esm.min.mjs";
                      mermaid.initialize({startOnLoad: true});
                      mermaid.contentLoaded();
                      `
                    }}
                />
                {/* <Script id="load hight min" src="highlightjs/build/highlight.min.js" />
                <Script id="load languages render" src="highlightjs/build/languages/a11yDark.min.js" />
                <Script id="load language elm" src="highlightjs/build/languages/elm.min.js" />
                <Script
                  id = "onload highlight"
                  type="js"
                  strategy='afterInteractive'
                  dangerouslySetInnerHTML={{
                    __html: `
                    hljs.initHighlightingOnLoad();
                    `
                  }}
                /> */}
              </div>
            </Viewer>
          </div>
        </div>
        :<></>}
      </main>
    </div>
  );
}
