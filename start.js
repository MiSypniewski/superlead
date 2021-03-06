const readline = require("readline");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const fs = require("fs");
const moment = require("moment");

const logsDir = "./logs";

//baudRate: [ 9600, 115200 ]
const speed = 115200;

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const fileName = (path, pnpID) => {
  if (path.includes("COM")) {
    const deviceName = pnpID.split(`\\`);
    return deviceName[2];
  } else {
    const deviceName = pnpID.split(`_`);
    return deviceName[2];
  }
}

ReadPort = (_port) => {
  // const date = new Date();
  moment.locale("pl");
  const dateNow = moment().format("DD-MM-YYYY HH:mm:ss:SS");
  SerialPort.list().then((ports) => {
    ports.forEach((port) => {
      if (port.path === _port) {
        console.log(`odczytuje z ${port.path} ${port.pnpId}`);
        const deviceName = fileName(port.path, port.pnpId)
        const filePath = `${logsDir}/${deviceName}.txt`;
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, `${dateNow}  :: Zaczynam zapis ${deviceName}\n`);
        } else {
          fs.appendFileSync(filePath, `${dateNow} :: Zaczynam zapis ${deviceName}\n`);
        }

        const readPort = new SerialPort(`${_port}`, { baudRate: speed });
        const parser = new Readline();
        readPort.pipe(parser);
        parser.on("data", (line) => {
          const now = moment().format("DD-MM-YYYY HH:mm:ss:SS");
          console.log(`${now}: ${line}`);
          fs.appendFileSync(filePath, `${now} :: ${line}`);
        });
      }
    });
  });
};

Start = async () => {
  let myPorts = [];

  await SerialPort.list().then(
    (ports) => {
      console.log("\n");
      ports.forEach((port, index) => {
        console.log(`  ${index}. ${port.path}\t${port.pnpId || ""}`);
        myPorts.push(port.path)
      });
    },
    (err) => {
      console.error("Error listing ports", err);
    }
  );
  rl.question("\nJaki port COM otworzy??? ", (userPort) => {
    const uPort = parseInt(userPort);


    if (myPorts.length - 1 >= uPort) {
      ReadPort(myPorts[uPort]);
    } else {
      console.log(`Wybra??e?? z??y numer!`);
      rl.close();
    }
  });
};

rl.on("close", function () {
  console.log("\nBYE BYE !!!");
  process.exit(0);
});

Start();



