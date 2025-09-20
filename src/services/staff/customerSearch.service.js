import manageCustomerDao from "../../database/dao/staff/dao.manageCustomers.js"

// Give back the count of the serach result as wel as all customer information. Count of result is needed for pagination. 
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
        // console.log(customers)
        // Ensure active_film_ids is always an array
        if (Array.isArray(customers)) {
            customers.forEach(cust => {
                const v = cust.active_film_ids;
                if (Array.isArray(v)) {
                    cust.active_film_ids = v.map(x => String(x).trim()).filter(Boolean);
                } else if (v === null || v === undefined) {
                    cust.active_film_ids = [];
                } else {
                    const parts = String(v)
                        .split(',')
                        .map(p => p.trim().replace(/^['"]|['"]$/g, ''))
                        .filter(Boolean);
                    cust.active_film_ids = parts;
                }
            });
        }
        // console.log(customers);
        return callback(null, {customers, offset, customerCount});
    });
    });
}