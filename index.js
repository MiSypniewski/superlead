const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const fs = require("fs");
const moment = require("moment");

const logsDir = "./logs";

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

ReadPort = (_port) => {
  // const date = new Date();
  moment.locale("pl");
  const dateNow = moment().format("DD-MM-YYYY HH:mm:SS");
  SerialPort.list().then((ports) => {
    ports.forEach((port) => {
      if (port.path === _port) {
        console.log(`odczytuje z ${port.path} ${port.pnpId}`);
        const deviceName = port.pnpId.split(`\\`);
        const filePath = `${logsDir}/${deviceName[2]}.txt`;
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, `${dateNow}  :: Zaczynam zapis :: ${deviceName[2]}\n`);
        } else {
          fs.appendFileSync(filePath, `${dateNow} :: Zaczynam zapis :: ${deviceName[2]}\n`);
        }

        const readPort = new SerialPort(`${_port}`, { baudRate: 9600 });
        const parser = new Readline();
        readPort.pipe(parser);
        parser.on("data", (line) => {
          console.log(`${line}`);
          fs.appendFileSync(filePath, line);
        });
      }
    });
  });
};

ShowPorts = () => {
  SerialPort.list().then(
    (ports) => {
      ports.forEach((port) => {
        console.log(`${port.path}\t${port.pnpId || ""}`);
      });
    },
    (err) => {
      console.error("Error listing ports", err);
    }
  );
};

const command = `${process.argv[2]}`;

if (command.includes("COM")) {
  ReadPort(command);
} else if (command === "show" || command === "SHOW") {
  ShowPorts();
} else {
  console.log(`Nie znalazłem argumentu!`);
  console.log(`------------------------`);
  console.log(`Dostępne argumenty: `);
  console.log(`"SHOW" - pokazuje listę dostępnych portów COM`);
  console.log(`"COM1" - rozpoczyna nadsłuch na COM1 (wpisz dostępny port COM)`);
}
