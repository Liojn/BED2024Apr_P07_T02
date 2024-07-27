const dbConfig = require("../dbConfig");
const sql = require("mssql");
const User = require("./user");

class Notifcations {
    constructor(notification_id, UserID, Fid, justifcation, response, seen, date){
        this.notification_id = notification_id,
        this.UserID = UserID, //Staff Id
        this.Fid = Fid,
        this.justifcation = justifcation,
        this.response = response,
        this.seen = seen,
        this.date = date
    }

    static async getAllNotifications() {
        console.log("model ")
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Notifications`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();
        console.log(result)
        return result.recordset.map((row) => {
            return new Notifcations(row.notification_id, row.UserID, row.Fid, row.justifcation, row.response, row.seen, row.date);
        });
    }

    //Get notifications by username and feedback details.
    static async getNotificationsByUsername(Username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `Select * from Notifications INNER JOIN Feedback ON Notifications.Fid = Feedback.Fid where Username = @Username`;
        const request = connection.request();
        request.input("Username", Username);
        const result = await request.query(sqlQuery);
        connection.close();

        console.log(result)
        return result.recordset
    }

    static async getNotificationById(notification_id){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `Select * from Notifications where notification_id = @notification_id`;
        const request = connection.request();
        request.input("notification_id", notification_id);
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset[0]
        ? new Notifcations(
            result.recordset[0].notification_id,
            result.recordset[0].UserID,
            result.recordset[0].Fid,
            result.recordset[0].justifcation,
            result.recordset[0].response,
            result.recordset[0].seen,
            result.recordset[0].date
        )
        : null;
    }


    static async createNotification(newNotificationData){
        const connection = await sql.connect(dbConfig)
        const sqlQuery = `Insert Into Notifications (UserID, Fid, justification, response, seen, date)
                         Values (@UserID, @Fid, @justification, @response, @seen, @date);
                         SELECT SCOPE_IDENTITY() AS notification_id;`;
        const request = connection.request();
        request.input("UserID", newNotificationData.UserID);
        request.input("Fid", newNotificationData.Fid);
        request.input("justification", newNotificationData.justification);
        request.input("response", newNotificationData.response);
        request.input("seen", newNotificationData.seen);
        request.input("date", newNotificationData.date);
        const result = await request.query(sqlQuery);
        connection.close();

        console.log("Inserted Notification Result:", result);
    
        return this.getNotificationById(result.recordset[0].notification_id);
    }
    static async deleteNotification(notification_id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `DELETE FROM Notifications WHERE notification_id = @notification_id`;
        const request = connection.request();
        request.input("notification_id", notification_id);
        const result = await request.query(sqlQuery);
        connection.close();

        return result.rowsAffected > 0;
    }

    //Get staff username from User table using UserId (StaffId) from notification table
    static async getStaffUsername(staffId){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `Select * from Notifications Inner Join Users On Notifications.UserID = Users.UserID where Notifications.UserID = @UserID`
        const request = connection.request()
        request.input("UserID", staffId)
        const result = await request.query(sqlQuery)
        connection.close()

        return result.recordset[0]
    }

    static async updateNotification(notification_id) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `UPDATE Notifications SET seen = 'Y' WHERE notification_id = @notification_id`; // Parameterized query
    
        const request = connection.request();
        request.input("notification_id", notification_id);
    
        await request.query(sqlQuery);
    
        connection.close();
    
        return this.getNotificationById(notification_id); 
    }

    // Filter function of notification, but still need feedback info
    static async getNotificationBySeen(seen,username) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Notifications Inner Join Feedback on Notifications.Fid = Feedback.Fid WHERE Username = @Username  AND seen = @seen`;
        const request = connection.request();
        console.log(seen)
        console.log(username)
        request.input("seen", seen);
        request.input("Username", username)
        const result = await request.query(sqlQuery);
        connection.close();
        
        return result.recordset
    }
    static formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    }
    
    


module.exports = Notifcations