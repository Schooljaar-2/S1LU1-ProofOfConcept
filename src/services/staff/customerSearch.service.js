import manageCustomerDao from "../../database/dao/staff/dao.manageCustomers.js"

// Give back the count of the serach result as wel as all customer information. Count of result is needed for pagination. 
export function findCustomerByFirstLastOrEmail(searchterm, active, hasActive, offset, overdueFirst, callback){
    // Normalize: if active is "" or undefined/null, set to null so DAO ignores filter
    let normalizedActive = null;
    if (active !== "" && active !== undefined && active !== null) {
        const parsed = parseInt(active, 10);
        if (!isNaN(parsed)) normalizedActive = parsed;
    }
    manageCustomerDao.countCustomers(searchterm, normalizedActive, hasActive, (errorCount, customerCount) => {
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

    manageCustomerDao.searchCustomers(searchterm, normalizedActive, hasActive, offset, overdueFirst, (errorSearch, customers) => {
    if (errorSearch) {
            const error = {
                status: 500,
                message: "Internal Server Error (finding customers)",
                details: errorSearch
            };
            return callback(error, null);
        }
        // Ensure active rentals are structured with overdue flags
    if (Array.isArray(customers)) {
            customers.forEach(cust => {
                const idsRaw = cust.active_film_ids;
                const flagsRaw = cust.active_overdue_flags;
                const ids = idsRaw ? String(idsRaw).split(',').map(s => s.trim()).filter(Boolean) : [];
                const flags = flagsRaw ? String(flagsRaw).split(',').map(s => s.trim()).filter(Boolean) : [];
                const rentals = ids.map((filmId, idx) => ({ filmId, overdue: flags[idx] === '1' }));
                cust.active_rentals = rentals;
                delete cust.active_film_ids;
                delete cust.active_overdue_flags;
            });
        }
        // Return the search URL parts for the view to rebuild links
        const query = {
            search: searchterm ?? '',
            active: normalizedActive === null ? '' : String(normalizedActive),
            offset,
            overdue: overdueFirst ? '1' : '',
            hasActive: hasActive ? '1' : ''
        };
        return callback(null, {customers, offset, customerCount, query});
    });
    });
}