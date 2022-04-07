import { DB } from './persist_data_frontend';

const db = new DB();

export class DigitalSign{
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
}