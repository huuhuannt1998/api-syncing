require('dotenv').config();
const path = require('path')
const express = require('express')
const cookieSession = require('cookie-session')
const logger = require('morgan')
const encodeUrl = require('encodeurl')
const SSE = require('express-sse')
const FileContextStore = require('@smartthings/file-context-store')
const SmartApp = require('@smartthings/smartapp')

const port = process.env.PORT || 3000
const appId = process.env.APP_ID
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const serverUrl = process.env.SERVER_URL || `https://${process.env.PROJECT_DOMAIN}.glitch.me`
const apiUrl = process.env.API_URL || 'https://api.smartthings.com'
const redirectUri =  `${serverUrl}/oauth/callback`
const scope = encodeUrl('r:locations:* r:devices:* x:devices:*');

const server = express();

let db;
// Google Oauth
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require("express-session");

// MongoDB

let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');

const fs = require('fs').promises;

/*
 * Server-sent events. Used to update the status of devices on the web page from subscribed events
 */
const sse = new SSE()

/**
 * Stores access tokens and other properties for calling the SmartThings API. This implementation is a simple flat file
 * store that is for demo purposes not appropriate for production systems. Other context stores exist, including
 * DynamoDB and Firebase.
 */
const contextStore = new FileContextStore('data')

/*
 * Thew SmartApp. Provides an API for making REST calls to the SmartThings platform and
 * handles calls from the platform for subscribed events as well as the initial app registration challenge.
 */


// 0dc70a10-bda8-4d39-a1ee-67dc45e91595
const axios = require('axios');

// Your SmartThings API access token

const accessToken1 = '64988233-33ea-4dee-9e8a-d042a10ed6f9';
const accessToken2 = '0dc70a10-bda8-4d39-a1ee-67dc45e91595';

// The Device ID of the switch you want to control
// const deviceIdAccount2 = '744ff0b6-8eb8-4ba2-8be6-6fb83d1363a6'; // Replace with actual device ID

// The desired command (e.g., 'on' or 'off')
// const command = 'on'; // Change to 'off' to turn the switch off

// SmartThings API endpoint for sending commands to a device
// const endpoint = `https://api.smartthings.com/v1/devices/${deviceIdAccount2}/commands`;

//Automation rules

