/* eslint-disable no-param-reassign */
const {
  readdirSync,
  rmSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmdirSync,
  unlinkSync,
  appendFileSync,
} = require('fs');
const { spawn } = require('node:child_process');
const { uuid } = require('uuidv4');
const debugFactory = require('debug');
const moment = require('moment');

const debug = debugFactory('stableDiffusion');
const debugError = debugFactory('stableDiffusion:error');

const TMP_DIR = process.env.TMP_DIR || `${__dirname}/stableOut`;
const TMP_DIR_SAMPLES = `${TMP_DIR}/samples`;
const DEFAULT_FILE_DIR = `${__dirname}/tmp`;
const FILE_DIR = process.env.FILE_DIR || DEFAULT_FILE_DIR;

let stableDiffusion;

function start() {
  if (!stableDiffusion) {
    stableDiffusion = spawn('cmd.exe', ['/K', 'C:\\Users\\aleja\\miniconda3\\Scripts\\activate.bat', 'C:\\Users\\aleja\\miniconda3'], {
      cwd: process.env.STABLE_DIFFUSION_CWD,
    });
  } else {
    debugError('Stable diffusion is already running');
  }
}
start();

function end() {
  if (stableDiffusion) {
    stableDiffusion.kill();
    stableDiffusion = null;
  } else {
    debugError('Stable diffusion is not running');
  }
}

function cleanDirectory(dir) {
  try {
    rmdirSync(dir, { recursive: true });
  } catch (err) {
    // Do nothing
  }
  mkdirSync(dir);
}

if (!process.env.FILE_DIR) {
  cleanDirectory(DEFAULT_FILE_DIR);
}
cleanDirectory(TMP_DIR);
cleanDirectory(TMP_DIR_SAMPLES);

let status = 'STARTING';
let currentQuery = null;

const models = {
  sd14: {
    name: 'Stable Diffusion 1.4',
    path: 'models/ldm/stable-diffusion-v1-4/model.ckpt',
    description: 'Default model, good for general purposes',
  },
  sd13: {
    name: 'Stable Diffusion 1.3',
    path: 'models/ldm/stable-diffusion-v1-3/model.ckpt',
    description: 'Default model, good for general purposes',
  },
  sd12: {
    name: 'Stable Diffusion 1.2',
    path: 'models/ldm/stable-diffusion-v1-2/model.ckpt',
    description: 'Default model, good for general purposes',
  },
  sd1: {
    name: 'Stable Diffusion 1.1',
    path: 'models/ldm/stable-diffusion-v1/model.ckpt',
    description: 'Default model, good for general purposes',
  },
  trinart2_60000: {
    name: 'Trinart 2 Step 60000',
    path: 'models/ldm/trinart2-step60000/model.ckpt',
    description: 'Good for fantasy, less reality-based',
  },
  trinart2_95000: {
    name: 'Trinart 2 Step 95000',
    path: 'models/ldm/trinart2-step95000/model.ckpt',
    description: 'Good for fantasy, less reality-based',
  },
  trinart2_115000: {
    name: 'Trinart 2 Step 115000',
    path: 'models/ldm/trinart2-step115000/model.ckpt',
    description: 'Good for fantasy, less reality-based',
  },
  wd12: {
    name: 'Waifu Diffusion 1.2',
    path: 'models/ldm/wd-v1-2/model.ckpt',
    description: 'Model trained on people and anime',
  },
  wd13_f16: {
    name: 'Waifu Diffusion 1.3 Float 16',
    path: 'models/ldm/wd-v1-3-float16/model.ckpt',
    description: 'Model trained on people and anime',
  },
  wd13_f32: {
    name: 'Waifu Diffusion 1.3 Float 32',
    path: 'models/ldm/wd-v1-3-float32/model.ckpt',
    description: 'Model trained on people and anime',
  },
};

const defaultModel = models.sd14;

const commands = {
  ACTIVATE: 'conda activate ldm\r\n',
};

const queries = {};
const queue = [];

function processQuery(query) {
  status = 'PROCESSING';
  query.status = 'PROCESSING';
  const {
    ckpt, seed, prompt, quantity,
  } = query;
  currentQuery = query;
  cleanDirectory(TMP_DIR_SAMPLES);
  const input = `python scripts/txt2img.py --prompt "${prompt}" --plms --n_iter ${quantity} --n_samples 1 --ckpt "${ckpt}" --seed ${seed} --outdir "${TMP_DIR}"\r\n`;
  debug(`Processing query ${query.id}\r\nRunning command: ${input}`);
  stableDiffusion.stdin.write(input);
}

