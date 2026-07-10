class APIError extends Error{
    constructor(
        message="something went wrong",
        statuscode,
        data,
        stack="",
        errors=[]
    ){
        super(message);
        this.statuscode=statuscode;
        this.data=null;
        this.message=message;
        this.errors=errors;
        

        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }

    }
}
export {APIError}