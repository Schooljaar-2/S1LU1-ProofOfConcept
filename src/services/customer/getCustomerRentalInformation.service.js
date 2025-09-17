import customerDao from "../../database/dao/Customer/customer.js";

const getAllUserRentalInformation = (userId, callback) => {
    customerDao.getCustomerRentalHistory(userId, (err, rentalHistory) => {
        if (err) {
            const error = {
                status: 500,
                message: "Internal Server Error (fetching rental history)",
                details: err
            };
            return callback(error, null);
        }
        customerDao.getCustomerActiveRentals(userId, (err2, activeRentals) => {
            if (err2) {
                const error = {
                    status: 500,
                    message: "Internal Server Error (fetching active rentals)",
                    details: err2
                };
                return callback(error, null);
            }
            // Always call callback on success
            return callback(null, { rentalHistory, activeRentals });
        });
    });
}

export default getAllUserRentalInformation;