import inventoryDao from "../../database/dao/staff/dao.manageInventory.js";

// Gets the inventory infromation on a movie (movieID) per store. E.g. store Breda for movie 112. 3 copies available 1 rented out
function getInventoryInformationPerStore(storeId, movieId, callback) {
  inventoryDao.getAllStores((errorStores, stores) => {
    if(errorStores){
      errorStores.status = 500;
      return callback(errorStores, null);
    }

    // Normalize storeId against actual store IDs, default to first store
    const parsed = parseInt(storeId, 10);
    const storeIds = Array.isArray(stores) ? stores.map(s => s.store_id) : [];
    const validStoreId = Number.isFinite(parsed) && storeIds.includes(parsed)
      ? parsed
      : (storeIds.length > 0 ? storeIds[0] : 1);

    inventoryDao.getFilmInventoryInformationByMovieIdAndStoreId(movieId, validStoreId, (errorInventory, inventoryStore) => {
      if(errorInventory){
        errorInventory.status = 500;
        return callback(errorInventory, null);
      }
      inventoryDao.getMovieTitleAndYear(movieId, (errorMovieInfo, movieInfo) => {
        if (errorMovieInfo) {
          errorMovieInfo.status = 500;
          return callback(errorMovieInfo, null);
        }
        return callback(null, {inventoryStore, stores, movieInfo});
      });
    });
  });
}

export default getInventoryInformationPerStore;
