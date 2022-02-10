// I need to put in a class maybe that do 2 actions => getRole (from a translated role) & translateRole (from a role);

let roles = [{'employee':'Empleado'}, {'controller':'Supervisor externo'}, {'admin':'Administrador'}];
let user = {'role':'controller'};
console.log(roles[roles.findIndex(role => Object.keys(role)[0] == user.role)][`${user.role}`]);