
const dbConfig = require("../dbConfig");

const sql = require("mssql"); 

class Feedback {
    constructor(Fid, name, email, title, feedback, verified) {
        this.Fid = Fid;
        this.name = name;
        this.email = email;
        this.title = title;
        this.feedback = feedback;
        this.verified = verified;
      }
}