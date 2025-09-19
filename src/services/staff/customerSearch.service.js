import manageCustomerDao from "../../database/dao/staff/dao.manageCustomers.js"

export function findCustomerByFirstLastOrEmail(searchterm, active, offset, callback){
    // Normalize: if active is "" or undefined/null, set to null so DAO ignores filter
    let normalizedActive = null;
    if (active !== "" && active !== undefined && active !== null) {
        const parsed = parseInt(active, 10);
        if (!isNaN(parsed)) normalizedActive = parsed;
    }
    manageCustomerDao.countCustomers(searchterm, normalizedActive, (errorCount, customerCount) => {
        if (errorCount) {
            const error = {
                status: 500,
                message: "Internal Server Error (getting customer count)",
                details: errorCount
            };
            return callback(error, null);
        }

        // Managing offset
        offset *= 10;
        if(offset > customerCount) offset = customerCount - 10;
        if(offset < 0) offset = 0;

    manageCustomerDao.searchCustomers(searchterm, normalizedActive, offset, (errorSearch, customers) => {
            if (errorSearch) {
                const error = {
                    status: 500,
                    message: "Internal Server Error (finding customers)",
                    details: errorSearch
                };
                return callback(error, null);
            }
            return callback(null, {customers, offset, customerCount, });
        });
    });
}