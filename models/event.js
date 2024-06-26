
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
        //console.log(result);

        return result.recordset.map(
        (row) => 
            new Event(row.eventId, row.title, row.date, row.startTime, row.endTime, row.location, row.description, row.username)
        ); //convert row to event object
        
    }

    static async createEvent(eventData) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `INSERT INTO Events (title, date, startTime, endTime, location, description, username) VALUES (@title, @date, @startTime, @endTime, @location, @description, @username); SELECT SCOPE_IDENTITY() AS eventID;`;

        const request = connection.request();
        request.input("title", eventData.title);
        request.input("date", eventData.date);
        request.input("startTime", eventData.startTime);
        request.input("endTime", eventData.endTime);
        request.input("location", eventData.location);
        request.input("description", eventData.description);
        request.input("username", eventData.username);

        const result = await request.query(sqlQuery);

        connection.close();
        return result.recordset[0]
            ? new Event(
                result.recordset[0].eventId,
                result.recordset[0].title,
                result.recordset[0].date,
                result.recordset[0].startTime,
                result.recordset[0].endTime,
                result.recordset[0].location,
                result.recordset[0].description,
                result.recordset[0].username
            )
            : null; //If not availables
    }

    static async deleteEvent(id){
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `DELETE FROM Events WHERE eventId = @id`; // Parameterized query
    
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.rowsAffected > 0; // Indicate success based on affected rows
    }
}


module.exports = Event; //for uses in app.js