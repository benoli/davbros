import PouchDB from 'pouchdb-node';
import find from 'pouchdb-find';
PouchDB.plugin(find);

import * as fs from 'fs';
//import { createBrotliDecompress } from 'zlib';

//const readline = require('readline');

const username = "sswsboss";
const password = "cA*RLp16qfP#*#";

//let remoteDB = new PouchDB('https://db.davbros.com.ar/davbros_dev', {auth:{username: username, password:password}});
let remoteDB = new PouchDB('https://db.davbros.com.ar/davbros_test', {auth:{username: username, password:password}});

const getOperarios = async ()=>{
    let query = await remoteDB.find({
        selector: {
          type: 'OPERARIO',
    
        }
      });
      return query.docs;
}

// remoteDB.changes({
//   since: 'now',
//   live: true,
//   include_docs: true
// }).on('change', async (change)=> {
//   // change.id contains the doc id, change.doc contains the doc
//   console.log(`A change has been made`);
//   console.log(change.doc);
//   if (change.deleted) {
//     // document was deleted
//   } else {
//     // document was added/modified
//   }
// }).on('error', function (err) {
//   // handle errors
// });

const saveSingleDoc = async(doc)=>{
  try {
      let response = await remoteDB.put(doc, {"force":true});
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

const createDB = async()=>{
  remoteDB = new PouchDB('https://db.davbros.com.ar/davbros_test', {auth:{username: username, password:password}});
}

const deleteDB = async()=>{
  try {
    let response = await remoteDB.destroy();
    console.log(response.ok);
  } catch (err) {
    console.log(err);
  }
}

const seedDb = async()=>{
    // await deleteDB()
    // await createDB();
  const docs = JSON.parse(fs.readFileSync(`resources/js/tools/dbBackup.json`));
  for await(const doc of docs){
    //console.log(doc);
    await saveSingleDoc(doc);
  }
  console.log(`Seed complete`);
}

const backupDb = async()=>{
  try {
    let docs = await remoteDB.allDocs({
      include_docs: true,
      attachments: true
    });
    let docsToSave = [];
    for await(const doc of docs.rows){
      console.log(doc.doc);
      docsToSave.push(doc.doc);
    }
    docsToSave = JSON.stringify(docsToSave);
    fs.appendFile(`resources/js/tools/dbBackup.json`, docsToSave, 'utf-8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      // console.log(data);
      console.log(`Backup done`);
    });
  } catch (err) {
    console.log(err);
  }
}

const main = async()=>{
  //await backupDb();
  //await seedDb();
  //await deleteDB();
  await createDB();
}
main();