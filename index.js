require('dotenv').config()
const path = require('path');

const express = require('express')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')

const authControllers = require('./controllers/auth')
const serviceControllers = require('./controllers/service')
const orderControllers = require('./controllers/order')
const middleware = require('./libs/middleware')
const generator = require('./libs/generator')
const type = require('./libs/type');
const db = require('./models/db');

const app = express()
const port = process.env.PORT ?? 3000
db.initializeDatabase()

app.response.sendStatus = function(statusCode, message) {
  return this.status(statusCode)
    .send(message)
}

// Configure cookie session middleware
app.use(cookieSession({
  name: 'session', // Name of the cookie
  keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2], // Secret keys for signing the session ID cookie
  maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (24 hours)
  secure: process.env.NODE_ENV === 'production', // Ensure cookies are only sent over HTTPS in production
  httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
  sameSite: 'lax' // Mitigate CSRF attacks
}));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }))

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));
app.set('view options', { layout: 'main' });

hbs.registerHelper('mod', function(a, b) {
  return a % b === 0;
});

hbs.registerHelper('eq', function(a, b) {
  return a === b;
});

app.use(express.static(path.join(__dirname, 'public')))

app.post('/agent', async (req, res) => {
  try {
    const toolHello = require("./vendors/openai/tools/print_hello_world");
    const toolWeather = require("./vendors/openai/tools/get_weather");
    const getOrder = require("./vendors/openai/tools/get_order");

    const userQuery = "Can you provide the status of my order 2?";
    const systemPrompt = "You are a customer service assistant. If the user asks about an order, extract and return the order ID from their query. The order ID should be passed to the function call for further processing.";

    const response = await require('./vendors/openai/chat')(userQuery, systemPrompt, function(content) { });
    const toolResponse = await require('./vendors/openai/tool')(
      response,
      [toolHello.def, toolWeather.def, getOrder.def]
    );

    const finalResponse = await require('./vendors/openai/chat')(
      `Tool's response: ${toolResponse} \n User's query: ${userQuery}`,
      "you are a professional customer service.Based given tool's response, use it to answer user's question with complete information and professionally",
      function(content) { }
    );

    res.status(200).json({ finalResponse });
  } catch (error) {
    console.error('Error executing tool:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/rag', async (req, res) => {
  try {
    const v = require('./models/pinecone')
    const userQuery = 'what did I do on 01 Jan 2024 afternoon'
    const vectorData = await v.vectorized([userQuery])
    await v.query('example-index', vectorData[0].values, 3)

    const queryResults = await v.query('example-index', vectorData[0].values, 3);
    const context = queryResults.map(result => result.metadata.text).join(' ');

    const query = `Based on the following context: ${context}, provide a detailed response to the user's query: ${userQuery}`;
    const systemPrompt = `You are a helpful assistant. Use the provided context to answer the user's question accurately and concisely. If the context is insufficient, let the user know and ask for more details.`;


    const response = await require('./vendors/openai/chat')(query, systemPrompt, function(content) { })
    res.status(200).json({ response });

  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/vectorize', async (req, res) => {
  const d = require('./libs/document')
  const v = require('./models/pinecone')

  try {
    const texts = await d.parseTextFile('./uploads/mydiary')
    const vectorData = await v.vectorized(texts)
    await v.createIndex('example-index', 3072)
    await v.upsert('example-index', vectorData)
    res.status(200).json({ message: 'File processed and vectorized successfully.' })
  } catch (error) {
    console.error('Error processing file:', error)
    res.status(500).json({ error: 'Failed to process the file.' })
  }
})

app.post('/upload', middleware.uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded.' });
    }

    const filePath = `./uploads/${req.file.filename}`;
    res.status(200).json({ message: 'File uploaded and saved successfully!', filePath });
  } catch (error) {
    console.error('Error in /test route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', middleware.authSessionMiddleware, async (req, res) => {
  const decodedToken = req?.decodedToken;
  const { user } = decodedToken;

  const memory = require('./models/memory')
  await memory.init()
  const resourceIDs = await memory.resource_ids()
  const resourceID = req.query.resourceID || generator.randomRequestID();

  const chatHistory = await memory.chat_history({ resource_id: resourceID })

  const renderData = {
    ...type.renderData,
    title: 'Home Page',
    message: 'Welcome to the Home Page!',
    user,
    messages: [],
    isAuthenticated: true,
    currentUrl: req.originalUrl,
    meta: {
      description: 'Home page for My Application',
      keywords: 'home, welcome, application'
    },
    error: null,
    success: null,
    data: {
      resourceIDs: resourceIDs.data,
      resourceID,
      chatHistory: chatHistory.data
    }
  };

  try {
    res.render('index/index', renderData);
  } catch (error) {
    renderData.error = 'Internal Server Error';
    renderData.title = 'Internal Server Error';
    renderData.message = 'An error occurred while processing your request.';
    res.status(500).render('error/500', renderData);
  }
});

app.use('/service', middleware.authSessionMiddleware, serviceControllers)
app.use('/orders', middleware.authSessionMiddleware, orderControllers)
app.use('/auth', authControllers)

const cleanupOnClose = () => {
  console.log('Cleaning up resources before closing the server...');
  // Add any cleanup logic here, such as closing database connections, clearing caches, etc.
  db.closeDatabaseConnection(); // Example: Close the database connection
};

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// Handle server close events
process.on('SIGINT', () => {
  cleanupOnClose();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  cleanupOnClose();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  cleanupOnClose();
  server.close(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  cleanupOnClose();
  server.close(() => {
    process.exit(1);
  });
});
