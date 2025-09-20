import manageCustomerDao from "../../database/dao/staff/dao.manageCustomers.js"

export function toggleCustomerActivityService(customerId, callback){
    manageCustomerDao.selectCustomerById(customerId, (errrorCustomerSearch, customerById) => {
        if (errrorCustomerSearch) {
            const error = {
                status: 500,
                message: "Internal Server Error (getting customer by id)",
                details: errrorCustomerSearch
            };
            return callback(error, null);
        }
        var newActivityStatus = 1
        if(customerById[0].active == 0) newActivityStatus = 1;
        if(customerById[0].active == 1) newActivityStatus = 0;

        manageCustomerDao.updateCustomerActivity(newActivityStatus, customerById[0].customer_id, (errorUpdate, customerUpdate) => {
            if (errorUpdate) {
                const error = {
                    status: 500,
                    message: "Internal Server Error (updating customer activity)",
                    details: errorUpdate
                };
                return callback(error, null);
            }
            const result = {customerEmail: customerById[0].email}
            return callback(null, result);
        })
    })
}