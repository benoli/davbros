import { DB } from './persist_data_frontend';

const db = new DB();

export class Cronometer{
    constructor(control){
        this.start = this.start.bind(this);
        this.finish = this.finish.bind(this);
        this.showTime = this.showTime.bind(this);
        this.db = db;
        this.control = control;
    }

    start = async()=>{

    }

    finish = async()=>{
    }

    showTime = async()=>{

    }

    dateFormat = async(dateToFormat)=>{
        let date = new Date(dateToFormat);
        let options = { weekday: 'short', day: 'numeric', month: 'numeric', hour: 'numeric', minute:'numeric' };
        return new Intl.DateTimeFormat('es-ES', options).format(date);
    }

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