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
  CONSTRAINT chk_EndTimeAfterStartTime CHECK (startTime <= endTime)  -- check constraint
);

-- Create Feedback table
CREATE TABLE Feedback (
  Fid INT IDENTITY(1,1) PRIMARY KEY,
  Username NVARCHAR(255) NOT NULL, 
  Email NVARCHAR(255) NOT NULL, 
  Title VARCHAR(20) NOT NULL,
  Feedback VARCHAR(300) NOT NULL,
  Verified CHAR(1) NOT NULL,
  Date DATE NOT NULL,
  FOREIGN KEY (Username) REFERENCES Users(Username)
); 

--Create Donation table
CREATE TABLE Donations (
  id INT IDENTITY(1,1) PRIMARY KEY,
  Username NVARCHAR(255) NOT NULL, 
  Email NVARCHAR(255) NOT NULL, 
  amount int NOT NULL,
  company VARCHAR(50) NOT NULL,
  datetime DATE NOT NULL,
  FOREIGN KEY (Username) REFERENCES Users(Username)
); 


-- Insert data into Users table
INSERT INTO Users (Username, Email, Password, AccountType) 
VALUES
  ('user1', 'user1@example.com', 'password123', 'Student'), 
  ('user2', 'user2@example.com', 'password456', 'Student'),  
  ('msneoERC', 'msneo@example.com', 'password789', 'Staff');

-- Insert data into Events table
INSERT INTO Events (title, date, startTime, endTime, location, description, username)
VALUES
  ('Cleanshore Sembawang', '2024-08-23', '09:00:00', '12:00:00', 'Sembawang Beach', 'Plastic pollution is a major threat to our oceans and marine life. Help us tackle this issue by participating in our coastal cleanup! We will be gathering volunteers to remove plastic waste from a local beach. Every piece of plastic collected makes a difference for the health of our oceans.', 'user1'),  
  ('Eco E-Waste Recycling!', '2024-09-14', '18:00:00', '21:00:00', 'NP Convention Centre', 'I am planning to start a movement to gather people to donate their e-waste. Any volunteer would like to help out?', 'user2'),  
  ('Tree Planting Extravaganza', '2024-10-12', '10:00:00', '11:30:00', 'NP Block 68, Outside Aerospace', 'Join us for a fun-filled day of giving back to the environment! We will be planting trees on Earth Day. This is a great opportunity to learn about the importance of trees in our ecosystem, get some exercise in the fresh air, and make a positive impact on your community. S point will be given.', 'msneoERC'); 

-- Insert data into Feedback table
INSERT INTO Feedback (Username, Email, Title, Feedback, Verified, Date) 
VALUES
  ('user1', 'user1@example.com', 'Bad Customer Service', 'Customer service was very rude to me', 'N', '2024-06-30'),
  ('user2', 'user2@example.com', 'Ugly', 'The website design was so badly design my eyes hurt', 'Y', '2023-05-13'),
  ('msneoERC', 'msneo@example.com', 'Confusing', 'UI confusing not sure where to go', 'N', '2023-01-01'),
  ('user1', 'user1@example.com', 'Slow', 'Website slow response rate', 'Y', '2024-12-12');

-- Insert data into Donation table
Insert into Donations(Username, Email, amount, company, datetime)
VALUES
('user1', 'user1@example.com','12','Company A', '2023-01-01 10:00:00'),
('user2', 'user2@example.com', '20', 'Company B', '2023-04-20 11:15:00');

Select * from Feedback
Drop Table Users
Drop Table Events
Drop Table Feedback