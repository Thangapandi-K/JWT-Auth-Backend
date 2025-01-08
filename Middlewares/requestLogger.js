//middleware to check requests 
const requestLogger = async(request, response, next) => {
    console.log("Method", request.method);    
    console.log("Path", request.path);    
    console.log("Query", request.query);
    console.log("Params", request.params);
    console.log("Headers", request.headers.authorization);
    console.log("Body", request.body);
    console.log("Cookies", request.cookies.token);
    console.log("----------------------------");

    next();
};
//exports
export default requestLogger;