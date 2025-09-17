import query from "../../db.js";

const profileDao = {
  getAllCustomerPersonalInformationByUserId: function (userId, callback) {
    const sql = `
        select c.first_name, 
            c.last_name, 
            c.active,
            c.customer_id,
            a.address, 
            a.postal_code, 
            a.district, 
            a.phone, 
            c1.city, 
            c2.country,
            u.username,
            u.email,
            s.store_name 
        from user u
        join customer c on u.user_id = c.user_id
        join address a on c.address_id = a.address_id 
        join city c1 on a.city_id = c1.city_id 
        join country c2 on c1.country_id = c2.country_id 
        join store s on c.store_id = s.store_id
        where u.user_id = ?
        `;
    query(sql, [userId], callback);
  },
  findAllStores: function(callback){
    const sql = `
      select *
      from store
    `;
    query(sql, [], callback);
  },
  checkIfCountryExists: function(country, callback){
    const sql = `
      select * 
      from country c
      where c.country = ?
    `;
    query(sql, [country], callback);
  },
  addNewCountry: function(country, callback){
    const sql = `
      insert into country (country)
      values (?)
    `;
    query(sql, [country], callback);
  },
  checkIfCityExists: function(city, countryId, callback){
    const sql = `
      select *
      from city c 
      where c.city = ?
      and c.country_id = ?
    `;
    query(sql, [city, countryId], callback);
  },
  addNewCity: function(city, countryId, callback){
    const sql = `
    insert into city (city, country_id)
    values (?, ?)
    `;
    query(sql, [city, countryId], callback);
  },
  insertUserAddress: function(address, district, cityId, postalCode, phone, callback){
    const sql = `
      insert into address (address, district, city_id, postal_code, phone, location)
      values (?, ?, ?, ?, ?, POINT(0,0))
      `;
    query(sql, [address, district, cityId, postalCode, phone], callback);
  },
  insertUserPersonalInformation: function(storeId, firstName, lastName, addressId, userId, callback){
    const sql = `
      insert into customer (store_id, first_name, last_name, address_id, active, user_id)
      values (?, ?, ?, ?, 1, ?)
    `;
    query(sql, [storeId, firstName, lastName, addressId, userId], callback);
  }
};

export default profileDao;
