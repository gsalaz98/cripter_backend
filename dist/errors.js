"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Used to generate objects containing an error message.
 * They can be passed to the `json` function to convert
 * the given `ErrorType` into a serializable object
 */
var ErrorType;
(function (ErrorType) {
    // 401 Errors
    ErrorType[ErrorType["InvalidUsername"] = 0] = "InvalidUsername";
    ErrorType[ErrorType["InvalidPassword"] = 1] = "InvalidPassword";
    ErrorType[ErrorType["InvalidEmail"] = 2] = "InvalidEmail";
    ErrorType[ErrorType["InvalidApiKey"] = 3] = "InvalidApiKey";
    ErrorType[ErrorType["UsernameNotSet"] = 4] = "UsernameNotSet";
    ErrorType[ErrorType["PasswordNotSet"] = 5] = "PasswordNotSet";
    ErrorType[ErrorType["EmailNotSet"] = 6] = "EmailNotSet";
    ErrorType[ErrorType["ApiKeyNotSet"] = 7] = "ApiKeyNotSet";
    ErrorType[ErrorType["LoginFailed"] = 8] = "LoginFailed";
    ErrorType[ErrorType["CannotDeleteOwnSession"] = 9] = "CannotDeleteOwnSession";
    ErrorType[ErrorType["SessionNotFound"] = 10] = "SessionNotFound";
    // 401 Exists Errors
    ErrorType[ErrorType["EmailExists"] = 11] = "EmailExists";
    ErrorType[ErrorType["UserExists"] = 12] = "UserExists";
    ErrorType[ErrorType["UserLoggedIn"] = 13] = "UserLoggedIn";
    // 403 Errors
    ErrorType[ErrorType["AuthenticationRequired"] = 14] = "AuthenticationRequired";
    ErrorType[ErrorType["ImproperPermissions"] = 15] = "ImproperPermissions";
    // 404s
    ErrorType[ErrorType["MethodDoesNotExist"] = 16] = "MethodDoesNotExist";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
;
/**
 * Helper function that generates an object with
 * `success` set to false. Used to generate JSON output
 * for API endpoints
 * @param message API message to output as an error
 */
const errorMessage = (message) => {
    return {
        success: false,
        message
    };
};
/**
 *
 * @param error Type denoting
 */
function json(error) {
    switch (error) {
        // 401s
        case ErrorType.InvalidUsername:
            return errorMessage('Invalid username');
        case ErrorType.InvalidPassword:
            return errorMessage('Invalid password');
        case ErrorType.InvalidEmail:
            return errorMessage('Invalid Email');
        case ErrorType.InvalidApiKey:
            return errorMessage('Invalid API Key');
        case ErrorType.UsernameNotSet:
            return errorMessage('Username is not set');
        case ErrorType.PasswordNotSet:
            return errorMessage('Password is not set');
        case ErrorType.EmailNotSet:
            return errorMessage('Email is not set');
        case ErrorType.ApiKeyNotSet:
            return errorMessage('API key is not set');
        case ErrorType.LoginFailed:
            return errorMessage('Email or password is incorrect');
        case ErrorType.CannotDeleteOwnSession:
            return errorMessage('You can not delete your currently active session, log out instead');
        case ErrorType.SessionNotFound:
            return errorMessage('Session not found');
        case ErrorType.EmailExists:
            return errorMessage('Email already exists');
        case ErrorType.UserExists:
            return errorMessage('User already exists');
        case ErrorType.UserLoggedIn:
            return errorMessage('User is already logged in');
        // 403s
        case ErrorType.AuthenticationRequired:
            return errorMessage('You must be logged in to query this endpoint');
        case ErrorType.ImproperPermissions:
            return errorMessage('You do not have the proper permissions to access this resource');
        // 404s
        case ErrorType.MethodDoesNotExist:
            return errorMessage('Method does not exist');
    }
}
exports.json = json;