async function createSmartThingsRule() {
    try {
        const accessToken = '64988233-33ea-4dee-9e8a-d042a10ed6f9'; // Ensure you have a valid access token
        const ruleData = await fs.readFile('./automationRule.json', 'utf8');
        const ruleJson = JSON.parse(ruleData);

        const response = await axios.post('https://api.smartthings.com/v1/rules', ruleJson, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        // console.log('Rule created successfully:', response.data);
        return 'Rule created successfully';
    } catch (error) {
        // console.error('Error creating rule:', error.response ? error.response.data : error.message);
        throw new Error('Error creating rule');
    }
}

// Function to change the switch status
const updateDeviceInAccount1 = async (command, deviceId) => {
	try {
	  const response = await axios.post(`https://api.smartthings.com/v1/devices/${deviceId}/commands`, {
		commands: [{
		  component: 'main',
		  capability: 'switch',
		  command: command,
		}]
	  }, {
		headers: {
		  'Authorization': `Bearer ${accessToken1}`,
		  'Content-Type': 'application/json',
		},
	  });
	  console.log('Status changed successfully 1:', response.data);
	} catch (error) {
	  console.error('Error changing switch status:', error.response ? error.response.data : error.message);
	}
  };

// Function to change the switch status
const updateDeviceInAccount2 = async (command, deviceId) => {
  try {
    const response = await axios.post(`https://api.smartthings.com/v1/devices/${deviceId}/commands`, {
      commands: [{
        component: 'main',
        capability: 'switch',
        command: command,
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken2}`,
        'Content-Type': 'application/json',
      },
    });

    // console.log('Status changed successfully 2:', response.data);
  } catch (error) {
    // console.error('Error changing switch status:', error.response ? error.response.data : error.message);
  }
};



// Function to fetch the current status of a device
async function fetchDeviceStatus(deviceId) {
    try {
        const response = await axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/status`, {
            headers: { 'Authorization': `Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9` }
        });
        // Access the value directly within the response structure
        return response.data.components.main.switch.switch.value;
    } catch (error) {
        console.error('Error fetching device status:', error.response ? error.response.data : error.message);
        return 'Error';
    }
}


// Call the function to change the switch status

  
const apiApp = new SmartApp()
	.appId(appId)
	.clientId(clientId)
	.clientSecret(clientSecret)
	.contextStore(contextStore)
	.redirectUri(redirectUri)
	.enableEventLogging(2)
	.subscribedEventHandler('switchHandler', async (ctx, event) => {
		/* Device event handler. Current implementation only supports main component switches */
		if (event.componentId === 'main') {
			try {
				sse.send({
					deviceId: event.deviceId,
					switchState: event.value
				})
			} catch(e) {
				console.log(e.message)
			}
		}
		// console.log(`EVENT ${event.deviceId} ${event.componentId}.${event.capability}.${event.attribute}: ${event.value}`)
		// console.log("REAL DEVICE COMMAND:", event.value)
		// createSmartThingsRule();
		// let VirtualDevice1status = await fetchDeviceStatus();
		// console.log("VIRTUAL DEVICE STATUS: ", VirtualDevice1status);
		// updateDeviceInAccount2(VirtualDevice1status); // Update the device in account 2
		// let VirtualDevice1status = fetchDeviceStatus2("89239dda-c3a9-4fc7-bcbc-ba1b028a29e8");
		// console.log("-----------------VirtualDevice1status --------------------: ", VirtualDevice1status)
	})

/*
 * Webserver setup
 */

server.set('views', path.join(__dirname, 'views'))
server.use(cookieSession({
	name: 'session',
	keys: ['key1', 'key2']
}))
server.set('view engine', 'ejs')
server.use(logger('dev'))
server.use(express.json())
server.use(express.urlencoded({extended: false}))
server.use(express.static(path.join(__dirname, 'public')))

// Needed to avoid flush error with express-sse and newer versions of Node
server.use(function (req, res, next) {
	res.flush = function () { /* Do nothing */ }
	next();
})

/*
 * Handles calls to the SmartApp from SmartThings, i.e. registration challenges and device events
 */
server.post('/', async (req, res) => {
	apiApp.handleHttpCallback(req, res);
})

/*
 * Main web page. Shows link to SmartThings if not authenticated and list of switch devices afterwards
 */
server.get('/',async (req, res) => {
	if (req.session.smartThings) {
		// Cookie found, display page with list of devices
		const data = req.session.smartThings
		res.render('devices', {
			installedAppId: data.installedAppId,
			locationName: data.locationName
		})
	}
	else {
		// No context cookie. Display link to authenticate with SmartThings
		res.render('index', {
			url: `${apiUrl}/oauth/authorize?client_id=${clientId}&scope=${scope}&response_type=code&redirect_uri=${redirectUri}`
		})
	}
})

/**
 * Returns view model data for the devices page
 */
server.get('/viewData', async (req, res) => {
	const data = req.session.smartThings

	// Read the context from DynamoDB so that API calls can be made
	const ctx = await apiApp.withContext(data.installedAppId)
	try {
		// Get the list of switch devices, which doesn't include the state of the switch
		const deviceList = await ctx.api.devices.list({capability: 'switch'})

		// Query for the state of each one
		const ops = deviceList.map(it => {
			return ctx.api.devices.getCapabilityStatus(it.deviceId, 'main', 'switch').then(state => {
				return {
					deviceId: it.deviceId,
					label: it.label,
					switchState: state.switch.value
				}
			})
		})

		// Wait for all those queries to complete
		const devices = await Promise.all(ops)

		// Respond to the request
		res.send({
			errorMessage: devices.length > 0 ? '' : 'No switch devices found in location',
			devices: devices.sort( (a, b) => {
				return a.label === b.label ? 0 : (a.label > b.label) ? 1 : -1
			})
		})
	} catch (error) {
		res.send({
			errorMessage: `${error.message || error}`,
			devices: []
		})
	}
});

/*
 * Logout. Uninstalls app and clears context cookie
 */
server.get('/logout', async function(req, res) {
	try {
		// Read the context from DynamoDB so that API calls can be made
		const ctx = await apiApp.withContext(req.session.smartThings.installedAppId)

		// Delete the installed app instance from SmartThings
		await ctx.api.installedApps.delete()
	}
	catch (error) {
		console.error('Error logging out', error.message)
	}
	// Delete the session data
	req.session = null
	res.redirect('/')

})

/*
 * Handles OAuth redirect
 */
server.get('/oauth/callback', async (req, res, next) => {

	try {
		// Store the SmartApp context including access and refresh tokens. Returns a context object for use in making
		// API calls to SmartThings
		const ctx = await apiApp.handleOAuthCallback(req)

		// Get the location name (for display on the web page)
		const location = await ctx.api.locations.get(ctx.locationId)

		// Set the cookie with the context, including the location ID and name
		req.session.smartThings = {
			locationId: ctx.locationId,
			locationName: location.name,
			installedAppId: ctx.installedAppId
		}

		// Remove any existing subscriptions and unsubscribe to device switch events
		await ctx.api.subscriptions.delete()
		await ctx.api.subscriptions.subscribeToCapability('switch', 'switch', 'switchHandler');

		// Redirect back to the main page
		res.redirect('/')
	} catch (error) {
		next(error)
	}
})

/**
 * Executes a device command from the web page
 */



server.post('/command/:deviceId', async(req, res, next) => {
	try {
		// Read the context from DynamoDB so that API calls can be made
		const ctx = await apiApp.withContext(req.session.smartThings.installedAppId)

		// Execute the device command
		await ctx.api.devices.executeCommands(req.params.deviceId, req.body.commands)
		let VirtualDevice1status = ""
		res.send({});


		if (req.params.deviceId == '657ee100-21d0-434b-9dce-279a76602560') { // Real device account 1
			// let start1 = new Date()
			let realDevicestatus = req.body.commands[0].command;
			// console.log("-----------------REAL Device status --------------------: ", realDevicestatus)
			await updateDeviceInAccount1(realDevicestatus, "89239dda-c3a9-4fc7-bcbc-ba1b028a29e8"); // Update the virtual device in account 1
			// let end1 = new Date()
			// let start2 = new Date()
			VirtualDevice1status = await fetchDeviceStatus("89239dda-c3a9-4fc7-bcbc-ba1b028a29e8")
			// console.log("-----------------VirtualDevice1status --------------------: ", VirtualDevice1status)
			updateDeviceInAccount2(VirtualDevice1status, "1a8e867b-50e5-46ca-9ee2-3016e3426d00"); // Update the device in account 2
			// let end2 = new Date()
			// console.log("Virtual Device: ", end1-start1)
			// console.log("Shadow Device: ", end2-start2)
		}
		else if (req.params.deviceId == "89239dda-c3a9-4fc7-bcbc-ba1b028a29e8") { // Virtual device account 1
			let start1 = new Date()
			VirtualDevice1status = await fetchDeviceStatus("89239dda-c3a9-4fc7-bcbc-ba1b028a29e8");
			// console.log("-----------------VirtualDevice1status 3--------------------: ", VirtualDevice1status)
			
			updateDeviceInAccount1(VirtualDevice1status, "657ee100-21d0-434b-9dce-279a76602560"); // Update the real device in account 1
			let end1 = new Date()
			let start2 = new Date()
			VirtualDevice1status = await fetchDeviceStatus("89239dda-c3a9-4fc7-bcbc-ba1b028a29e8");
			updateDeviceInAccount2(VirtualDevice1status, "1a8e867b-50e5-46ca-9ee2-3016e3426d00"); // Update the shadow device in account 2
			let end2 = new Date()

			console.log("Real Device: ", end1-start1)
			console.log("Shadow Device: ", end2-start2)
		}

	} catch (error) {
		next(error)
	}
});



/**
 * Executes a command for all devices
 */
server.post('/commands', async(req, res) => {
	// console.log(JSON.stringify(req.body.commands, null, 2))
	// Read the context from DynamoDB so that API calls can be made
	const ctx = await apiApp.withContext(req.session.smartThings.installedAppId)

	const devices = await ctx.api.devices.list({capability: 'switch'})
	const ops = []
	for (const device of devices) {
		ops.push(ctx.api.devices.executeCommands(device.deviceId, req.body.commands))
	}
	await Promise.all(ops)

	res.send({})
});


/**
 * GOOGLE OAUTH2
 */

server.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
server.use(passport.initialize());
server.use(passport.session());

function isLoggedIn(req, res, next) {
	req.user ? next() : res.sendStatus(401);
  }

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://8aa1-152-15-112-69.ngrok-free.app/oauth/login"
  },
  function(accessToken, refreshToken, profile, done) {
    // Logic for user profile
    done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
	done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
	done(null, user);
  });

server.get("/oauth/login",
	passport.authenticate('google', { 
	  scope: ['email', 'profile'], 
	  prompt: 'select_account',
	  failureRedirect: '/auth/google/failure'
	} 
	),
	(req, res) => {
	  res.redirect('/');
	}
	);

server.get('/protected', isLoggedIn, (req, res) => {
	console.log("CHECK VALUE: ", req)
	res.send(`Hello ${req.user.displayName}`);
});

server.get('/auth/google/failure', (req, res) => {
	res.send('Failed to authenticate..');
});

/**
 * MONGODB
 */

const DB_USER = process.env.MONGO_DB_USERNAME
const DB_PASS = process.env.MONGO_DB_PWD

server.use(bodyParser.urlencoded({
  extended: true
}));
server.use(bodyParser.json());

// when starting app locally, use "mongodb://admin:password@localhost:27017" URL instead
let mongoUrlDockerCompose = `mongodb://${DB_USER}:${DB_PASS}@mongodb`;

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// the following db and collection will be created on first connect
let databaseName = "my-db";
let collectionName = "my-collection";

// This works
// app.get('/fetch-status', function (req, res) {
//   let config = {
//     method: 'get',
//     maxBodyLength: Infinity,
//     url: 'https://api.smartthings.com/v1/devices/89239dda-c3a9-4fc7-bcbc-ba1b028a29e8/status',
//     headers: { 
//       'Content-Type': 'application/json', 
//       'Authorization': 'Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9'
//     },
//   };

//   axios.request(config)
//   .then((apiResponse) => {
//     const deviceStatus = apiResponse.data.components.main.switch.switch.value;
//     res.send({ status: deviceStatus }); 
//   })
//   .catch((error) => {
//     console.error(error);
//     res.status(500).send({ error: "Failed to fetch device status" });
//   });
// });

// Function to fetch status for a single device
function fetchDeviceStatus(deviceId, headers) {
	return axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/status`, {headers});
}
  
server.get('/fetch-devices', async (req, res) => {
	let config = {
		method: 'get',
		url: 'https://api.smartthings.com/v1/devices',
		headers: { 'Authorization': 'Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9' },
	};

	try {
		const devicesResponse = await axios.request(config);
		const deviceStatusPromises = devicesResponse.data.items.map(device =>
			fetchDeviceStatus(device.deviceId, config.headers).then(statusResponse => ({
				deviceId: device.deviceId,
				name: device.label || device.name,
				status: statusResponse.data.components.main.switch.switch.value 
			}))
		);
		const devicesWithStatus = await Promise.all(deviceStatusPromises);
		res.json(devicesWithStatus);
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: "Failed to fetch devices and statuses" });
	}
});



server.post('/update-devices', async (req, res) => {
MongoClient.connect(mongoUrlDockerCompose, mongoClientOptions, async (err, client) => {
	if (err) {
	console.error(err);
	res.status(500).send("Failed to connect to MongoDB.");
	return;
	}
	
	const db = client.db(databaseName);
	const collection = db.collection(collectionName);
	
	try {
	const response = await axios.get('https://api.smartthings.com/v1/devices', {
		headers: { 'Authorization': 'Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9' } 
	});
	const devices = response.data.items; 
	
	const updatePromises = devices.map(device => {
		return fetchDeviceStatus(device.deviceId, response.config.headers)
		.then(statusResponse => {
			const status = statusResponse.data.components.main.switch.switch.value;
			return collection.updateOne(
			{ deviceId: device.deviceId },
			{ $set: { deviceId: device.deviceId, status: status } },
			{ upsert: true }
			);
		});
	});
	
	await Promise.all(updatePromises);
	res.send('Devices updated');
	} catch (error) {
	console.error(error);
	res.status(500).send("Failed to update devices.");
	} finally {
	client.close();
	}
});
});



const mongoose = require('mongoose');
const Device = require('./models/deviceModel')

mongoose.connect('mongodb+srv://root:0000@shadowconn.xxbvupg.mongodb.net/my-collection?retryWrites=true&w=majority&appName=ShadowConn')
.then(() => {
	server.listen(port, () => {
		console.log('Connect to port 3000')
	});
	console.log('Connected to MongoDB')
}).catch((error) => {
	console.log(error)
}) 

server.get('/devices', async (req, res) => {
	try {
		const devices = await Device.find({});
		res.status(200).json(devices)
	} catch (error) {
		console.log(error.message);
		res.status(500).json({message: error.message})
	}
})

server.get('/devices/:id', async (req, res) => {
	try {
		const {id} = req.params;
		const device = await Device.findById(id);

		res.status(200).json(device)
	} catch (error) {
		console.log(error.message);
		res.status(500).json({message: error.message})
	}
})

// server.post('/device', async (req, res) => {
// 	let deviceId = "";
// 	let deviceName = "";
// 	let deviceStatus = "";
// 	try{

// 		/**
// 		 * device ID
// 		 */

// 		let data = 'commands: [{\n\t\tcomponent: "main",\n\t\tcapability: "switch",\n\t\tcommand: newState, \n\t\targuments: []\n\t  }]';
// 		let config2 = {
// 		method: 'get',
// 		maxBodyLength: Infinity,
// 		url: 'https://api.smartthings.com/v1/devices/',
// 		headers: { 
// 			'Content-Type': 'application/json', 
// 			'Authorization': 'Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9'
// 		},
// 		data : data
// 		};

// 		axios.request(config2)
// 		.then((response) => {
// 			deviceId = response.data.items[2].deviceId;
// 			deviceName = response.data.items[2].name;
// 			// console.log("device ID: ", deviceId);
// 			// console.log("device name: ", deviceName);
// 		})
// 		.catch((error) => {
// 		console.log(error);
// 		});


// 		/**
// 		 * device status
// 		 */
// 		let config = {
// 			method: 'get',
// 			maxBodyLength: Infinity,
// 			url: 'https://api.smartthings.com/v1/devices/89239dda-c3a9-4fc7-bcbc-ba1b028a29e8/status',
// 			headers: { 
// 				'Content-Type': 'application/json', 
// 				'Authorization': 'Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9'
// 			},
// 			};
		
// 			axios.request(config)
// 			.then((apiResponse) => {
// 				deviceStatus = apiResponse.data.components.main.switch.switch.value;
// 				// console.log("deviceStatus: ", deviceStatus)
// 			})
// 			.catch((error) => {
// 				console.error(error);
// 				res.status(500).send({ error: "Failed to fetch device status" });
// 		});
// 		const { deviceId, deviceName, deviceStatus } = req.body;
// 		const device = await Device.create({deviceId, deviceName, deviceStatus});

// 		console.log("device ID: ", deviceId);
// 		console.log("device name: ", deviceName);
// 		console.log("deviceStatus: ", deviceStatus)
// 		res.status(200).json(device)
// 	} catch (error) {
// 		console.log(error.message);
// 		res.status(500).json({message: error.message})
// 	}
// })

async function fetchAllDevicesFromSmartThings() {
	try {
	  const response = await axios.get('https://api.smartthings.com/v1/devices', {
		headers: {
		  'Authorization': `Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9`
		}
	  });
	  return response.data.items;
	} catch (error) {
	  console.error('Error fetching devices from SmartThings:', error);
	  throw new Error('Failed to fetch devices from SmartThings');
	}
  }
  
  async function fetchDeviceStatusFromSmartThings(deviceId) {
	try {
	  const response = await axios.get(`https://api.smartthings.com/v1/devices/${deviceId}/status`, {
		headers: {
		  'Authorization': `Bearer 64988233-33ea-4dee-9e8a-d042a10ed6f9`
		}
	  });
	  const deviceStatus = response.data.components.main.switch.switch.value;
	  return deviceStatus;
	} catch (error) {
	  console.error('Error fetching device status from SmartThings:', error);
	  return 'unknown';
	}
  }
  
  server.post('/device', async (req, res) => {
	try {
	  const devices = await fetchAllDevicesFromSmartThings();
	  const addedDevices = [];
  
	  for (const device of devices) {
		const deviceId = device.deviceId; 
		const deviceName = device.name; 
		
		// Fetch device status
		const deviceStatus = await fetchDeviceStatusFromSmartThings(deviceId);
  
		// Create and save the new device
		const newDevice = await Device.create({ deviceId, deviceName, deviceStatus });
		addedDevices.push(newDevice);
	  }
  
	  res.status(200).json(addedDevices); // Send back the list of added devices
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: "Failed to add devices" });
	}
  });
  
  


/**
 * Handle SSE connection from the web page
 */
server.get('/events', sse.init);

/**
 * Start the HTTP server and log URLs. Use the "open" URL for starting the OAuth process. Use the "callback"
 * URL in the API app definition using the SmartThings Developer Workspace.
 */
// server.listen(port);
// console.log(`\nTarget URL -- Copy this value into the targetUrl field of you app creation request:\n${serverUrl}\n`);
// console.log(`Redirect URI -- Copy this value into redirectUris field of your app creation request:\n${redirectUri}\n`);
// console.log(`Website URL -- Visit this URL in your browser to log into SmartThings and connect your account:\n${serverUrl}`);



