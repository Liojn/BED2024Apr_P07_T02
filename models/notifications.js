const dbConfig = require("../dbConfig");
const sql = require("mssql");

class Notifcations {
    constructor(notification_id, UserID, Fid, justifcation, response, seen){
        this.notification_id = notification_id,
        this.UserID = UserID,
        this.Fid = Fid,
        this.justifcation = justifcation,
        this.response = response,
        this.seen = seen,
        this.date = date
    }

    static async getNotificationsByUserId(UserID) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `Select * from Notifications INNER JOIN Feedback ON Notifications.Fid = Feedback.Fid where UserID = @UserID`;
        const request = connection.request();
        request.input("UserID", UserID);
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset
    }

    static async getNotificationById(notification_id){
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `Select * from Notifications where  notificationId = @notification_id`;
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
            result.recordset[0].Date
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
        request.input("justification", newNotificationData.justifcation);
        request.input("response", newNotificationData.response);
        request.input("seen", newNotificationData.seen);
        request.input("date", newNotificationData.date);
        const result = await request.query(sqlQuery);
        connection.close();

        console.log("Inserted Notification Result:", result); // Add this line
    
        return this.getNotificationById(result.recordset[0].notification_id);
    }
}


module.exports = Notifcations