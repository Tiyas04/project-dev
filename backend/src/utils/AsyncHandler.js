const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        if (statusCode >= 500) {
            console.error("Server Error:", err);
        }
        res.status(statusCode).json({
            success: false,
            message: err.message
        });
    }
};

export default asyncHandler