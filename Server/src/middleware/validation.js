let sides = ['body', 'params', 'query'];

exports.validation = (schema) => {
    return (req, res, next) => {
        let errors = [];
        sides.forEach((elem) => {
            if (schema[elem]) {
                let checkValidation = schema[elem].validate(req[elem], {
                    abortEarly: false,
                });
                if (checkValidation && checkValidation.error) {
                    errors.push(checkValidation.error.details);
                }
            }
        });
        if (errors.length) {
            res.status(400).json({
                status: 'fail',
                message: errors[0][0].message,
                errors,
            });
        } else {
            next();
        }
    };
};
