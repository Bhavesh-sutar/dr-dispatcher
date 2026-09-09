const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
        console.error(err);
    } else {
        console.log(`${statusCode}: ${err.message}`);
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error"
    });
};

module.exports = errorHandler
