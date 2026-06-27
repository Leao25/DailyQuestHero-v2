let id = null;
self.onmessage = (e) => {
  if (e.data === 'start') {
    if (!id) id = setInterval(() => self.postMessage('tick'), 50);
  } else if (e.data === 'stop') {
    clearInterval(id);
    id = null;
  }
};
