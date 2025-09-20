import inventoryDao from "../../database/dao/staff/dao.manageInventory.js";

export function makeNewRentalService(userId, customerId, inventoryId, callback){
    inventoryDao.getStaffIdByUserId(userId, (errorStaffId, staffId) => {
        if (errorStaffId) {
            const error = {
                status: 500,
                message: "Internal Server Error (staffId)",
                details: errorStaffId
            };
            return callback(error, null);
        }

        if (!Array.isArray(staffId) || !staffId[0] || !staffId[0].staff_id) {
            const error = {
                status: 404,
                message: "Staff not found for current user"
            };
            return callback(error, null);
        }

        const foundStaffId = parseInt(staffId[0].staff_id, 10);

        inventoryDao.createRental(inventoryId, customerId, foundStaffId, (errorCreateRental, createdRental) => {
            if (errorCreateRental) {
                const error = {
                    status: 500,
                    message: "Internal Server Error (create rental)",
                    details: errorCreateRental
                };
                return callback(error, null);
            }

            // createdRental should contain insertId from mysql2
            const rentalId = createdRental && createdRental.insertId ? createdRental.insertId : null;

            if (!rentalId) {
                const error = {
                    status: 500,
                    message: "Could not determine created rental id"
                };
                return callback(error, null);
            }

            // Fetch rental rate from film via inventory
            inventoryDao.getRentalRateByInventoryId(inventoryId, (errorRate, rateRows) => {
                if (errorRate) {
                    const error = {
                        status: 500,
                        message: "Internal Server Error (fetch rental rate)",
                        details: errorRate
                    };
                    return callback(error, null);
                }
                const rentalRate = Array.isArray(rateRows) && rateRows[0] ? Number(rateRows[0].rental_rate) : null;
                if (rentalRate === null || Number.isNaN(rentalRate)) {
                    const error = {
                        status: 500,
                        message: "Rental rate not found for inventory"
                    };
                    return callback(error, null);
                }

                // Create payment for this rental
                inventoryDao.createPayment(customerId, foundStaffId, rentalId, rentalRate, (errorPayment, paymentResult) => {
                    if (errorPayment) {
                        const error = {
                            status: 500,
                            message: "Internal Server Error (create payment)",
                            details: errorPayment
                        };
                        return callback(error, null);
                    }

                    return callback(null, {
                        rental: createdRental,
                        rentalId,
                        payment: paymentResult,
                        amount: rentalRate
                    });
                });
            });
        })
    });
}