function requestQuery(prompt, seed, ckpt, quantity) {
  const id = uuid();
  const query = {
    id,
    status: 'PENDING',
    positionInQueue: queue.length + 1,
    totalQueue: 1,
    ckpt: Object.hasOwnProperty.call(models, ckpt) ? models[ckpt].path : defaultModel.path,
    quantity: quantity || 5,
    seed: seed || parseInt(Math.random() * 1000000, 10),
    prompt: prompt || 'Question mark',
    progress: {
      maxPictures: quantity || 5,
      currentPicture: 0,
      currentPicturePercentage: 0,
      totalPercentage: 0,
    },
    results: [],
  };
  appendFileSync(`${FILE_DIR}/log.txt`, `[${moment().format()}] ${id} | ${query.seed} | ${query.ckpt} -- ${query.prompt}\r\n`);
  queries[id] = query;
  rmSync(`${FILE_DIR}/${id}`, { recursive: true, force: true });
  mkdirSync(`${FILE_DIR}/${id}`);
  writeFileSync(`${FILE_DIR}/${id}/query.json`, JSON.stringify(query));
  if (status === 'IDLE') {
    processQuery(query);
  } else {
    queue.push(query);
    queue.forEach((queryQueue) => {
      queryQueue.totalQueue = queue.length + 1;
    });
  }
  return query;
}

stableDiffusion.stdout.on('data', (data) => {
  const msg = data.toString();
  debug(msg);
  if (msg.match(/(.*)(\(base\))(.*)(>)(.*)/)) {
    stableDiffusion.stdin.write(commands.ACTIVATE);
    return;
  }

  if (msg.match(/(.*)(\(ldm\))(.*)(>)(.*)/)) {
    if (currentQuery && currentQuery.status === 'PROCESSING') {
      const files = readdirSync(TMP_DIR_SAMPLES).filter((file) => file.match(/.*\.png/));
      files.forEach((file) => {
        const currentFileData = readFileSync(`${TMP_DIR_SAMPLES}/${file}`);
        writeFileSync(`${FILE_DIR}/${currentQuery.id}/${file}`, currentFileData);
        unlinkSync(`${TMP_DIR_SAMPLES}/${file}`);
        currentQuery.results.push(`/pics/${currentQuery.id}/${file}`);
      });
      currentQuery.status = 'DONE';
      currentQuery = null;
    }
    if (queue.length > 0) {
      queue.forEach((query) => {
        query.positionInQueue -= 1;
        query.totalQueue = queue.length - 1;
      });
      processQuery(queue.shift());
    } else {
      status = 'IDLE';
    }
  }
});

stableDiffusion.stderr.on('data', (data) => {
  const msg = data.toString();

  let regexResults = /.*?PLMS Sampler.*?([0-9]+)%/.exec(msg);
  if (regexResults) {
    const [, progress] = regexResults;
    currentQuery.progress.currentPicturePercentage = parseInt(progress, 10);
    currentQuery.progress.totalPercentage = currentQuery.progress.currentPicture
        * (100 / currentQuery.progress.maxPictures) + progress / currentQuery.progress.maxPictures;
    return;
  }
  regexResults = /.*?Sampling:.*?([0-9]+)%.*?([0-9]+)\/([0-9]+)/.exec(msg);
  if (regexResults) {
    const [, progress, currentPicture, maxPictures] = regexResults;
    currentQuery.progress.totalPercentage = parseInt(progress, 10);
    currentQuery.progress.currentPicture = parseInt(currentPicture, 10);
    currentQuery.progress.maxPictures = parseInt(maxPictures, 10);
    return;
  }

  if (msg.trim()) debugError(msg);
});

stableDiffusion.on('spawn', () => {
  debug('stableDiffusion process opened');
});

stableDiffusion.on('close', (code) => {
  if (code !== 0) {
    debugError(`stableDiffusion process exited with code ${code}`);
  }
  debug('end');
});

module.exports = {
  requestQuery,
  getModels: () => Object.entries(models).map(([key, value]) => ({ key, ...value })),
  getStatus: () => status,
  getQuery: (id) => queries[id],
  getQueueLength: () => queue.length,
  getCurrentQuery: () => currentQuery,
  start,
  end,
};
