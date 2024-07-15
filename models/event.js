
const dbConfig = require("../dbConfig");
const sql = require("mssql");
require('dotenv').config();

const MAP_APIKEY =  process.env.MAPAPIKEY;
const axios = require("axios");

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

    // Method for getting all the events in Events Table
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

    // Method for getting the events in Events Table with respect to their eventId
    static async getEventbyId(id){
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Events WHERE eventId = @eventId`

        const request = connection.request();
        request.input("eventId", id); //sets the value of the @id parameter to the id parameter passed to the function.
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
        : null; // If not available, return null object
    }

    // Method for creating and inserting into Events Table
    static async createEvent(eventData) {
        const connection = await sql.connect(dbConfig);
        console.log(eventData.username);
        const sqlQuery = `INSERT INTO Events (title, date, startTime, endTime, location, description, username) VALUES (@title, @date, @startTime, @endTime, @location, @description, @username); SELECT SCOPE_IDENTITY() AS eventId;`;

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
        //console.log(result); test
        
        return this.getEventbyId(result.recordset[0].eventId)
    }

    // Method for updating the attributes of the events in Events Table
    static async updateEvent(eventId, newEventData){
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE Events SET title = @title, date = @date, startTime = @startTime, endTime = @endTime, location = @location, description = @description, username = @username WHERE eventId = @eventId`;

        const request = connection.request();
        request.input("title", newEventData.title);
        request.input("date", newEventData.date);
        request.input("startTime", newEventData.startTime);
        request.input("endTime", newEventData.endTime);
        request.input("location", newEventData.location);
        request.input("description", newEventData.description);
        request.input("eventId", eventId);
        request.input("username", newEventData.username);

        const result = await request.query(sqlQuery);
    
        connection.close();

        console.log(result);
        return this.getEventbyId(eventId); //Returns updated Event Object 
    }

    // Method for deleting a event in Events Table
    static async deleteEvent(id){
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `DELETE FROM Events WHERE eventId = @id`; // Parameterized query
    
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.rowsAffected > 0; // Indicate success based on affected rows
    }

    static async searchEvent(searchTerm){
        const connection = await sql.connect(dbConfig);

        try {
            const sqlQuery = `SELECT * FROM Events WHERE title LIKE '%${searchTerm}%' OR location like '%${searchTerm}%' OR description LIKE '%${searchTerm}%'`;
            const request = connection.request();
            const result = await request.query(sqlQuery);
            
            return result.recordset;
        } catch (error){
            throw new Error("Error searching for event. Event does not exist.");
        } finally {
            await connection.close(); //Enable closing connection after everything
        }
    }

    static async registerEvent(eventId, username){
        const connection = await sql.connect(dbConfig);

        try{
            const sqlQuery = "INSERT INTO EventRegistrations (username, eventId, registrationTime) VALUES (@username, @eventId, GETDATE()); SELECT SCOPE_IDENTITY() AS registrationId, @eventId AS eventId, GETDATE() AS registrationTime;"

            const request = connection.request();
            request.input("username", username);
            request.input("eventId", eventId);
    
            const result = await request.query(sqlQuery);
        
            //Check if result contains registrationId
            if (result.recordset && result.recordset.length > 0) {
                return {
                    registrationId: result.recordset[0].registrationId,
                    eventId: result.recordset[0].eventId,
                    registrationTime: result.recordset[0].registrationTime
                };
            };
        }
        catch (error) { 
            console.error("Database error:", error);
            if (error.originalError && error.originalError.info && error.originalError.info.number === 2627) {
                //Duplicate key error, username and eventId is unique pair
                const duplicateError = new Error("User is already registered for this event.");
                duplicateError.code = 409; //Conflict
                throw duplicateError;
            } else {
                //Other errors
                const serverError = new Error("An error occurred during registration.");
                serverError.code = 500; // Internal Server Error
                throw serverError;
            };
        } finally {
            connection.close();
        }
    
    }

    static async getUsersByEventId(eventId){
        const connection = await sql.connect(dbConfig);

        try {
            const sqlQuery = `
              SELECT username, registrationTime FROM EventRegistrations WHERE eventId = @eventId`;
              
            const request = connection.request();
            request.input("eventId", eventId);
            const result = await request.query(sqlQuery);
            
            //Extract username and registrationTime from result.recordset
            const users = result.recordset.map(record => ({
                username: record.username,
                registrationTime: record.registrationTime
            }));

            return users;
        } catch (error) {
            console.error("Error querying database:", error.message);
            throw error;
        } finally {
            connection.close();
        }
    }

    static async getLocation(encodedLocation){
        try{
            //Get location using the encoded, find first to validate
            const response = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodedLocation}&inputtype=textquery&fields=formatted_address,name,geometry&key=${MAP_APIKEY}`);
            const data = response.data;

            //a key called status will show OK
            if (data.status === 'OK') {
                const candidates = data.candidates;

                if (candidates.length === 1) {
                    //one place found
                    const place = candidates[0]; //First item array in case
                    //use their naming convention
                    const addressName = place.formatted_address || place.name;

                    const results = {
                        status: 'success',
                        mapUrl: `https://www.google.com/maps/embed/v1/place?key=${MAP_APIKEY}&q=${encodeURIComponent(addressName)}`
                    };
                    return results;
                }else { //try to search for places and display with search parameter
                    const results = {
                        status: 'search',
                        mapUrl: `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodedLocation}`
                    };
                    return results;
                }
            } else { //No place found, error
                const error = {
                    status: 'error',
                    message: 'Location not found.'
                };
                return error;
            }
        }
        catch (error) { //error handling for whatever reasons.
            const errors = {
                status: 'error',
                message: error.message
            };
            return errors;
        } 

    }
}


module.exports = Event; //for uses in app.js