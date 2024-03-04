const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    // It might happen that we throw an error while the status is 200. In this case we need to change the code to 500.
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // MangoDB error: when try to get a user using ObjectId but it doesn't exist
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,    // error.stack shows the file and line number, etc.
    });
};

export { notFound, errorHandler };