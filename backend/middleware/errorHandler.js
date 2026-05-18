const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[ERROR] ${req.method} ${req.url} ${statusCode}: ${message}`);
    console.log("GLOBAL ERROR HANDLER HIT");
    res.status(statusCode).json({

        success: false,
        message,
        // errors: err.errors || [],
        data: [],
    });
};

module.exports = errorHandler;