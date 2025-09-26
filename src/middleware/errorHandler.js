// Basic error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let error = { ...err };
    error.message = err.message;

    // Set default error
    if (!error.statusCode) {
        error.statusCode = 500;
        error.message = 'Internal Server Error';
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message
    });
};

module.exports = errorHandler;