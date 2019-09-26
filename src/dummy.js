const routes = {
    "wfm2": {
        "get": {
            "client": {
                "url": "/wfm2/pipelines/:x/helloworld/:y",
                "requiredParams": {
                    "query": ["a", "b", "c"]
                }
            },
            "server": "/wfm2/pipelines/abcdef/:x/:y"
        }
    },
    "wfm3" : {
        "post" : {
            "server" : "/wfm/workspace/:workspace_id/workflow/:workflow_id/trigger/run_selected",
            "client": "/wfm/workspace/:workspace_id/workflow/:workflow_id/trigger/run_selected"
        }
    }
};

class Route {
    constructor(ref,name, schema) {
        this.manager = ref;
        this.availableModes = ["server", "client"];
        this.required = {
            get: { client: {}, server: {} },
            post: { client: {}, server: {} },
            put: { client: {}, server: {} },
            patch: { client: {}, server: {} },
            delete: { client: {}, server: {} }
        }
        this.name = name;
        this.route = schema;
        this.setRequiredUrlParams();
        this.setRequiredQueryParams();
    }
    getManager(){
        return this.manager;
    }
    setRequiredQueryParams() {
        for (let i = 0; i < this.availableModes.length; i++) {
            let mode = this.availableModes[i];
            let allTypes = Object.keys(this.required);
            for (let j = 0; j < allTypes.length; j++) {
                let type = allTypes[j]
                this.required[type][mode]["queryParams"] = this.route[type] && this.route[type][mode] && this.route[type][mode]["requiredParams"] && this.route[type][mode]["requiredParams"]["query"] || {};
            }
        }
    }
    setRequiredUrlParams() {
        for (let i = 0; i < this.availableModes.length; i++) {
            let mode = this.availableModes[i];
            let allTypes = Object.keys(this.required);
            for (let j = 0; j < allTypes.length; j++) {
                let type = allTypes[j]
                this.getRequiredUrlParams(type, mode);
            }
        }
    }
    getRequiredUrlParams(type, mode) {
        const url = this.getURL(type, mode);
        if (url) {
            this.required[type][mode]["urlParams"] = url.split("/").reduce(function (acc, el) {
                if (el.startsWith(":")) {
                    acc.push(el.slice(1));
                }
                return acc;
            }, []);
        } else {
            this.required[type][mode]["urlParams"] = [];
        }
    }
    get() {
        return this.route
    }
    getURL(type, mode) {
        try {
            const urlConfig = this.route[type];
            if (this.route[type]) {
                if (typeof urlConfig[mode] === 'object') {
                    return urlConfig[mode].url;
                } else {
                    return urlConfig[mode];
                }
            }

        } catch (err) {
            throw err;
        }
    }
    warn(msg) {
        console.warn(msg);
    }
    getClientURL(type = "get") {
        return this.getURL(type, "client");
    }
    getServerURL(type = "get") {
        return this.getURL(type, "server");
    }
    doesParamsHasAllKeys(type, mode, params) {
        let hasAllKeys = { valid: true, missing: [] };
        const requiredKeys = this.required[type][mode]["queryParams"];
        for (let i = 0; i < requiredKeys.length; i++) {
            if (!params[requiredKeys[i]]) {
                hasAllKeys.valid = false;
                hasAllKeys.missing.push(requiredKeys[i]);
            }
        }
        return hasAllKeys;
    }
    createQueryString(type, mode, params) {
        const paramsHaveKeys = this.doesParamsHasAllKeys(type, mode, params);
        if (paramsHaveKeys.valid) {
            const paramsKeys = Object.keys(params);
            const str = paramsKeys.reduce((acc, q, index) => {
                acc = acc + `${q}=${params[q]}${index === paramsKeys.length - 1 ? "" : "&"}`;
                return acc;
            }, "?");
            return str;
        } else {
            this.warn(`Parameter validation failed. Required query parameter [${paramsHaveKeys.missing.join(",")}] ${paramsHaveKeys.missing.length > 1 ? "are" : "is"} missing in payload`);
            return "";
        }
    }
    createParamsString(type, mode, params = {}) {
        const url = this.getURL(type, mode);
        if (url) {
            const param_string = url.split("/").map((el) => {
                if (el.startsWith(":")) {
                    if(params[el.slice(1)]){
                        return params[el.slice(1)]
                    }else{
                        throw `Missing required URL Parameter. "${el.slice(1)}" is missing in provided url params.`
                    }
                }
                return el;
            }).join("/") || "";
            return param_string;
        } else {
            throw `No url is defined for type=${type} & mode=${mode}`
        }
    }
    generateURLwithConfig(type, mode, config = {}) {
        try {
            const parsedURL = this.createParamsString(type, mode, config.params);
            const queryString = config.query && Object.keys(config.query).length && this.createQueryString(type, mode, config.query) || "";
            return parsedURL + queryString;
        } catch (err) {
            throw err;
        }
    }
}



class RouteManager {
    constructor(routes) {
        this.types = ["get", "post", "put", "delete", "patch"];
        this.routes = routes || [];
    }
    registerRoute(name,route,forceUpdate=false){
        try{
            if(forceUpdate){
                this.routes.push(new Route(this,name,route));
                return this;
            }else{
                if(!this.findByName(name)){
                    this.routes.push(new Route(this,name,route));
                    return this;
                }else{
                    throw `ERROR: URL config with name ${name} already exists. 
                           Use registerRoute(name<string>,route<Object>,forceUpdate<Boolean>) to force update.`
                }
            }
        }catch(err){
            throw err;
        }
    }
    findByName(name) {
        try {
            const route = this.routes.filter(inst => inst.name === name);
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
    getAllUrlsBymode(mode, types=this.types) {
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
    getAllByType(type){
        return [
            ...this.getAllUrlsBymode("client",[type]),
            ...this.getAllUrlsBymode("server",[type]),
        ]
    }
}


const keys = Object.keys(routes);
let arr = [];
const routeManager = new RouteManager();
for (let i = 0; i < keys.length; i++) {
    // arr.push(new Route(keys[i], routes[keys[i]]))
    const a = routeManager.registerRoute(keys[i],routes[keys[i]]);
    console.log(a);
}

const qParams = {
    query: {
    "a" : "1",
    "b" : "2",
    "c" : "akkadBakkad",
    "d" : "xyz"
    },
    params : {
        x: "ashish",
        y: "kumar"
    }
}
console.log(routeManager.findByName("wfm2").generateURLwithConfig("get","client",qParams));