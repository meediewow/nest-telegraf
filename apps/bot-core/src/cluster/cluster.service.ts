import { Injectable } from '@nestjs/common';
import cluster from 'cluster';
import os from 'os';
import { noop } from 'lodash';

const getWorkers = () => {
  return os.cpus().length - 1;
};

const NUM_WORKERS = 4 || getWorkers();

@Injectable()
export class ClusterService {
  public static processCount: number;

  public static getIsMaster = () => {
    return cluster.isPrimary || cluster.isMaster;
  };

  public static createCluster(
    workerEntry: () => Promise<void>,
    masterEntry?: () => Promise<void>,
    processCount = NUM_WORKERS,
  ) {
    ClusterService.processCount = processCount;
    if (!ClusterService.getIsMaster()) {
      workerEntry().then(noop);
      return;
    }

    // eslint-disable-next-line no-console
    console.log('Master process is online');
    masterEntry?.();

    for (let i = 0; i < ClusterService.processCount; i++) {
      cluster.fork();
    }

    cluster.on('online', (worker) => {
      // eslint-disable-next-line no-console
      console.log(`Worker process is online. pid: ${worker.process.pid}`);
    });
  }
}
