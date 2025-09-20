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

        const foundStaffId = staffId[0].staff_id;
        // console.log(foundStaffId);

        inventoryDao.createRental(inventoryId, customerId, foundStaffId, (errorCreateRental, createdRental) => {
            if (errorCreateRental) {
                const error = {
                    status: 500,
                    message: "Internal Server Error (staffId)",
                    details: errorCreateRental
                };
                return callback(error, null);
            }
            return callback(null, createdRental);
        })
    });
}