function startEventStream(prompt, format, resourceID, cb) {
  const url = '/service/chat';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ prompt, format, resourceID }),
    credentials: 'include'
  };

  fetch(url, options)
    .then(response => {
      if (response.status === 403) {
        window.location.href = '/auth/signin';
        return;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = ''

      function readStream() {
        reader.read().then(({ done, value }) => {
          if (done) {
            if (cb) cb(null, null, true); // Indicate stream completion
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop();

          lines.forEach(line => {
            const data = line.replace('data: ', '');
            const parsedData = JSON.parse(data);
            accumulatedContent += parsedData.content;
            if (parsedData.content === '|DONE|') {
              if (cb) cb(null, null, true); // Indicate stream completion
              return;
            } else {
              if (cb) cb(accumulatedContent, null, false); // Stream content as it arrives
            }
          });

          readStream(); // Continue reading the stream
        }).catch(error => {
          console.error('Error reading stream:', error);
          if (cb) cb(null, error, true); // Call the callback with error if stream reading fails
        });
      }

      readStream();
    })
    .catch(error => {
      console.error('Fetch error:', error);
      if (cb) cb(null, error, true); // Call the callback with error if fetch fails
    });
}
