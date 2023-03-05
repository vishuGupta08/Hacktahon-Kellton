
// response format for successful request
exports.success = (statusCode, successMessage, result) =>{
    return {
        status: true,
        error: false,
        code: statusCode,
        message: successMessage,
        data: result 
    }
}

// response format for error request
exports.error = (statusCode, errorMsg, result) =>{
    return {
        status: false,
        error: true,
        code: statusCode,
        message: errorMsg,
        data: result 
    }
}
