const express = require('express');
const WebSocket = require('ws');
const app = express();
const port = 3000;

let deviceStatus = false; // สถานะของอุปกรณ์ (เริ่มต้นเป็น OFF)
let sensorValue = 0; // ค่าเซ็นเซอร์ (เริ่มต้นที่ 0)

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // ส่งข้อมูลเซ็นเซอร์และสถานะอุปกรณ์ให้กับ client ทุกครั้งที่เชื่อมต่อ
  ws.send(JSON.stringify({ sensorValue: sensorValue, deviceStatus: deviceStatus }));

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message);
    
    if (data.action === 'toggle') {
      deviceStatus = data.status;
      console.log(`Device status updated to: ${deviceStatus ? 'ON' : 'OFF'}`);
    }

    // ส่งข้อมูลสถานะอุปกรณ์กลับไปยัง client
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ sensorValue: sensorValue, deviceStatus: deviceStatus }));
      }
    });
  });
});

// สร้างเซิร์ฟเวอร์ HTTP และ WebSocket
app.use(express.static('public'));

app.server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
