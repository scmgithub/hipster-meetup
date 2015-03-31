var net = require('net');
var fs = require("fs");
var port = 3001;
var meetup_file = "meetup.json";
var adminFlag = false;
var rsvpFlag = false;

var server = net.createServer(function(socket) {
	console.log('Client connected.');
	socket.write('Hello Client\nCommands:\n/rsvp\n/bye\n');

	var meetup_read = fs.readFile(meetup_file, function(err, data) {
		if (err) {
			console.log("Error reading meetup file: " + err);
		} else {
			var meetup_json = data.toString().trim();
			if (meetup_json && meetup_json != "null") {
				var meetup_data = JSON.parse(meetup_json);
				//console.log("meetup_data:" + meetup_data);
				var meetup_lines = meetup_data.split("\n");
				var meet_arr = meetup_lines[0].split(",");
				socket.write("Current meetup:\n");
				socket.write("Scheduled for: " + meet_arr[0] + "\n");
				socket.write("Topic: " + meet_arr[1].replace(/"/g, '') + "\n");
				socket.write("Attendance: " + (meetup_lines.length - 1) + "\n\n");
			} else {
				socket.write("There is no meetup scheduled currently.  Please check back soon.\n");
			}

			socket.on('data', function(data) {
				var input = data.toString().trim();
				console.log((adminFlag ? "Admin" : "Client") + " said " + input);

				if (adminFlag) {
					if (input === "/view") {
						console.log("View attendees");
						var attendees_read = fs.readFile(meetup_file, function(err, data) {
							if (err) {
								console.log("Error reading meetup file: " + err);
							} else {
								var meet_json = data.toString();
								var meet_data = JSON.parse(meet_json);
								//console.log(meet_data);
								if(meet_data && meet_data!="null") {
									var attendees = meet_data.split('\n');
									if(attendees.length > 1) { // attendees[0] is the meetup itself
										for (var i = 1; i < attendees.length; i++) { // skip index zero
											var person = attendees[i].split(',');
											socket.write(person[0] + ", " + person[1] + "\t" + person[2] + "\n");
										}
									} else {
										socket.write("There are no RSVPs for this meetup yet.\n");
									}
								} else {
									socket.write("There is no meetup scheduled to view.\n");
								}
							}
						});
					} else if (input.split(" ")[0] === "/set") {

						// For now, only support one meetup at a time.
						// So adding a meetup clears the old one

						var datetopic = input.substr(input.indexOf(' ') + 1);
						var datetopic_json = JSON.stringify(datetopic);
						var addMeetup = fs.writeFile(meetup_file, datetopic_json, function(err) {
							if (err) {
								console.log("Error adding meetup: " + err);
							} else {
								// nothing else?
							}
						})
					} else if (input === "/clear") {
						fs.writeFile(meetup_file, null, function(err) {
							if (err) {
								console.log("Error clearing meetup file: " + err);
							}
						});
					} else {
						socket.write(input + " is not a recognized command.\n");
						socket.write("\tValid admin commands are /view, /clear, /set args\n")
					}
					adminFlag = false;
				} else if (rsvpFlag) {
					//console.log("rsvping.  input:"+input);
					var rsvp = input.split(',');
					if(rsvp.length < 3 || rsvp[2].indexOf('@')<1) {
						socket.write("An RSVP must consist of Lastname,Firstname,email@address.com.\n");
					} else {
						var addRsvp_read = fs.readFile(meetup_file, function(err, data) {
							if (err) {
								console.log("Error reading meetup file: " + err);
							} else {
								var rsvp_json = data.toString().trim();
								if (rsvp_json && rsvp_json != "null") {
									var rsvp_data = JSON.parse(rsvp_json);
									//console.log(rsvp_data);
									//console.log("user:" + input);
									var lines = rsvp_data.split("\n");
									lines[lines.length] = input;
									rsvp_data = lines.join("\n");
									rsvp_json = JSON.stringify(rsvp_data);

									var addRsvp_write = fs.writeFile(meetup_file, rsvp_json, function(err) {
										if (err) {
											console.log("Error adding RSVP: " + err);
										} else {
											// nothing else?
										}
									});
								} else {
									console.log("Error:  trying to rsvp to an empty event.")
								}
							}
						});
					}
					rsvpFlag = false;
				} else {

					if (input === "/bye") {
						socket.write("Goodbye Client\n");
						socket.end();
					} else if (input === "/admin") {
						socket.write('Entering (secret) admin mode\n');
						socket.write('Commands: (one at a time - gotta say /admin again for more)\n');
						socket.write('/view - see attendees\n');
						socket.write('/set date,"topic" - add meetup.  clears any existing.  Use that comma!\n');
						socket.write('/clear - clear current attendees list\n');
						socket.write("Don't make a mistake.\n");

						adminFlag = true;

					} else if (input === "/rsvp") {
						var rsvp_read = fs.readFile(meetup_file, function(err, data) {
							if (err) {
								console.log("Error reading meetup file: " + err);
							} else {
								var rsvp_json = data.toString().trim();
								if (!rsvp_json || rsvp_json === "null") {
									socket.write("There is no meetup scheduled currently.  Please check back soon.\n");
								} else {
									socket.write("Please provide Lastname,Firstname,email@address\n");
									socket.write("No spaces or who knows what will happen.\n");
									rsvpFlag = true;
								}
							}
						});
					} else {
						socket.write(input + " is not a recognized command.\n");
						socket.write("Valid commands are /rsvp, /bye.\n")
					}
				}
			}); // end socket.on "data"
		}
	}); // end var meetup_read

	socket.on('end', function() {
		console.log('Client disconnected.');
	});
});

server.listen(port, function() {
	console.log('Listening on port ' + port);
});