
const Authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Таны хандах эрх хүрэхгүй байна.",
            });
        }
        next();
    };
};

module.exports = Authorize;