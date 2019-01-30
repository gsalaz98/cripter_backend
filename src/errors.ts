/**
 * Used to generate objects containing an error message.
 * They can be passed to the `json` function to convert
 * the given `ErrorType` into a serializable object
 */
export enum ErrorType {
    // 401 Errors
    InvalidUsername,
    InvalidPassword,
    InvalidEmail,
    InvalidApiKey,
    UsernameNotSet,
    PasswordNotSet,
    EmailNotSet,
    ApiKeyNotSet,
    LoginFailed,
    CannotDeleteOwnSession,
    SessionNotFound,
    // 401 Exists Errors
    EmailExists,
    UserExists,
    UserLoggedIn,
    // 403 Errors
    AuthenticationRequired,
    ImproperPermissions,

    // 404s
    MethodDoesNotExist,
};

/**
 * Helper function that generates an object with
 * `success` set to false. Used to generate JSON output
 * for API endpoints
 * @param message API message to output as an error
 */
const errorMessage = (message: string) => {
    return {
        success: false,
        message
    };
}

/**
 * 
 * @param error Type denoting 
 */
export function json(error: ErrorType): object {
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