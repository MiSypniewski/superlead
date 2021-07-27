const readline = require("readline");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const fs = require("fs");
const moment = require("moment");

const logsDir = "./logs";

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

ReadPort = (_port) => {
  // const date = new Date();
  moment.locale("pl");
  console.log(`szukam portu  ${_port}` );
  const dateNow = moment().format("DD-MM-YYYY HH:mm:SS");
  SerialPort.list().then((ports) => {
    ports.forEach((port) => {
      if (port.path === _port) {
        console.log(`odczytuje z ${port.path} ${port.pnpId}`);
        const deviceName = port.pnpId.split(`\\`);
        const filePath = `${logsDir}/${deviceName[2]}.txt`;
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, `${dateNow}  :: Zaczynam zapis ${deviceName[2]}\n`);
        } else {
          fs.appendFileSync(filePath, `${dateNow} :: Zaczynam zapis ${deviceName[2]}\n`);
        }

        const readPort = new SerialPort(`${_port}`, { baudRate: 9600 });
        const parser = new Readline();
        readPort.pipe(parser);
        parser.on("data", (line) => {
          console.log(line);
          const now = moment().format("DD-MM-YYYY HH:mm:SS");
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
      ports.forEach((port, index) => {
        console.log(`${index}. ${port.path}\t${port.pnpId || ""}`);
        myPorts.push(port.path)
      });
    },
    (err) => {
      console.error("Error listing ports", err);
    }
  );
  rl.question("Jaki port COM otworzyć? ", (userPort) => {
    const uPort = parseInt(userPort);
    ReadPort(myPorts[uPort]);
    // rl.close();
});
};

Start();



rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});