
const dbConfig = require("../dbConfig");
const sql = require("mssql");

class Event {
    constructor(eventId, title, date, startTime, endTime, location, description, username){
        this.eventId = eventId;
        this.title = title;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.description = description;
        this.username = username;
    }

    static async getAllEvents(){
        const connection = await sql.connect(dbConfig); //wait for connection with db
        
        const sqlQuery = `SELECT * FROM Events`;

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();
        console.log(result);

        return result.recordset.map(
        (row) => 
            new Event(row.eventId, row.title, row.date, row.startTime, row.endTime, row.location, row.description, row.username)
        ); //convert row to event object
        
    }
}


module.exports = Event; //for uses in app.js