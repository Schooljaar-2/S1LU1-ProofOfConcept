import query from "../../db.js";

const manageMoviesDao = {
    getAllActors: function(callback){
        const sql = `
            select * 
            from actor
            order by first_name asc, last_name asc
        `;
        query(sql, [], callback);
    }
};

export default manageMoviesDao;