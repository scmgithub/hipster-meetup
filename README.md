# Hipster Coder Meetup

##Features
1.  Users will be able to log in to server via public IP address to see the date, topic, and headcount of attendees of the upcoming Meetup.
- Users will be able to RSVP for the upcoming meetup by providing their name and email address.  An RSVP without a first name, last name, and email address will be refused.
- Administrator access will be granted to the admin via an admin keyword.
- Admin rights will include the ability to:
	1. see the list of attendees (RSVPs) for the upcoming meetup
	- set the date and topic for a new, upcoming meetup
	- clear the current RSVP list (to reset for new meetup).

##Implementation notes:
1.  The server will be deployed to Digital Ocean to allow for public access via IP address.
- The project will consist of a javascript server application; clients and administrator(s) will log in via telnet.
- The current list of RSVPs will be persisted in the file system of the server to protect against data loss should the server process restart.
- The project will be available via GitHub.

##Location
This application is available at 104.236.90.68:3001.