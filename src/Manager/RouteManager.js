import Route from "./Route";

class RouteManager {
    constructor(config = {}) {
        this.beforeRegisterRoutes()
        this.types = ["get", "post", "put", "delete", "patch"];
        this.routes = config.routes || [];
        this.app = config.app || {};
        this.Route = config.Route || Route;
        this.get = this.findByName.bind(this);
        this.registerRoute = this.registerRoute.bind(this);
        this.beforeRegisterRoutes = this.beforeRegisterRoutes.bind(this);
        this.afterRegisterRoutes = this.afterRegisterRoutes.bind(this);
    }

    beforeRegisterRoutes() { }

    afterRegisterRoutes() { }

    loadRoutes(schema) {
        const keys = Object.keys(schema);
        for (let i = 0; i < keys.length; i++) {
            this.registerRoute(keys[i], schema[keys[i]]);
        }
        this.afterRegisterRoutes();
    }
    pushNewRoute(name, route) {
        const conf = {
            ref: this,
            name: name,
            schema: route,
            app: this.app,
        };
        this.routes.push(
            new this.Route(conf)
        );
    }
    registerRoute(name, route, forceUpdate = false) {
        try {
            if (forceUpdate) {
                this.pushNewRoute(name, route);
                return this;
            } else {
                if (!this.findByName(name)) {
                    this.pushNewRoute(name, route);
                    return this;
                } else {
                    throw `ERROR: URL config with name ${name} already exists. 
                           Use registerRoute(name<string>,route<Object>,forceUpdate<Boolean>) to force update.`
                }
            }
        } catch (err) {
            throw err;
        }
    }
    findByName(name) {
        try {
            console.log(this.routes.length)
            const route = this.routes.reduce((acc,inst) => {
                if(inst.name === name){
                    acc.push(inst)
                }
                return acc;
            },[]);
            if (route.length) {
                return route[0];
            } else {
                // super.warn("No route registered with name "+name);
                return null;
            }
        } catch (err) {
            throw err;
        }
    }
    getAllUrlsBymode(mode, types = this.types) {
        try {
            return this.routes.reduce(function (acc, route) {
                types.forEach(function (type) {
                    if (mode === "client") {
                        if (route.getClientURL(type)) {
                            acc.push({
                                type: type,
                                client: route.getClientURL(type)
                            })
                        }
                    } else {
                        if (route.getServerURL(type)) {
                            acc.push({
                                type: type,
                                server: route.getServerURL(type)
                            })
                        }
                    }
                });
                return acc;
            }, []);
        } catch (err) {
            throw err;
        }
    }
    getAllClientURL() {
        return this.getAllUrlsBymode("client");
    }
    getAllServerURL() {
        return this.getAllUrlsBymode("server");
    }
    getAllByType(type) {
        return [
            ...this.getAllUrlsBymode("client", [type]),
            ...this.getAllUrlsBymode("server", [type]),
        ]
    }
}

export default RouteManager;