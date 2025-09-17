const updateCustomerProfile = (firstName, lastName, phone, district, street, houseNumber, postalCode, city, country, user_id, storeId, callback) => {
	// 1: Check if the country exists
	customerDao.checkIfCountryExists(country, (err, countryChecked) => {
		if (err) {
			const error = {
				status: 500,
				message: "Internal Server Error (country check)",
				details: err
			};
			return callback(error, null);
		}

		const handleCity = (countryId) => {
			// 2: Check if the city exists for the given countryId
			customerDao.checkIfCityExists(city, countryId, (err, cityChecked) => {
				if (err) {
					const error = {
						status: 500,
						message: "Internal Server Error (city check)",
						details: err
					};
					return callback(error, null);
				}

				// Helper to continue after cityId is known
				const afterCityId = (cityId) => {
					const address = `${street} ${houseNumber}`;
					// Use updateUserAddress instead of insertUserAddress
					customerDao.updateUserAddress(user_id, address, district, cityId, postalCode, phone, (err, updatedAddress) => {
						if (err) {
							const error = {
								status: 500,
								message: "Internal Server Error (update address)",
								details: err
							};
							return callback(error, null);
						}
						// Use updateUserPersonalInformation instead of insertUserPersonalInformation
						customerDao.updateUserPersonalInformation(user_id, storeId, firstName, lastName, (err, updatedInfo) => {
							if (err) {
								const error = {
									status: 500,
									message: "Internal Server Error (update personal info)",
									details: err
								};
								return callback(error, null);
							}
							// All DB operations succeeded, return success
							return callback(null, "success");
						});
					});
				};

				if (Array.isArray(cityChecked) && cityChecked.length === 0) {
					// City does not exist
					customerDao.addNewCity(city, countryId, (err, newCity) => {
						if (err) {
							const error = {
								status: 500,
								message: "Internal Server Error (add city)",
								details: err
							};
							return callback(error, null);
						}
						// City successfully added, use newCity.insertId as cityId
						afterCityId(newCity.insertId);
					});
				} else {
					// City already exists, use its id
					afterCityId(cityChecked[0].city_id);
				}
			});
		};

		// Step 1a: If country does not exist, add it, then handle city
		if (Array.isArray(countryChecked) && countryChecked.length === 0) {
			customerDao.addNewCountry(country, (err, newCountry) => {
				if (err) {
					const error = {
						status: 500,
						message: "Internal Server Error (add country)",
						details: err
					};
					return callback(error, null);
				}
				handleCity(newCountry.insertId);
			});
		} else {
			handleCity(countryChecked[0].country_id);
		}
	});
}

export default updateCustomerProfile;
import customerDao from "../../database/dao/Customer/customer.js";

