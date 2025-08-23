const http = require('http');
const fs = require('fs');
const path = require('path');

// Permitir configurar el puerto mediante la variable de entorno PORT
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const baseDir = __dirname;

/*
 * Servidor HTTP sencillo para servir los archivos estáticos y aceptar pedidos.
 * Las solicitudes POST a /order se registran en un archivo orders.log.
 */
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/order') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) req.connection.destroy();
    });
    req.on('end', () => {
      try {
        const order = JSON.parse(body);
        const logEntry = `${new Date().toISOString()}\t${JSON.stringify(order)}\n`;
        fs.appendFile(path.join(baseDir, 'orders.log'), logEntry, err => {
          if (err) {
            console.error('Error al guardar el pedido:', err);
            res.statusCode = 500;
            res.end('Error al procesar el pedido');
          } else {
            res.statusCode = 200;
            res.end('Pedido recibido');
          }
        });
      } catch (err) {
        res.statusCode = 400;
        res.end('JSON inválido');
      }
    });
    return;
  }
  // Servir archivos estáticos
  if (req.method === 'GET') {
    let filePath = req.url === '/' ? 'index.html' : req.url.substring(1);
    filePath = filePath.split('?')[0];
    filePath = filePath.replace(/\.\./g, '');
    const ext = path.extname(filePath).toLowerCase();
    const allowed = ['.html', '.js', '.css', '.png', '.jpg', '.jpeg'];
    if (ext && !allowed.includes(ext)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    const fullPath = path.join(baseDir, filePath);
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
      } else {
        let contentType = 'text/plain';
        if (ext === '.html') contentType = 'text/html';
        else if (ext === '.js') contentType = 'application/javascript';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.statusCode = 200;
        res.end(data);
      }
    });
    return;
  }
  res.statusCode = 405;
  res.end('Method Not Allowed');
});

server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});