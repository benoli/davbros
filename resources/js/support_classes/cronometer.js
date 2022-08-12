import { DB } from './persist_data_frontend';

const db = new DB();

export class Cronometer{
    constructor(control){
        this.start = this.start.bind(this);
        this.finish = this.finish.bind(this);
        this.showTime = this.showTime.bind(this);
        this.convertMiliseconds = this.convertMiliseconds.bind(this);
        this.db = db;
        this.interval;
    }

    start = async()=>{

    }

    finish = async()=>{
    }

    showTime = async(control)=>{
        const clearIntervalFunc = async()=>{
            return new Promise((resolve, reject) => {
              clearInterval(this.interval);
              resolve();
            });
        }
        let time;
        if (!control.end) {
            const updateClock = async()=> {
              time = await this.convertMiliseconds(new Date() - new Date(control.start));
              document.getElementById('time').innerText = `${time.d} días, ${time.h}:${time.m}:${time.s}`;
            }
            document.getElementById('time').innerText = ``;
            //updateClock();
            await clearIntervalFunc();
            this.interval = setInterval(updateClock, 1000);
            // Atach cronometer and show live time
          }
          else{
            await clearIntervalFunc();
            time = await this.convertMiliseconds(new Date(control.end) - new Date(control.start));
            document.getElementById('time').innerText = `${time.d} días, ${time.h}:${time.m}:${time.s}`;
          }
        if (control.estado == `pendiente`) {
          await clearIntervalFunc();
          document.getElementById(`time`).innerText = `0:00`;
        }
    }

    dateFormat = async(dateToFormat)=>{
        let date = new Date(dateToFormat);
        let options = { weekday: 'short', day: 'numeric', month: 'numeric', hour: 'numeric', minute:'numeric' };
        return new Intl.DateTimeFormat('es-ES', options).format(date);
    }

    convertMiliseconds = async(miliseconds, format)=> {
        var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;
        
        total_seconds = parseInt(Math.floor(miliseconds / 1000));
        total_minutes = parseInt(Math.floor(total_seconds / 60));
        total_hours = parseInt(Math.floor(total_minutes / 60));
        days = parseInt(Math.floor(total_hours / 24));
      
        seconds = parseInt(total_seconds % 60);
        minutes = parseInt(total_minutes % 60);
        hours = parseInt(total_hours % 24);
        
        switch(format) {
          case 's':
              return total_seconds;
          case 'm':
              return total_minutes;
          case 'h':
              return total_hours;
          case 'd':
              return days;
          default:
              return { d: days, h: hours, m: minutes, s: seconds };
        }
      };

    ///
    // function Stopwatch(){
    //     var startTime, endTime, instance = this;
      
    //     this.start = function (){
    //       startTime = new Date();
    //     };
      
    //     this.stop = function (){
    //       endTime = new Date();
    //     }
      
    //     this.clear = function (){
    //       startTime = null;
    //       endTime = null;
    //     }
      
    //     this.getSeconds = function(){
    //       if (!endTime){
    //       return 0;
    //       }
    //       return Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    //     }
      
    //     this.getMinutes = function(){
    //       return instance.getSeconds() / 60;
    //     }      
    //     this.getHours = function(){
    //       return instance.getSeconds() / 60 / 60;
    //     }    
    //     this.getDays = function(){
    //       return instance.getHours() / 24;
    //     }   
    //   }
}