const http = require('http');

const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;

const memoryUsage = () => {
  const memoryData = process.memoryUsage();
  return {
    rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size`,
    heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> Allocated heap`,
    heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> Used heap`,
    external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
  };
};

const server = http.createServer((req, res) => {
  if (req.url === '/memory' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(memoryUsage()));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Memory monitor running at http://localhost:3000/memory');
});
