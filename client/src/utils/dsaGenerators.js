export const generateRandomArray = (size = 15) => Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 10);

const getBubbleSortFrames = () => {
  const arr = generateRandomArray(15);
  const frames = [];
  let a = [...arr];
  let n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      frames.push({ array: [...a], active: [j, j + 1], sorted: Array.from({length: i}, (_, k) => n - 1 - k) });
      if (a[j] > a[j + 1]) {
        let temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;
        frames.push({ array: [...a], active: [j, j + 1], swapped: true, sorted: Array.from({length: i}, (_, k) => n - 1 - k) });
      }
    }
  }
  frames.push({ array: a, active: [], sorted: Array.from({length: n}, (_, k) => k), done: true });
  return frames;
};

const getSelectionSortFrames = () => {
  const arr = generateRandomArray(15);
  const frames = [];
  let a = [...arr];
  let n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    frames.push({ array: [...a], active: [i], sorted: Array.from({length: i}, (_, k) => k) });
    for (let j = i + 1; j < n; j++) {
      frames.push({ array: [...a], active: [minIdx, j], sorted: Array.from({length: i}, (_, k) => k) });
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      let temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
      frames.push({ array: [...a], active: [i, minIdx], swapped: true, sorted: Array.from({length: i+1}, (_, k) => k) });
    }
  }
  frames.push({ array: a, active: [], sorted: Array.from({length: n}, (_, k) => k), done: true });
  return frames;
};

const getLinearSearchFrames = () => {
  const arr = generateRandomArray(10);
  const target = arr[Math.floor(Math.random() * arr.length)];
  const frames = [];
  for (let i = 0; i < arr.length; i++) {
    frames.push({ array: [...arr], active: [i], sorted: [] });
    if (arr[i] === target) {
      frames.push({ array: [...arr], active: [i], sorted: [i], done: true, found: true });
      return frames;
    }
  }
  frames.push({ array: [...arr], active: [], sorted: [], done: true, found: false });
  return frames;
};

const getBinarySearchFrames = () => {
  let arr = generateRandomArray(15).sort((a, b) => a - b);
  const target = arr[Math.floor(Math.random() * arr.length)];
  const frames = [];
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    frames.push({ array: [...arr], active: [mid], sorted: Array.from({length: arr.length}, (_, k) => (k >= low && k <= high ? k : -1)).filter(x=>x!==-1) });
    if (arr[mid] === target) {
      frames.push({ array: [...arr], active: [mid], sorted: [mid], done: true, found: true });
      return frames;
    }
    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  frames.push({ array: [...arr], active: [], sorted: [], done: true, found: false });
  return frames;
};

export const getFramesForAlgo = (algoName) => {
  switch (algoName) {
    case "Bubble": return getBubbleSortFrames();
    case "Selection": return getSelectionSortFrames();
    case "Linear search": return getLinearSearchFrames();
    case "Binary search": return getBinarySearchFrames();
    default: return null;
  }
};
