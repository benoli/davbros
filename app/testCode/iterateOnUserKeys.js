const iterateUser = async()=>{   
    let user = {"id":4,"name":"Pepe","lastname":"Hongo","email":"pepe@me.com","email_verified_at":null,"role":"controller","created_at":"2022-02-10T18:43:58.000000Z","updated_at":"2022-02-10T18:43:58.000000"};
    for await (const [key, value] of Object.entries(user)){
        console.log(`${key} => ${value}`);
    }
}

const main = async()=>{
    await iterateUser();
  
  }
main();