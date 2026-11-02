const http = require('http');

http.get('http://localhost:3000/watch/rolex-submariner-date', (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    const matches = data.match(/src="([^"]+)"/g) || [];
    console.log('Total matches:', matches.length);
    matches.filter(m => m.includes('watches')).forEach((m) => console.log('  ', m));
  });
});

