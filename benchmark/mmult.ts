import {Config} from '../src'
import {benchmark, benchmarkMultiSheets} from './benchmark'

async function start() {
  console.info(' === MMULT - GPU without matrix detection === ')
  await benchmarkMultiSheets('../HandsOnEnginePrivate/mmult', [{address: '$mmult.ADF103', value: 25244.51132}, {address: '$mmult.ALL773', value: 26055.50307}], new Config({
    csvDelimiter: ';',
    functionArgSeparator: ',',
    gpuMode: 'gpu',
    matrixDetection: false
  }))

  console.info('\n === MMULT - GPU with matrix detection === ')
  await benchmarkMultiSheets('../HandsOnEnginePrivate/mmult', [{address: '$mmult.ADF103', value: 25244.51132}, {address: '$mmult.ALL773', value: 26055.50307}], new Config({
    csvDelimiter: ';',
    functionArgSeparator: ',',
    gpuMode: 'gpu',
    matrixDetection: true
  }))

  console.info('\n === MMULT - CPU without matrix detection === ')
  await benchmarkMultiSheets('../HandsOnEnginePrivate/mmult', [{address: '$mmult.ADF103', value: 25244.51132}, {address: '$mmult.ALL773', value: 26055.50307}], new Config({
    csvDelimiter: ';',
    functionArgSeparator: ',',
    gpuMode: 'cpu',
    matrixDetection: false
  }))

  console.info('\n === MMULT - CPU with matrix detection === ')
  await benchmarkMultiSheets('../HandsOnEnginePrivate/mmult', [{address: '$mmult.ADF103', value: 25244.51132}, {address: '$mmult.ALL773', value: 26055.50307}], new Config({
    csvDelimiter: ';',
    functionArgSeparator: ',',
    gpuMode: 'cpu',
    matrixDetection: true
  }))
}

start()
