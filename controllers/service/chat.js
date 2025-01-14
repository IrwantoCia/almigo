const { PassThrough } = require('stream');

const express = require('express')
const router = express.Router()

const generator = require('../../libs/generator')

router.post('/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const stream = new PassThrough();

  stream.pipe(res);

  const sendEvent = (data) => {
    stream.write(`data: ${JSON.stringify({ content: data })}\n\n`);
  };

  const { prompt, format, resourceID } = req.body;
  const requestID = resourceID || generator.randomRequestID();

  const aiResponse = await require('../../vendors/openai/chat')(
    prompt,
    format,
    sendEvent,
    requestID
  );

  const memory = require('../../models/memory')
  await memory.init()

  // Save human prompt and AI response to memory concurrently using Promise.all
  await Promise.all([
    memory.create({
      resource_id: requestID,
      role: 'human',
      content: prompt,
      metadata: '',
      timestamp: new Date().toISOString()
    }),
    memory.create({
      resource_id: requestID,
      role: 'ai',
      content: aiResponse,
      metadata: '',
      timestamp: new Date().toISOString()
    })
  ]);

  // Close the stream after all operations are done
  stream.end();
  res.end();

  // Ensure the stream is properly closed when the request ends
  req.on('close', () => {
    stream.end();
    res.end();
  });

  // Handle any errors that might occur during the streaming
  stream.on('error', (err) => {
    console.error('Stream error:', err);
    res.status(500).end();
  });
});

module.exports = router
