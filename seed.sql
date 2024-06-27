
CREATE TABLE Users (
  UserID INT PRIMARY KEY IDENTITY(1,1),
  Username NVARCHAR(255) NOT NULL UNIQUE,  
  Email NVARCHAR(255) NOT NULL UNIQUE,
  Password NVARCHAR(255) NOT NULL,
);



CREATE TABLE Events (
  eventId INT PRIMARY KEY IDENTITY(1,1),  -- auto-incrementing integer as primary key
  title VARCHAR(255) NOT NULL,       
  date DATE NOT NULL,                
  startTime DATETIME NOT NULL,             
  endTime DATETIME NOT NULL,               
  location VARCHAR(255),                   -- Location of the event
  description VARCHAR(500),                -- Detailed description of the event 
  username NVARCHAR(255) FOREIGN KEY REFERENCES Users(Username),
   CONSTRAINT chk_EndTimeAfterStartTime CHECK (StartTime <= EndTime)  -- check constraint
);

 CREATE TABLE Feedback (
  Fid INT IDENTITY(1,1) PRIMARY KEY,
  name VARCHAR(50) NOT NULL , 
  email VARCHAR(50) NOT NULL,
  title VARCHAR(20) NOT NULL,
  feedback VARCHAR(300) NOT NULL,
  verified char(1) NOT NULL,
); 


INSERT INTO Users (Username, Email, Password) 
VALUES
  ('user1', 'user1@example.com', 'password123'), 
  ('user2', 'user2@example.com', 'password456'),  
  ('user3', 'user3@example.com', 'password789');

INSERT INTO Events (title, date, startTime, endTime, location, description, username)
VALUES
  ('Cleanshore Sembawang', '2024-08-23', '09:00:00', '12:00:00', 'Sembawang Beach', 'Join us for a day of cleaning up our beaches!', 'user1'),  
  ('Eco Sprouts', '2024-09-14', '18:00:00', '21:00:00', 'Community Center Hall', 'Gear up and come planting with us!', 'user2'),  
  ('Book Club Meeting', '2024-10-12', '10:00:00', '11:30:00', 'Library Meeting Room', 'Discuss the latest book selection!', 'user3'); 

Insert into Feedback (name,email,title,feedback,verified) VALUES
('ze yu','zy@gmail.com','Bad Customer Service','Customer service was very rude to me','N'),
('ah ma','am@gmail.com','Ugly','The website design was so badly design my eyes hurt','Y'),
('blob','b@gmail.com','Confusing','UI confusing not sure where to go','N'),
('clive','clive@gmail.com','Slow','Website slow response rate','Y')
