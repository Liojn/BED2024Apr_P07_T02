
const dbConfig = require("../dbConfig");
const sql = require("mssql");
require('dotenv').config();

const MAP_APIKEY =  process.env.MAPAPIKEY;
const axios = require("axios"); 
const PDFDocument = require('pdfkit');
const path = require('path');
const { error } = require("console");

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

    static async printPDFSummary(eventId, res) {
        let isPeople;
        let doc;
        try {
            const event = await this.getEventbyId(eventId);
            if (!event) {
                throw new Error("Can't find event.");
            }
            //Database connection
            const connection = await sql.connect(dbConfig);
            const request = connection.request();
            const sqlQuery = `SELECT u.username, u.Email, er.registrationTime FROM EventRegistrations er INNER JOIN Users u ON u.Username = er.username WHERE er.eventId = @eventId;`
            request.input("eventId", eventId);
            const result = await request.query(sqlQuery);
            
            // Check if any registrations found
            if (!result.recordset || result.recordset.length === 0) {
                isPeople = false;
            } else {
                isPeople = true;
            }
    
            const templatePath = path.join(__dirname, '..', 'public', 'assets', 'PDF_Template.jpg');
    
            //Create new PDF doc
            doc = new PDFDocument();
            doc.font('Helvetica');
                
            //Set the response headers to indicate a PDF file download
            res.setHeader('Content-disposition', 'attachment; filename=example.pdf');
            res.setHeader('Content-type', 'application/pdf');
    
            doc.image(templatePath, {
                fit: [595.28, 841.89], //Fit to A4 size
                align: 'center',
                valign: 'center',
            }); //add image as template

            //Date formatting
            const formattedDate = formatDate(event.date);
            const formattedStartTime = formatTime(event.startTime);
            const formattedEndTime = formatTime(event.endTime);
    
            //Self note: 1 inch == 72 points
            //Print Event details first
            doc.fontSize(14).text(`${event.eventId}`,113.76, 137.52); //(1.58, 1.91)
            doc.fontSize(14).text(`${event.title}`, 151.92, 169.92); //(2.11, 2.36)
            doc.fontSize(14).text(`${event.location}`, 112.32, 219.6); //(1.56, 3.05)
            doc.fontSize(14).text(`${formattedDate}, ${formattedStartTime} to ${formattedEndTime}`, 138.96, 255.6 ); //(1.93, 3.55);

            //Registration
            //doc.moveTo(41.76, 382.32) //0.58, 5.31
            let startY = 382.32; // Initial y position for registrations
            if (isPeople) {
                for (let i = 0; i < result.recordset.length; i++){
                    const record = result.recordset[i]
                    console.log(`Writing record ${i} to PDF:`, record); //Test

                    doc.fontSize(14).text(`${record.username}`, 41.76, startY);
                    //doc.x = 203.76 //2.83
                    doc.fontSize(14).text(`${record.Email}`, 203.76, startY);
                    //doc.x = 453.6 //6.3
                    const formattedDate = formatDate(record.registrationTime);
                    doc.fontSize(14).text(`${formattedDate}`, 453.6, startY);
                    //doc.x(41.76);
                    startY += 32; //5.75-5.31
                }
            } else {
                doc.fontSize(18).text("No participants");
            }
            // Finalize the PDF and end the response
            doc.end();

            // Pipe the PDF document to the response
            doc.pipe(res);

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            if (doc) {
                // Handle errors during piping
                doc.on('error', (err) => {
                    console.error('Error piping PDF document:', err);
                });
            } else {
                console.error('PDF document was not created.'); // Log an error if doc is undefined
            }
        }
    }
}
//Formatting functions, for PDF
function formatDate(date) {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}
  
// Helper function to format time as HH:mm
function formatTime(time) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return time.toLocaleTimeString('en-US', options);
}


module.exports = Event; //for uses in app.js