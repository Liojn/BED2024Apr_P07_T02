  -- Create Users table
CREATE TABLE Users (
  UserID INT PRIMARY KEY IDENTITY(1,1),
  Username NVARCHAR(255) NOT NULL UNIQUE,  
  Email NVARCHAR(255) NOT NULL UNIQUE,
  Password NVARCHAR(255) NOT NULL,
  AccountType VARCHAR(8) NOT NULL
);

-- Create Events table
CREATE TABLE Events (
  eventId INT PRIMARY KEY IDENTITY(1,1),  -- auto-incrementing integer as primary key
  title VARCHAR(255) NOT NULL,       
  date DATE NOT NULL,                
  startTime DATETIME NOT NULL,             
  endTime DATETIME NOT NULL,               
  location VARCHAR(255),                   -- Location of the event
  description VARCHAR(800),                -- Detailed description of the event 
  username NVARCHAR(255) FOREIGN KEY REFERENCES Users(Username),
   CONSTRAINT chk_EndTimeAfterStartTime CHECK (StartTime <= EndTime)  -- check constraint
);


-- Create Feedback table
CREATE TABLE Feedback (
  Fid INT IDENTITY(1,1) PRIMARY KEY,
  Username NVARCHAR(255) NOT NULL, 
  Email NVARCHAR(255) NOT NULL, 
  Title VARCHAR(100) NOT NULL,
  Feedback VARCHAR(300) NOT NULL,
  Verified CHAR(1) NOT NULL CHECK (Verified IN ('Y', 'N')),
  Date DATE NOT NULL,
  FOREIGN KEY (Username) REFERENCES Users(Username)
);


-- Create Notifcaiton table
CREATE TABLE Notifications(
	notification_id INT IDENTITY(1,1) PRIMARY KEY,
	UserID int NOT NULL, -- Staff ID
	Fid int NOT NULL,
	justification VARCHAR(40) NOT NULL,
	response TEXT NOT NULL,
	seen char(1) CHECK (seen IN ('Y', 'N')),
	date DATE NOT NULL,
	FOREIGN KEY(Fid) REFERENCES Feedback(Fid),
	FOREIGN KEY(UserID) REFERENCES Users(UserID),
)

--Create Donation table
CREATE TABLE Donations (
  id INT IDENTITY(1,1) PRIMARY KEY,
  Username NVARCHAR(255) NOT NULL, 
  Email NVARCHAR(255) NOT NULL, 
  amount int NOT NULL,
  company VARCHAR(50) NOT NULL,
  datetime DATETIME NOT NULL,
  FOREIGN KEY (Username) REFERENCES Users(Username)
); 

-- Create Event Registration
CREATE TABLE EventRegistrations (
  registrationId INT PRIMARY KEY IDENTITY(1,1),
  username NVARCHAR(255) NOT NULL,
  eventId INT NOT NULL,
  registrationTime DATETIME NOT NULL,
  CONSTRAINT fk_Registrations_Users FOREIGN KEY (username) REFERENCES Users(Username),
  CONSTRAINT fk_Registrations_Events FOREIGN KEY (eventId) REFERENCES Events(eventId),
  CONSTRAINT UQ_UserEvent UNIQUE (username, eventId) 
);



-- Insert data into Users table
INSERT INTO Users (Username, Email, Password, AccountType) 
VALUES
  ('user1', 'user1@example.com', 'password123', 'Student'),  
  ('user2', 'user2@example.com', 'password456', 'Student'),  
  ('msneoERC', 'msneo@example.com', 'password789', 'Staff'),
  ('user3', 'user3@example.com', 'idkwhatpassowrd', 'Student'),
  ('user5', 'user5@example.com', 'notsurelol', 'Student');

-- Insert data into Events table
INSERT INTO Events (title, date, startTime, endTime, location, description, username)
VALUES
  ('Cleanshore Pasir Ris', '2024-07-23', '09:00:00', '12:00:00', 'Pasir Ris Park 519639', 'Plastic pollution is a major threat to our oceans and marine life. Help us tackle this issue by participating in our coastal cleanup! We will be gathering volunteers to remove plastic waste from a local beach. Every piece of plastic collected makes a difference for the health of our oceans.', 'msneoERC'),  
  ('Eco E-Waste Recycling!', '2024-09-14', '18:00:00', '21:00:00', 'Block 1 Ngee Ann Polytechnic 599489', 'I am planning to start a movement to gather people to donate their e-waste. Any volunteer would like to help out?', 'user2'),  
  ('Tree Planting Extravaganza', '2024-10-12', '10:00:00', '11:30:00', 'West Coast Park 126978', 'Join us for a fun-filled day of giving back to the environment! We will be planting trees on Earth Day. This is a great opportunity to learn about the importance of trees in our ecosystem, get some exercise in the fresh air, and make a positive impact on your community. S point will be given.', 'msneoERC'),
  ('Green Earth Day', '2024-09-15', '10:00:00', '15:00:00', 'City Sprouts @ Henderson 159562', 'Join us in celebrating Green Earth Day by participating in various eco-friendly activities and workshops! We’ll have educational sessions on sustainable living, recycling drives, and tree planting activities. Come learn how you can make a positive impact on our environment and contribute to a greener future.', 'user1'),
  ('Urban Green Initiative', '2024-10-10', '08:00:00', '13:00:00', '372 Jurong East St 32 600372', 'Be part of our Urban Green Initiative to help improve green spaces in the city! This event features a community garden planting, a workshop on urban composting, and a litter cleanup drive. Your participation will help create more sustainable and green urban environments. Let’s work together to enhance our city’s green spaces!', 'msneoERC');

INSERT INTO EventRegistrations (username, eventId, registrationTime)
VALUES 
  ('user2', 1, GETDATE()),
  ('user1', 1, GETDATE()),
  ('user5', 1, GETDATE()),
  ('user5', 3, GETDATE());

-- Insert data into Feedback table
INSERT INTO Feedback (Username, Email, Title, Feedback, Verified, Date) 
VALUES
  ('user1', 'user1@example.com', 'Bad Customer Service', 'Customer service was very rude to me', 'Y', '2024-06-30'),
  ('user2', 'user2@example.com', 'Ugly', 'The website design was so badly design my eyes hurt', 'Y', '2023-05-13'),
  ('user2', 'msneo@example.com', 'Confusing', 'UI confusing not sure where to go', 'N', '2023-01-01'),
  ('user1', 'user1@example.com', 'Slow', 'Website slow response rate', 'Y', '2024-12-12');

-- Insert data into Donation table
Insert into Donations(Username, Email, amount, company, datetime)
VALUES
('user2', 'user2@example.com', '20', 'The River Fund', '2024-04-20 11:15:00'),
('user1', 'user1@example.com','25','Lifeline Energy', '2024-06-15 11:00:00'),
('user1', 'user1@example.com','12','Lifeline Energy', '2024-07-01 10:00:00');

Insert Into Notifications (UserID, Fid, justification, response, seen, date)
Values
	('3', '1', 'Addressing Concerns','We have re-trained our workers','N', '2024-09-30'),
	('3','2','Needing More Information','Which part of the design sucks?','N', '2023-10-13'),
	('3','4','Others','test','N','2025-01-01')


/*The order of deleting database*/
/* Drop Table EventRegistrations
Drop Table Events
Drop Table Notifications
Drop Table Feedback
Drop Table Donations
Drop Table Users */

