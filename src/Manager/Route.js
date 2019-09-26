class Route {
    constructor(config) {
        const {ref, name, schema, api = {}, mode} = config;
        this.beforeCreate();
        this.manager = ref;
        this.mode = mode || "client";
        this.required = {
            get: {},
            post: {},
            put: {},
            patch: {},
            delete: {}
        }
        this.name = name;
        this.route = schema;
        this.api = { ...api };
        
        this.beforeCreate = this.beforeCreate;
        this.afterCreate = this.afterCreate;
        this.mode = this.mode;
        this.manager = this.manager;
        this.required = this.required;
        this.name = this.name;
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.put = this.put.bind(this);
        this.delete = this.delete.bind(this);
        this.patch = this.patch.bind(this);
        this.generateURLwithConfig = this.generateURLwithConfig.bind(this);
        this.getClientURL = this.getClientURL.bind(this);
        this.getServerURL = this.getServerURL.bind(this);
        this.setRequiredUrlParams();
        this.setRequiredQueryParams();

        this.afterCreate();
    }
    beforeCreate() { }
    afterCreate() { }
    triggerRequest(type, config = {}) {
        const url = this.generateURLwithConfig("get", {
            query: config.query || {},
            params: config.params || {}
        });
        const conf = Object.create(config);
        delete conf.query;
        delete conf.params;
        return this.api[type](url, {
            ...conf
        });
    }
    get(config = {}) {
        return this.triggerRequest("get", config);
    }
    post(config = {}) {
        return this.triggerRequest("post", config);
    }
    delete(config = {}) {
        return this.triggerRequest("delete", config);
    }
    put(config = {}) {
        return this.triggerRequest("put", config);
    }
    patch(config = {}) {
        return this.triggerRequest("patch", config);
    }
    getManager() {
        return this.manager;
    }
    setRequiredQueryParams() {
        let allTypes = Object.keys(this.required);
        for (let j = 0; j < allTypes.length; j++) {
            let type = allTypes[j]
            if (!this.required[type][this.mode]) {
                this.required[type][this.mode] = {}
            }
            this.required[type][this.mode]["queryParams"] = this.route[type] && this.route[type][this.mode] && this.route[type][this.mode]["requiredParams"] && this.route[type][this.mode]["requiredParams"]["query"] || {};
        }
    }
    setRequiredUrlParams() {
        let allTypes = Object.keys(this.required);
        for (let j = 0; j < allTypes.length; j++) {
            let type = allTypes[j]
            this.getRequiredUrlParams(type);
        }
    }
    getRequiredUrlParams(type) {
        const url = this.getURL(type);
        if (!this.required[type][this.mode]) {
            this.required[type][this.mode] = {}
        }
        if (url) {
            this.required[type][this.mode]["urlParams"] = url.split("/").reduce(function (acc, el) {
                if (el.startsWith(":")) {
                    acc.push(el.slice(1));
                }
                return acc;
            }, []);
        } else {
            this.required[type][this.mode]["urlParams"] = [];
        }
    }
    getRoute() {
        return this.route
    }
    getURL(type) {
        try {
            const urlConfig = this.route[type];
            if (this.route[type]) {
                if (typeof urlConfig[this.mode] === 'object') {
                    return urlConfig[this.mode].url;
                } else {
                    return urlConfig[this.mode];
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
        return this.getURL(type, this.mode);
    }
    getServerURL(type = "get") {
        return this.getURL(type, "server");
    }
    doesParamsHasAllKeys(type, params) {
        let hasAllKeys = { valid: true, missing: [] };
        const requiredKeys = this.required[type][this.mode]["queryParams"];
        for (let i = 0; i < requiredKeys.length; i++) {
            if (!params[requiredKeys[i]]) {
                hasAllKeys.valid = false;
                hasAllKeys.missing.push(requiredKeys[i]);
            }
        }
        return hasAllKeys;
    }
    createQueryString(type, params) {
        const paramsHaveKeys = this.doesParamsHasAllKeys(type, params);
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
    createParamsString(type, params = {}) {
        const url = this.getURL(type);
        if (url) {
            const param_string = url.split("/").map((el) => {
                if (el.startsWith(":")) {
                    if (params[el.slice(1)]) {
                        return params[el.slice(1)]
                    } else {
                        throw `Missing required URL Parameter. "${el.slice(1)}" is missing in provided url params.`
                    }
                }
                return el;
            }).join("/") || "";
            return param_string;
        } else {
            throw `No url is defined for type=${type}`
        }
    }
    generateURLwithConfig(type, config = {}) {
        try {
            const parsedURL = this.createParamsString(type, config.params);
            const queryString = config.query && Object.keys(config.query).length && this.createQueryString(type, config.query) || "";
            return parsedURL + queryString;
        } catch (err) {
            throw err;
        }
    }
}

export default Route;