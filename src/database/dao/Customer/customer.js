import query from "../../db.js";

const customerDao = {
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
  },
  getCustomerRentalHistory: function(userId, callback){
    const sql = `
      select r.rental_date,
      r.return_date,
      f.title,
      f.film_id,
      s.store_name,
      p.amount 
    from rental r 
    join inventory i on r.inventory_id = i.inventory_id 
    join film f on i.film_id = f.film_id 
    join store s on i.store_id = s.store_id
    join payment p on r.rental_id = p.rental_id 
    join customer c on r.customer_id = c.customer_id 
    join user u on c.user_id = u.user_id 
    where c.user_id = ?
    and r.return_date is not null
    `;
    query(sql, [userId], callback);
  },
  getCustomerActiveRentals: function(userId, callback){
    const sql = `
      select r.rental_date,
        f.rental_duration,
        f.replacement_cost,
        f.title,
        f.film_id,
        s.store_name,
        p.amount 
      from rental r 
      join inventory i on r.inventory_id = i.inventory_id 
      join film f on i.film_id = f.film_id 
      join store s on i.store_id = s.store_id
      join payment p on r.rental_id = p.rental_id 
      join customer c on r.customer_id = c.customer_id 
      join user u on c.user_id = u.user_id 
      where c.user_id = ?
      and r.return_date is null
    `;
    query(sql, [userId], callback);
  }
};

export default customerDao;
