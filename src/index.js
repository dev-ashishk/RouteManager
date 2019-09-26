import routes from "./route.json";
// import Route from "./Manager/Route";
import ClientRouteManager from "./client/ClientRouteManager";
import axios from "axios";

import ServerRouteManager from "./server/ServerRouteManager";


const instance = axios.create({
    baseURL: 'https://api.example.com'
});
const keys = Object.keys(routes);

const routeManager = new ServerRouteManager({
    app: instance
});
const clientRouteManager = new ClientRouteManager({
    app: instance
});
console.log(routeManager);
routeManager.registerRoutes(routes);
for (let i = 0; i < keys.length; i++) {
    
    clientRouteManager.registerRoute(keys[i], routes[keys[i]]);
    // ServerRouteManager.registerServerRoute(keys[i], routes[keys[i]]);
}

const qParams = {
    query: {
        "a": "1",
        "b": "2",
        "c": "3"
    },
    params: {
        x: "ashish",
        y: "kumar"
    },
    payload: JSON.stringify({data:[]})
}


const wfm = routeManager.get("wfm2");
console.log("server",routeManager);
console.log("client",clientRouteManager);

