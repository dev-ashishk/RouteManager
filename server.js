import ServerRouteManager from "./src/server/ServerRouteManager";
import routes from "./src/route.json";
const express = require('express');
const app = express();
const router = express.Router();
const port = 4000;

const serverRouteManager = new ServerRouteManager(app,{
    baseUrl : "/xyz",
    controllers: {
        hello: function(req,res,next){
            next();
        },
        sayHello: function(req,res){
            return res.send("Hello World !!");
        },
        returnParams: function(req,res,next){
            return res.send(req.params);
        }
    }
});
serverRouteManager.loadRoutes(routes);


app.listen(port, () => console.log(`Example app listening on port ${port}!`));