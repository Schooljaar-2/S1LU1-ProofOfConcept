import manageCustomerDao from "../../database/dao/staff/dao.manageCustomers.js";

// Delete user from user table and also user id from customer table if the customer finished his/her profile. 
export function deleteCustomerService(userId, callback) {
  manageCustomerDao.getUserCustomerId(
    userId,
    (errorFindUser, foundCustomer) => {
      if (errorFindUser) {
        const error = {
          status: 500,
          message: "Internal Server Error (deleting customer user)",
          details: errorFindUser,
        };
        return callback(error, null);
      }
      const rawCustomerId = Array.isArray(foundCustomer)
        ? (foundCustomer[0] && (foundCustomer[0].customer_id ?? foundCustomer[0]))
        : (foundCustomer && (foundCustomer.customer_id ?? foundCustomer));
      const customerId =
        rawCustomerId === null || rawCustomerId === undefined || rawCustomerId === ""
          ? NaN
          : parseInt(rawCustomerId, 10);

      if (Number.isNaN(customerId)) {
        manageCustomerDao.deleteUser(
          userId,
          (errorDeleteUser, deletedUser) => {
            if (errorDeleteUser) {
              const error = {
                status: 500,
                message: "Internal Server Error (deleting user)",
                details: errorDeleteUser,
              };
              return callback(error, null);
            }
            return callback(null, deletedUser);
          }
        );
        return;
      }

      manageCustomerDao.setCustomerUserIdToNull(
        customerId,
        (errorDelete, deleteResponse) => {
          if (errorDelete) {
            const error = {
              status: 500,
              message: "Internal Server Error (nullifying customer user)",
              details: errorDelete,
            };
            return callback(error, null);
          }

          manageCustomerDao.deleteUser(
            userId,
            (errorDeleteUser, deletedUser) => {
              if (errorDeleteUser) {
                const error = {
                  status: 500,
                  message: "Internal Server Error (deleting user)",
                  details: errorDeleteUser,
                };
                return callback(error, null);
              }
              return callback(null, deletedUser);
            }
          );
        }
      );
    }
  );
}
