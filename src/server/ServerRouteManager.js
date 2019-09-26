/**
 *  @author {Ashish Kumar}
 *  @class {ServerRouteManager}
 *  @extends {RouteManager}
 *  @constructor {<nodeServer>, <configObject>}
 *  @configObject = {
 *      Route: <Base Route Class>,
 *  }
 */
import RouteManager from "./../Manager/RouteManager";
import ServerRoute from "./ServerRoute";

class ServerRouteManager extends RouteManager {
    constructor(nodeServer, config = {}) {
        const configObj = {
            Route: config.Route || ServerRoute,
            app: nodeServer,
            ...config,
        }
        super(configObj);
        this.app = nodeServer || {};
        this.urlPrefix = config.baseUrl || "";
        this.controllers = config.controllers || {};
    }
    afterRegisterRoutes() {
        this.registerRoutesInApp();
    }
    registerRoutesInApp() {
        for (let i = 0; i < this.routes.length; i++) {
            const _this = this.routes[i];
            const route = _this.getRoute();
            /**
             *  Setting up express.Router() in the each serverRoute class Instance
             */
            const types = Object.keys(route);
            for (let i = 0; i < types.length; i++) {
                const type = types[i]
                const config = route[type];
                const url = _this.getClientURL(type);
                try {
                    if (typeof config["client"] === "object" && config["client"].hasOwnProperty("express")) {
                        const expConfig = config.client.express;
                        if (expConfig.controllers) {
                            const controllerListByUser = expConfig.controllers;
                            const controllers = _this.manager.controllers;
                            const middlewares = controllerListByUser.map((el) => {
                                const fn = el.split(".")[1];
                                if (controllers[fn]) {
                                    return controllers[fn];
                                } else {
                                    throw `Controller ${fn} as ${el} defined for ${url} not found.`;
                                }
                            });
                            _this.manager.app[type](`${_this.manager.urlPrefix}${url}`, middlewares);
                        } else {
                            throw `[x] No controller found for ${url}`;
                        }
                    }
                } catch (e) {
                    console.log(e);
                    _this.warn(`[x] No controller found for ${url}`);
                }
            }
        }
    }
}

export default ServerRouteManager;