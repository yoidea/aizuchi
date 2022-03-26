// 検出頻度
const DETECTION_INTERVAL = 5;
// 相槌頻度
const AIZUCHI_INTERVAL = 5000;
// 相槌データ
const aizuchies = [
  { file: new Audio("./se/01.mp3"), word: "はい！" },
  { file: new Audio("./se/02.mp3"), word: "おおー" },
  { file: new Audio("./se/03.mp3"), word: "へー" },
  { file: new Audio("./se/04.mp3"), word: "ん？" },
  { file: new Audio("./se/05.mp3"), word: "あはは" },
  { file: new Audio("./se/06.mp3"), word: "ギャーーー" }
];

// DOMと結合
const state = new Proxy(
  { 
    gain: 0,
    detectionGain: 0,
    prevGain: 0,
    talking: false,
    aizuhing: false,
    message: null
  },
  {
    get: (obj, prop) => {
      if (prop === 'detectionGain') {
        obj.detectionGain = document.querySelector("#select").value;
        document.querySelector("#progress").max = obj[prop];
      }
      return obj[prop];
    },
    set: (obj, prop, value) => {
      if (prop === 'gain') {
        obj.prevGain = obj.gain;
        document.querySelector("#progress").value = value;
      }
      if (prop === 'detectionGain') {
        document.querySelector("#progress").max = value;
      }
      if (prop === 'message') {
        document.querySelector("#message").innerText = value;
      }
      if (prop === 'talking') {
        const text = value ? "会話検出中" : "会話未検出";
        document.querySelector("#talking").innerText = text;
      }
      obj[prop] = value;
      return true;
    }
  }
);

const enterFrame = (mic) => {
  state.gain = Utils.sum(mic.getByteFrequencyData());
  state.talking = state.gain > state.detectionGain;
  if (state.aizuhing) return;
  // 直前に検出して今回検出していなければ相槌を打つ
  if ((state.gain < state.detectionGain)
    && (state.prevGain > state.detectionGain)) {
    // ランダムで効果音を選んで再生
    aizuchi = aizuchies[Math.floor(Math.random()*aizuchies.length)]
    aizuchi.file.play();
    state.message = aizuchi.word;
    state.aizuhing = true;
    setTimeout(() => {
      state.aizuhing = false;
      state.message = null;
    }, AIZUCHI_INTERVAL);
  }
}

window.onload = () => {
  const audioManager = new AudioManager({
    fps: DETECTION_INTERVAL,
    useMicrophone: true,
    onEnterFrame: function() {
      enterFrame(this.analysers.mic);
    }
  }).init();
};