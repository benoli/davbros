// CHANGE THIS -> Get credentials using XHR not in file because when file is cached by SW, credentials are exposed.
const config = require('./env.json');
const env = config.env; // can be dev, test or pro
console.log(`Working on ${env} mode`);
import PouchDB from 'pouchdb';
import find from 'pouchdb-find';
PouchDB.plugin(find);
export class DB{
    constructor(){
        this.deleteAllDocs = this.deleteAllDocs.bind(this);
        this.sectorExists = this.sectorExists.bind(this);
        this.localDB = new PouchDB(`${config[`${env}`].local}`);;
        this.remoteDB = new PouchDB(`https://db.davbros.com.ar/${config[`${env}`].remote}`, {auth:{username: config.credentials.username, password:config.credentials.password}});
        this.localDB.sync(this.remoteDB, {
            live: true,
            retry: true
            })
              .on('complete', function () {
                  M.toast({html: 'Datos Actualizados.'});
                  console.log("Yeah bitch we are syncing with remote Magnets!!!");
              })
              .on('error', function (err) {
                console.log('Error on Pouch DB');
                console.log(err);
          });
        // this.localDB.createIndex({
        //     index: {
        //         fields: ['type', 'estado', 'end'],
        //         ddoc: "index-show-servicios"
        //     }
        // });
    }

    getSingleDoc = async(doc_id)=>{
        try {
            let singleDoc = await this.localDB.get(doc_id);
            return singleDoc;
        } catch (err) {
            console.log(err);
            return err;
        }  
    }
    
    getClientes = async ()=>{
        let query = await this.localDB.find({
            selector: {
                type: 'CLIENT',
        
            }
            });
            return query.docs;
    }

    getCantClientes = async ()=>{
        let query = await this.localDB.find({
            selector: {
                type: 'CLIENT',
        
            }
            });
            return query.docs.length;
    }

    getSectores = async ()=>{
        try{
            let query = await this.localDB.find({
                selector: {
                  type: 'SECTOR',
            
                }
              });
              return query.docs;
        } catch(err){
            console.log(err);
            return err;
        }
    }

    getPlanillas = async ()=>{
        let query = await this.localDB.find({
            selector: {
              type: 'PLANILLA',
        
            }
          });
          return query.docs;
    }

    getControles = async ()=>{
        let query = await this.localDB.find({
            selector: {
              type: 'CONTROL',
        
            }
          });
          return query.docs;
    }

    getControlesByDate = async(from=false, to=false)=>{
        let selector = {};
        if (!from && !to) {
            selector = {
                type: 'CONTROL',
                estado:'terminado', 
                end: {$gte: null}
            };
        }
        else if(from && !to){
            selector = {
                type: 'CONTROL',
                estado:'terminado', 
                end: {$gte: from}
            };
        }
        else{
            selector = {
                type: 'CONTROL',
                estado:'terminado',
                $and: [
                    { end: {$gte: from}},
                    { end: {$lte: to} }
                  ]
            };
        }
        // let explain = await this.localDB.explain({selector:selector, use_index: 'index-show-servicios'});
        // let explain = await this.localDB.explain({selector:selector});
        // console.log(`Explanation is`);
        // console.log(explain);
        let query = await this.localDB.find({selector:selector});
        // console.log(query.docs);
        return query.docs.length;
    }
    
    getOperarios = async ()=>{
        let query = await this.localDB.find({
            selector: {
              type: 'OPERARIO',
        
            }
          });
          return query.docs;
    }
    
    saveSingleDoc = async(doc)=>{
        try {
            let response = await this.localDB.post(doc);
            console.log('Response after db.post Save single DOC');
            console.log(response);
            console.log('The doc is');
            console.log(doc);
            return response;
        } catch (err) {
            console.log(err);
            return err;
        }  
    }
    
    removeSingleDoc = async(doc_id)=>{
        try {
            let singleDoc = await this.localDB.get(doc_id);
            let response = await this.localDB.remove(singleDoc);
            console.log('Deleted Response');
            console.log(response);
            return response;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    deleteAllDocs = async()=>{
        this.localDB.allDocs({include_docs: true, descending: true}, async(err, docs)=> {
            for await(const doc of docs.rows){
                this.removeSingleDoc(doc.doc._id);
            }
        });
    }

    docExists = async(field, value)=>{
        let selector = {};
        selector[field] = value;
        try{
            let query = await this.localDB.find({selector
              });
              console.log(`Docs on Exists are`);
              console.log(query.docs);
              return (query.docs.length > 0);
        } catch(err){
            console.log(err);
            return err;
        }
    }

    sectorExists = async(clientID, sectorName)=>{
        let selector = {client:clientID, nombre:sectorName};
        try{
            let query = await this.localDB.find({selector
              });
              return (query.docs.length > 0);
        } catch(err){
            console.log(err);
            return err;
        }
    }

    planillaExists = async(clientID, sectorID)=>{
        let selector = {client:clientID, sector:sectorID, type:"PLANILLA"};
        try{
            let query = await this.localDB.find({selector
              });
              return (query.docs.length > 0);
        } catch(err){
            console.log(err);
            return err;
        }
    }

    getPlanillaByFields = async(clientID, sectorID)=>{
        let selector = {client:clientID, sector:sectorID, type:"PLANILLA"};
        try{
            let query = await this.localDB.find({selector
              });
              return (query.docs[0]);
        } catch(err){
            console.log(err);
            return err;
        }
    }

    getSectoresByClient = async(clientID)=>{
        let selector = {client:clientID, type:'SECTOR'};
        try{
            let query = await this.localDB.find({selector});
              return query.docs;
        } catch(err){
            console.log(err);
            return err;
        }
    }

    getDocByField = async(field, value)=>{
        let selector = {};
        selector[field] = value;
        try{
            let query = await this.localDB.find({selector
              });
              if (query.docs.length > 0) {
                  return query.docs[0];
              }
              return false;
        } catch(err){
            console.log(err);
            return err;
        }
    }

    getDocBySelector = async(selector)=>{
        try{
            let query = await this.localDB.find({selector});
            // console.log(`Query data`);
            // console.log(query);
            // console.log(`STATS =========================`);
            // console.log(query.execution_stats);
            if (query.docs.length > 0) {
                return query.docs;
            }
            return false;
        } catch(err){
            console.log(err);
            return err;
        }
    }


    areDocsRelated = async(selector)=>{
        try{
            let query = await this.localDB.find({selector});
            if (query.docs.length > 0) {
                return true;
            }
            return false;
        } catch(err){
            console.log(`Error on are docs related`);
            console.log(err);
            return false;
        }
    }

}