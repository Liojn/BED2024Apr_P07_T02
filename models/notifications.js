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


}


module.exports = Notifcations