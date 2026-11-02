const http = require('http');

http.get('http://localhost:3000/catalog', (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    const matches = data.match(/src="([^"]+)"/g) || [];
    console.log('Total img src matches:', matches.length);
    matches.slice(0, 10).forEach((m) => console.log('  ', m));
  });
});
