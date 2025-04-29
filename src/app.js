require('./routes')
const { restoreSessions } = require('./sessions')
const { routes } = require('./routes')
const app = require('express')()
const bodyParser = require('body-parser')
const { maxAttachmentSize } = require('./config')

// Logging Middleware
app.use((req, res, next) => {
    const logFilePath = `${sessionFolderPath}/requests.log`;
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ?${JSON.stringify(req.query)}`;
    console.log(logEntry)
    
    fs.appendFile(logFilePath, logEntry + '\n', (err) => {
        if (err) {
          console.error('Log failed:', err);
        }
      });

    next();
  });
// Initialize Express app
app.disable('x-powered-by')
app.use(bodyParser.json({ limit: maxAttachmentSize + 1000000 }))
app.use(bodyParser.urlencoded({ limit: maxAttachmentSize + 1000000, extended: true }))
app.use('/', routes)

restoreSessions()

module.exports = app
