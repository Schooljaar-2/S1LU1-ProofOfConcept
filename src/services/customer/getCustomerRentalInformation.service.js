import customerDao from "../../database/dao/customer/customer.js";

// Get active rentals and rental history per userId
export const getAllUserRentalInformation = (userId, callback) => {
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

// Check today's date and the rental duration and the rental create data and find out if there are rentals overdue or not. If so, mark them. 
export const markOverdueActiveRentals = (rentalInformation) => {
  const today = new Date();
  rentalInformation.activeRentals.forEach(rental => {
    const rentalDate = new Date(rental.rental_date);
    const dueDate = new Date(rentalDate);
    dueDate.setDate(rentalDate.getDate() + rental.rental_duration);
    rental.overdue = today > dueDate;
  });
  return rentalInformation;
}