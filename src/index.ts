import myServer from './services/server';
import { dbConnection } from './db/mongoDB';
import { initWsServer } from './services/sockets';
import cluster from 'cluster'
import os from 'os';
import { portArgument, clusterArg } from './utils/getArgs';
import { logger } from './middlewares/logger';

dbConnection();
initWsServer(myServer);

const port = portArgument || 8080;
const clusterArgument = clusterArg || false;
const numCPUs = os.cpus().length;

if (cluster.isMaster && clusterArgument) {
  console.log(`NUMERO DE CPUS ===> ${numCPUs}`);
  console.log(`PID MASTER ${process.pid}`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker: any) => {
    console.log(`Worker ${worker.process.pid} died at ${Date()}`);
    cluster.fork();
  });
} else {
  myServer.listen(port, () =>
    console.log(`Servidor express escuchando en el puerto ${port} - PID WORKER ${process.pid}`)
  );
}