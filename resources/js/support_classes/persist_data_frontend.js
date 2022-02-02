
import PouchDB from 'pouchdb';
import find from 'pouchdb-find';
PouchDB.plugin(find);

const localDB = new PouchDB('localDavbros');
export class DB{
    constructor(){
        this.deleteAllDocs = this.deleteAllDocs.bind(this);
    }

    getSingleDoc = async(doc_id)=>{
        try {
            let singleDoc = await localDB.get(doc_id);
            return singleDoc;
        } catch (err) {
            console.log(err);
            return err;
        }  
    }

    getFojas = async ()=>{
        let query = await localDB.find({
            selector: {
              type: 'FOJA',
        
            }
          });
          return query.docs;
    }
    
    getClientes = async ()=>{
        try{
            let query = await localDB.find({
                selector: {
                  type: 'CLIENT',
            
                }
              });
              return query.docs;
        } catch(err){
            console.log(err);
            return err;
        }
    }
    
    saveSingleDoc = async(doc)=>{
        try {
            let response = await localDB.post(doc);
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
            let singleDoc = await localDB.get(doc_id);
            let response = await localDB.remove(singleDoc);
            console.log('Deleted Response');
            console.log(response);
            return response;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    deleteAllDocs = async()=>{
        localDB.allDocs({include_docs: true, descending: true}, async(err, docs)=> {
            for await(const doc of docs.rows){
                this.removeSingleDoc(doc.doc._id);
            }
        });
    }

    docExists = async(field, value)=>{
        let selector = {};
        selector[field] = value;
        try{
            let query = await localDB.find({selector
              });
              return (query.docs.length > 0);
        } catch(err){
            console.log(err);
            return err;
        }
    }

    getDocByField = async(field, value)=>{
        let selector = {};
        selector[field] = value;
        try{
            let query = await localDB.find({selector
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

}