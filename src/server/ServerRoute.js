import Route from "./../Manager/Route";

class ServerRoute extends Route {
    constructor(conf) {
        const { ref, name, schema} = conf; 
        const config = {
            ref: ref,
            name: name,
            schema: schema,
            mode: "client"
        }
        super(config);
    }
    afterCreate() {
    }
}

export default ServerRoute;