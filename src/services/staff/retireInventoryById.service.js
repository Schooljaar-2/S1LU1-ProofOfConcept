import inventoryDao from "../../database/dao/staff/dao.manageInventory.js";

// Toggle the retire bool on inventory id
export function toggleRetireByInventoryId(inventoryId, retire, callback){

    inventoryDao.updateRetireByInventoryId(inventoryId, retire, (err, retireSuccess) => {
      if(err){
        err.status = 500;
        return callback(err, null);
      };
      return callback(null, retireSuccess);
    })
}
