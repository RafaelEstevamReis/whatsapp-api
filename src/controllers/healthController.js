const fs = require('fs')
const path = require('path');
const qrcode = require('qrcode-terminal')
const { sessionFolderPath } = require('../config')
const { sendErrorResponse } = require('../utils')

/**
 * Responds to ping request with 'pong'
 *
 * @function ping
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Promise that resolves once response is sent
 * @throws {Object} - Throws error if response fails
 */
const ping = async (req, res) => {
  /*
    #swagger.tags = ['Various']
  */
  try {
    res.json({ success: true, message: 'pong' })
  } catch (error) {
    sendErrorResponse(res, 500, error.message)
  }
}

// Method to read the log file
const getMessageLog = async (req, res) => {
  const logFilePath = `${sessionFolderPath}/message_log.txt`

  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading message log:', err);
      return res.status(500).json({ success: false, error: 'Failed to read message log' });
    }

    const last50Lines = data.split('\n').slice(-50).join('\n'); // tail -50

    res.send(last50Lines);
  });
};

const getWebhookLog = async (req, res) => {
  const logFilePath = `${sessionFolderPath}/webhook.log`;

  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading webhook log:', err);
      return res.status(500).json({ success: false, error: 'Failed to read webhook log' });
    }
    
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const last50Lines = lines.slice(-50);
    const logArray = last50Lines.map(line =>
    {
      try {
        return JSON.parse(line); // To Json
      } catch (e) {
        console.error('Error parsing webhook log line:', line, e.message);
        return null; // Error if not valid
      }
    }).filter(entry => entry !== null); // filter out invalid (null)

    res.json({ success: true, log: logArray });
  });
};

/**
 * Example local callback function that generates a QR code and writes a log file
 *
 * @function localCallbackExample
 * @async
 * @param {Object} req - Express request object containing a body object with dataType and data
 * @param {string} req.body.dataType - Type of data (in this case, 'qr')
 * @param {Object} req.body.data - Data to generate a QR code from
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Promise that resolves once response is sent
 * @throws {Object} - Throws error if response fails
 */
const localCallbackExample = async (req, res) => {
  /*
    #swagger.tags = ['Various']
  */
  try {
    const { dataType, data } = req.body
    if (dataType === 'qr') { qrcode.generate(data.qr, { small: true }) }
    fs.writeFile(`${sessionFolderPath}/message_log.txt`, `${JSON.stringify(req.body)}\r\n`, { flag: 'a+' }, _ => _)
    res.json({ success: true })
  } catch (error) {
    console.log(error)
    fs.writeFile(`${sessionFolderPath}/message_log.txt`, `(ERROR) ${JSON.stringify(error)}\r\n`, { flag: 'a+' }, _ => _)
    sendErrorResponse(res, 500, error.message)
  }
}

module.exports = { ping, localCallbackExample, getWebhookLog, getMessageLog };
