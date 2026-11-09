const http=require('http');
const server=http.createServer((req,res)=>{
 const backend=/^\/(api|files)\//.test(req.url);
 const target=new URL(backend?(process.env.LEARNING_BACKEND_URL || 'http://deeptutor.local'):(process.env.LEARNING_EXPO_URL || 'http://127.0.0.1:8095'));
 const upstream=http.request({hostname:target.hostname,port:target.port||80,path:req.url,method:req.method,headers:{...req.headers,host:target.host}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)});
 upstream.on('error',()=>{res.writeHead(502);res.end('Preview upstream unavailable')});req.pipe(upstream);
});
server.on('upgrade',(req,socket,head)=>{
 const target=new URL(req.url.startsWith('/ws')?(process.env.LEARNING_BACKEND_URL || 'http://deeptutor.local'):(process.env.LEARNING_EXPO_URL || 'http://127.0.0.1:8095'));
 const upstream=http.request({hostname:target.hostname,port:target.port||80,path:req.url,headers:{...req.headers,host:target.host,origin:target.origin}});
 upstream.on('upgrade',(res,remote,buffer)=>{socket.write('HTTP/1.1 101 Switching Protocols\r\n'+Object.entries(res.headers).map(([k,v])=>`${k}: ${v}`).join('\r\n')+'\r\n\r\n');if(buffer.length)socket.write(buffer);if(head.length)remote.write(head);remote.pipe(socket);socket.pipe(remote);remote.on('error',()=>socket.destroy());socket.on('error',()=>remote.destroy());});
 upstream.on('response',res=>{socket.end(`HTTP/1.1 ${res.statusCode} Rejected\r\n\r\n`)});upstream.on('error',()=>socket.destroy());upstream.end();
});server.listen(Number(process.env.LEARNING_PREVIEW_PORT || 8096),'127.0.0.1',()=>console.log('Learning preview proxy ready')); 
