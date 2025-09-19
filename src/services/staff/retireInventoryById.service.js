import inventoryDao from "../../database/dao/staff/dao.manageInventory.js";

export function toggleRetireByInventoryId(inventoryId, retire, callback){

    inventoryDao.updateRetireByInventoryId(inventoryId, retire, (err, retireSuccess) => {
      if(err){
        err.status = 500;
        return callback(err, null);
      };
      return callback(null, retireSuccess);
    })
}
