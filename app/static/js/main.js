let mediaRecorder, audioChunks=[], timerInterval, seconds=0;

const startBtn=document.getElementById("startBtn");
const stopBtn=document.getElementById("stopBtn");
const recordingStatus=document.getElementById("recordingStatus");
const timerEl=document.getElementById("timer");
const wave=document.getElementById("wave");

const resultBox=document.getElementById("resultBox");
const sentimentBox=document.getElementById("sentimentBox");
const audioPlayer=document.getElementById("audioPlayer");

const dropZone = document.getElementById("dropZone");
const audioFile = document.getElementById("audioFile");

function startTimer(){
  seconds=0;
  timerInterval=setInterval(()=>{
    seconds++;
    const m=String(Math.floor(seconds/60)).padStart(2,'0');
    const s=String(seconds%60).padStart(2,'0');
    timerEl.innerText=`${m}:${s}`;
  },1000);
}

function stopTimer(){clearInterval(timerInterval)}

startBtn.onclick=async()=>{
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  mediaRecorder=new MediaRecorder(stream);

  audioChunks=[];
  mediaRecorder.ondataavailable=e=>audioChunks.push(e.data);

  mediaRecorder.start();

  recordingStatus.style.display="flex";
  wave.style.display="flex";

  startBtn.disabled=true;
  stopBtn.disabled=false;

  startTimer();
}

stopBtn.onclick=()=>{
  mediaRecorder.stop();
  stopTimer();

  recordingStatus.style.display="none";
  wave.style.display="none";

  startBtn.disabled=false;
  stopBtn.disabled=true;

  mediaRecorder.onstop=()=>{
    const blob=new Blob(audioChunks,{type:"audio/webm"});
    audioPlayer.src=URL.createObjectURL(blob);
    audioPlayer.style.display="block";
    sendAudio(blob);
  }
}

dropZone.addEventListener("click", () => {
  audioFile.click();
});

audioFile.addEventListener("change", () => {
  if(audioFile.files.length > 0){
    dropZone.querySelector("p").innerText =
      `🎧 ${audioFile.files[0].name}`;
  }
});

document.getElementById("uploadBtn").onclick=()=>{
  const file=document.getElementById("audioFile").files[0];
  if(!file)return alert("Select file");
  audioPlayer.src=URL.createObjectURL(file);
  audioPlayer.style.display="block";
  sendAudio(file);
}

async function sendAudio(file){
  resultBox.innerText="Processing...";
  sentimentBox.innerHTML="";

  const fd=new FormData();
  fd.append("audio",file);

  const res=await fetch("/transcribe",{method:"POST",body:fd});
  const data=await res.json();

  resultBox.innerText=data.text||"No speech detected";

  const label=data.sentiment?.label||data.sentiment;
  const conf=(data.sentiment?.confidence||0)*100;

  let cls="neutral";
  if(label==="POSITIVE")cls="positive";
  if(label==="NEGATIVE")cls="negative";

  sentimentBox.innerHTML=`
    <div style="margin-top:10px">
      Sentiment: <span class="badge ${cls}">${label}</span>
      <div class="bar"><div class="fill" style="width:${conf}%"></div></div>
      <small>${conf.toFixed(1)}% confidence</small>
    </div>
  `;
}