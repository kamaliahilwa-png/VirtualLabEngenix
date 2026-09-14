// ========================================
// VIRTUAL LABORATORY
// ========================================

// ===============================
// GLOBAL VARIABLE
// ===============================

let currentStep = 1;
const totalStep = 10;

let revisionCount = 0;
const maxRevision = 1;

let selectedEnergy = "";
let energy = 0;
let efficiency = 0;

// ===============================
// NAVIGATION
// ===============================

function showStep(step){
    document.querySelectorAll(".lab-step").forEach(item=>{
        item.classList.remove("active");
    });

   document.getElementById("step" + step).classList.add("active");

   document.getElementById("stepNumber").textContent = step;

   const progress = ((step - 1)/(totalStep - 1)) * 100;

   document.getElementById("progressFill").style.width = progress + "%";

   window.scrollTo({
       top: 0,
       behavior: "smooth"
   });
}

function nextStep(){

    if(currentStep===3){

        const step3Answer = document.getElementById("step3Answer");
        const step3Value = step3Answer ? step3Answer.value.trim() : "";

        if(step3Value === ""){

            alert("Silakan tuliskan hasil analisismu terlebih dahulu sebelum melanjutkan.");

            if(step3Answer) step3Answer.focus();

            return;

        }

    }

    if(currentStep===4 && selectedEnergy===""){
        
        alert("Silahkan pilih jenis energi terlebih dahulu. ");

        return;

    }

    if(currentStep < totalStep){
        
        currentStep++;

        showStep(currentStep);
    }
}

function prevStep(){

    if(currentStep > 1){
        currentStep--;
        showStep(currentStep);
    
    }
}

// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded",()=>{
    loadExternalPretestData();
    showStep(currentStep);
    updatePanelValue();
    updateAngleValue();
    updateTurbinValue();
    updateTowerValue();
    updateDiameterValue();
    updateFlowValue();
});

// ===============================
// SELECT ENERGY
// ===============================

function selectEnergy(energyType,card){

    selectedEnergy = energyType;

    document.querySelectorAll(".energy-card").forEach(item=>{

        item.classList.remove("selected");

    });

    card.classList.add("selected");

    document.getElementById("designPLTS").style.display = "none";
    document.getElementById("designPLTMH").style.display = "none";
    document.getElementById("designPLTB").style.display = "none";

    if(energyType === "PLTS"){

        document.getElementById("designPLTS").style.display = "block";
    }

    if(energyType === "PLTMH"){

        document.getElementById("designPLTMH").style.display = "block";
    }

    if(energyType === "PLTB"){

        document.getElementById("designPLTB").style.display = "block";
    }

}

// ===============================
// SLIDER
// ===============================

function updatePanelValue(){
    const value = 
    document.getElementById("panelSlider").value;

    document.getElementById("panelValue").textContent =
    value + " Panel ";

}

function updateAngleValue(){

    const value = 
    document.getElementById("angleSlider").value;

    document.getElementById("angleValue").textContent =
    value + "°";
}

function updateTurbinValue(){
    const value = 
    document.getElementById("turbinSlider").value;

    document.getElementById("turbinValue").textContent =
    value + " Turbin";

}

function updateTowerValue(){
    const value = 
    document.getElementById("towerSlider").value;

    document.getElementById("towerValue").textContent =
    value + " m";
}

function updateDiameterValue(){
    const value = 
    document.getElementById("diameterSlider").value;

    document.getElementById("diameterValue").textContent =
    value + " m";
}

function updateFlowValue(){
    const value = 
    document.getElementById("flowSlider").value;

    document.getElementById("flowValue").textContent =
    value + " m³/s";
}

// ===============================
// RUN SIMULATION
// ===============================

function runSimulation(){

    energy = 0;
    efficiency = 0;

    let budget = 0;
    let land = 0;
    let score = 0;

    // =======================
    // PERHITUNGAN PLTS
    // =======================

    if(selectedEnergy === "PLTS"){
        const panel = 
            Number(document.getElementById("panelSlider").value);

        const angle = 
            Number(document.getElementById("angleSlider").value);

        const type = 
            document.querySelector("#designPLTS select").value;

        let typeFactor = 1;

        if(type === "Polycrystalline"){
            typeFactor = 0.9;
        }

        let angleFactor = 
        1 - Math.abs(angle - 30) / 100;

        energy = 
        panel * typeFactor * angleFactor *5;

        budget = 
        panel * 4000000;

        land = 
        panel * 2;

        efficiency = 
        Math.round(typeFactor * angleFactor  * 100);
    }


    // =======================
    //  PERHITUNGAN PLTMH
    // =======================

    if(selectedEnergy === "PLTMH"){
        const diameter =
            Number(document.getElementById("diameterSlider").value);

        const flow =
            Number(document.getElementById("flowSlider").value);

        energy = 
        diameter * flow * 8; 

        budget = 
        diameter * 25000000;

        land = 
        diameter * 15;

        efficiency = 
        Math.min(95, 70 + flow *3);
    }

    // =======================
    // PERHITUNGAN PLTB
    // =======================

    if(selectedEnergy === "PLTB"){

        const turbine =
            Number(document.getElementById("turbinSlider").value);

        const tower =
            Number(document.getElementById("towerSlider").value);

        energy = 
        turbine * tower * 0.5;

        budget = 
        turbine * 30000000;

        land = 
        turbine * 20;

        efficiency = 
        Math.min(95, 60 + tower / 3);

    }

    // =================================
    // HASIL SIMULASI
    // =================================

    document.getElementById("energyResult").textContent =
    energy.toFixed(1)+ " kWh/hari";

    document.getElementById("efficiencyResult").textContent =
    Math.round(efficiency)+"%";

    if(efficiency>=90){

        document.getElementById("statusResult").textContent =
        "Sangat Baik";

    }

    else if(efficiency>=70){
        document.getElementById("statusResult").textContent =
        "Baik";
    }

    else{

        document.getElementById("statusResult").textContent =
        "Perlu Optimasi";
    }

    // =================================
    // PROJECT CONSTRAINT
    // =================================

    document.getElementById("targetCheck").innerHTML =
    energy>=120 ?
    "✅ Terpenuhi" :
    "❌ Belum Terpenuhi";

    document.getElementById("budgetCheck").innerHTML =
    budget<=150000000 ?
    "✅ Rp "+budget.toLocaleString("id-ID") :
    "❌ Rp "+budget.toLocaleString("id-ID");

    document.getElementById("landCheck").innerHTML =
    land<=250 ?
    "✅ "+land+" m²" :
    "❌ "+land+" m²";

    // =================================
    // FEEDBACK
    // =================================

    document.getElementById("feedback1").textContent =
    energy>=120 ?
        "✔ Target energi tercapai.":
        "⚠ Target energi belum tercapai.";

    document.getElementById("feedback2").textContent =
    efficiency>=85 ?
        "✔ Efisiensi sistem sudah optimal.":
        "⚠ Efisiensi sistem masih perlu ditingkatkan.";

        if (selectedEnergy==="PLTS"){
            document.getElementById("feedback3").textContent =
            "☀ PLTS sesuai karena intensitas matahari tinggi.";

        }

        if(selectedEnergy==="PLTMH"){

            document.getElementById("feedback3").textContent =
            "💧 PLTMH sesuai karena tersedia potensi aliran air.";
        }

        if(selectedEnergy==="PLTB"){

            document.getElementById("feedback3").textContent =
            "🌬 PLTB dapat dimanfaatkan apabila kecepatan angin mencukupi.";
        }

        document.getElementById("recommendation").textContent =
        (energy>=120 && efficiency>=85)
        ?
        "🎉 Desain memenuhi target dan layak direkomendasikan."
        :
        "🔧 Desain masih perlu dioptimalkan.";

        // =================================
        // ENGINEERING SCORE
        // =================================

        score = 30;

        if(energy>=120){
            score+=40;
        }

        if(efficiency>=85){
            score+=30
        }
        else if(efficiency>=75){
            score+=20;
        }
        else{
            score+=10;
        }

        document.getElementById("engineeringScore").textContent = score;

        document.getElementById("scoreBar").style.width = score+"%";

        document.getElementById("scoreLabelBar").textContent = 
        score+"/100";

        document.getElementById("energyBar").style.width =
        Math.min(energy/120*100,100)+"%";

        document.getElementById("energyLabel").textContent =
        energy.toFixed(1)+"/120 kWh";

        document.getElementById("efficiencyLabel").textContent =
        Math.round(efficiency)+"%";

        document.getElementById("efficiencyBar").style.width =
        efficiency + "%";

        if(score>=90){

            document.getElementById("scoreLabel").textContent =
            "🏅 Excellent Design";

            document.getElementById("scoreMessage").textContent =
            "Desain sudah sangat optimal.";

        }

        else if(score>=75){

            document.getElementById("scoreLabel").textContent =
            "🥈 Good Design";

            document.getElementById("scoreMessage").textContent =
            "Desain sudah baik namun masih dapat ditingkatkan.";
        }

        else{
            
            document.getElementById("scoreLabel").textContent =
            "🔧 Needs Improvement";

            document.getElementById("scoreMessage").textContent =
            "Desain masih memerlukan optimasi.";

        }

        if(revisionCount >= maxRevision){

            document.getElementById("optimizeBtn").style.display = "none";
        }

        if(revisionCount >=1){
            document.getElementById("attemptBadge").innerHTML =
            "🟠 Attempt 2 / 2";

            document.getElementById("attemptBadge").style.background =
            "#fef3c7";
            document.getElementById("attemptBadge").style.color =
            "#b45309";

        }else{

            document.getElementById("attemptBadge").innerHTML =
            "🟢 Attempt 1 / 2";

            document.getElementById("attemptBadge").style.background =
            "#dcfce7";
            document.getElementById("attemptBadge").style.color =
            "#15803d";
        }

        currentStep = 7;
        showStep(7);

        }
        // ===============================
        // OPTIMIZATION SUGGESTION
        // ===============================

        function optimizeDesign(){

            if(revisionCount >= maxRevision){
                return;
            }

            const box =
            document.getElementById("optimizationBox");

            const list =
            document.getElementById("optimizationList");

            box.style.display = "block";

            if(revisionCount >= 1){

                document.getElementById("attemptBadge").innerHTML =
                "🟠 Attempt 2 / 2";

                document.getElementById("attemptBadge").style.background =
                "#fef3c7";

                document.getElementById("attemptBadge").style.color =
                "#b45309";
            }else{

                document.getElementById("attemptBadge").innerHTML =
                "🟢 Attempt 1 / 2";

                document.getElementById("attemptBadge").style.background =
                "#dcfce7";

                document.getElementById("attemptBadge").style.color =
                "#15803d";
            }

            list.innerHTML = "";

            if(energy < 120){

                list.innerHTML += `
                <li>
                  ⚡ Tambahkan kapasitas pembangkit agar energi
                   minimal <strong>120 kWh/hari</strong> dapat tercapai.
                </li>`;
            }

            if(efficiency < 85){

                list.innerHTML += `
                <li>
                    📈 Tingkatkan efisiensi sistem hingga minimal
                    <strong>85%</strong>.
                </li>`;

            }

            if(selectedEnergy==="PLTS"){
                
                list.innerHTML += `
                <li>
                    ☀ Tambahkan jumlah panel atau ubah sudut panel
                    mendekati <strong>30°</strong>.
                </li>`;

            }

            if(selectedEnergy==="PLTMH"){

                list.innerHTML += `
                <li>
                    💧 Gunakan diameter turbin yang lebih besar
                    atau manfaatkan debit air lebih tinggi.
                </li>`;

            }

            if(selectedEnergy==="PLTB"){

                list.innerHTML += `
                <li>
                    🌬 Tambahkan jumlah turbin atau gunakan
                    menara yang lebih tinggi.
                </li>`;

            }

            if(energy>=120 && efficiency>=85){

                list.innerHTML = `
                <li>
                    🎉 Selamat! Desain Anda sudah memenuhi
                    seluruh target engineering.
                </li>`;

            }
        }

        // ===============================
        // APPLY OPTIMIZATION (1x saja)
        // ===============================

        let optimizationUsed = false;

        function applyOptimization(){

            if(optimizationUsed){
            alert("Anda hanya dapat melakukan optimasi satu kali.");
            return;
            }

           optimizationUsed = true;
           revisionCount++;

           document.getElementById("attemptBadge").innerHTML =
           "🟠 Attempt 2 / 2";

           document.getElementById("attemptBadge").style.background =
           "#fef3c7";

           document.getElementById("attemptBadge").style.color =
           "#b45309";

           optimizeDesign();

           currentStep = 7;
           showStep(7);

           document.getElementById("optimizeBtn").disabled = true;
           document.getElementById("optimizeBtn").innerHTML =
           "✅ Revision Used";
           }

          function backToDesign(){

          currentStep = 7;
          showStep(7);

}
        
        // ===============================
        // RATING
        // ===============================

        function rate(star){

            const stars =
            document.querySelectorAll(".rating span");

            stars.forEach((item,index)=>{

                if(index < star){

                    item.textContent="★";
                    item.style.color="#facc15";

                }

                else{

                    item.textContent="☆";
                    item.style.color="#d1d5db";

                }
                 

            });

            const text =
            document.getElementById("ratingText");

            switch(star){

                case 1:
                    text.textContent =
                    "⭐ Sangat Kurang";
                    break;

                case 2:
                    text.textContent =
                    "⭐⭐ Kurang";
                    break;

                case 3:
                    text.textContent =
                    "⭐⭐⭐ Cukup";
                    break;

                case 4:
                    text.textContent =
                    "⭐⭐⭐⭐ Baik";
                    break;

                case 5:
                    text.textContent =
                    "⭐⭐⭐⭐⭐ Sangat Baik! Terima kasih atas penilaian Anda.";
                    break;
            }
        }

        // ===============================
        // FINISH (STEP 9 - REFLECTION)
        // ===============================

        function finishLab(){

            const q1 = document.getElementById("reflectionQ1");
            const q2 = document.getElementById("reflectionQ2");

            const q1Value = q1 ? q1.value.trim() : "";
            const q2Value = q2 ? q2.value.trim() : "";

            if(q1Value === ""){

                alert("Silakan jawab pertanyaan pertama terlebih dahulu.");

                if(q1) q1.focus();

                return;

            }

            if(q2Value === ""){

                alert("Silakan jawab pertanyaan kedua terlebih dahulu.");

                if(q2) q2.focus();

                return;

            }

            window.location.href = "index.html";
        }

// ========================================
// PRETES & POSTES (URAIAN / ESAI — BERBASIS 6 TAHAPAN EDP)
// Soal identik untuk Pretes & Postes (pretest-posttest design, gain score)
// ========================================
const ESSAY_QUESTIONS = [
    {
        tahap: "Identifikasi Masalah (Ask/Identify)",
        materi: "PLTS",
        question: "Sebuah sekolah ingin memasang PLTS. Atap sekolah seluas 120 m² menerima sinar matahari cukup kuat hampir sepanjang hari, tetapi bagian atap sebelah timur sering tertutup bayangan pohon pada pagi hari. Identifikasi dan analisislah kendala-kendala yang harus dipertimbangkan sebelum menentukan desain PLTS di sekolah tersebut!"
    },
    {
        tahap: "Identifikasi Masalah (Ask/Identify)",
        materi: "PLTB",
        question: "Data kecepatan angin rata-rata di suatu wilayah adalah 3,2 m/s, sementara turbin angin pada umumnya baru mulai berputar efektif di cut-in speed sekitar 3 m/s dan mencapai daya maksimum sekitar 12 m/s. Identifikasi dan analisislah apakah wilayah tersebut layak untuk pembangunan PLTB!"
    },
    {
        tahap: "Membayangkan Solusi (Imagine)",
        materi: "PLTMH",
        question: "Sebuah sungai memiliki head (beda tinggi) 15 m dan debit air sedang. Bayangkan dan usulkan beberapa alternatif jenis turbin air yang mungkin digunakan untuk kondisi ini, serta jelaskan pertimbangan pemilihan masing-masing alternatif!"
    },
    {
        tahap: "Membayangkan Solusi (Imagine)",
        materi: "Umum",
        question: "Suatu wilayah memiliki potensi: intensitas matahari sedang, kecepatan angin sedang, dan terdapat sungai kecil dengan debit stabil. Usulkan beberapa alternatif solusi energi terbarukan yang mungkin diterapkan di wilayah tersebut, lengkap dengan kelebihan dan kekurangan masing-masing alternatif!"
    },
    {
        tahap: "Merencanakan (Plan)",
        materi: "PLTS",
        question: "Sebuah desa menargetkan energi 24 kWh/hari dari PLTS, dengan irradiance rata-rata G = 800 W/m², efisiensi panel η = 18%, luas 1 panel = 1,6 m², dan sistem beroperasi efektif 5 jam/hari. Gunakan rumus P = A × G × η × N. Rencanakan jumlah panel (N) minimal yang dibutuhkan untuk mencapai target tersebut!"
    },
    {
        tahap: "Merencanakan (Plan)",
        materi: "PLTB",
        question: "Sebuah tim ingin merancang PLTB dengan target daya sekitar 2 MW pada kecepatan angin rata-rata 10 m/s, menggunakan turbin dengan Cp = 0,4 dan ρ = 1,225 kg/m³. Gunakan rumus P = ½ × ρ × A × v³ × Cp. Rencanakan estimasi luas sapuan rotor (A) yang dibutuhkan (dalam m²)!"
    },
    {
        tahap: "Membuat (Create)",
        materi: "PLTMH",
        question: "Sebuah kelompok memiliki komponen: bak penenang, pipa pesat (penstock), turbin Crossflow, generator, dan kabel penyalur. Rancangan mereka menetapkan head 15 m dan debit sedang. Susunlah langkah pembuatan (Create) purwarupa PLTMH menggunakan komponen tersebut agar sesuai dengan rancangan dan dapat berfungsi optimal!"
    },
    {
        tahap: "Menguji (Test)",
        materi: "Umum",
        question: "Tiga purwarupa turbin air diuji coba: Purwarupa P = 1,2 V, Q = 2,4 V, R = 1,7 V. Purwarupa Q menghasilkan tegangan tertinggi, namun saat debit dinaikkan, Q mengalami getaran cukup besar dibanding P dan R. Analisislah hasil pengujian tersebut dan tentukan purwarupa mana yang lebih layak dipilih, sertakan batasan dari kesimpulanmu!"
    },
    {
        tahap: "Memperbaiki (Improve)",
        materi: "PLTB",
        question: "Sebuah purwarupa turbin angin menghasilkan tegangan tinggi, tetapi mengalami getaran besar saat kecepatan angin dinaikkan. Evaluasilah kemungkinan penyebab getaran tersebut dan usulkan perbaikan desain yang tepat!"
    },
    {
        tahap: "Memperbaiki (Improve)",
        materi: "PLTS",
        question: "Hasil simulasi sebuah desain PLTS menunjukkan energi yang dihasilkan 95 kWh/hari (target 120 kWh/hari) dengan efisiensi sistem 78% (target ≥85%). Evaluasilah penyebab desain belum memenuhi target dan rancanglah perbaikan desain yang terjustifikasi berdasarkan variabel dalam rumus P = A × G × η × N!"
    }
];

const TIME_PER_ESSAY = 300; // detik (5 menit per soal, karena berbentuk uraian)

let pretestData = null;
let posttestData = null;
let sessionId = localStorage.getItem("engenix_session_id") || "";

// ========================================
// POSTTEST — ONE QUESTION PER PAGE (URAIAN)
// ========================================
let postIndex = 0;
let postAnswers = new Array(ESSAY_QUESTIONS.length).fill("");
let postTimer = null;
let postTimeLeft = TIME_PER_ESSAY;
function loadExternalPretestData(){
    try{
        const raw = localStorage.getItem("engenix_pretest_result");
        if(raw){
            pretestData = JSON.parse(raw);
            sessionId = pretestData.sessionId || localStorage.getItem("engenix_session_id") || "";
        }
    }catch(err){
        console.warn("Data pretes tidak dapat dibaca.",err);
    }
}

function startPosttest(){
    postIndex = 0;
    postAnswers = new Array(ESSAY_QUESTIONS.length).fill("");

    const nameInput = document.getElementById("posttestNameInput");
    const studentName = nameInput ? nameInput.value.trim() : "";
    if(!studentName){
        alert("Silakan tuliskan nama lengkapmu terlebih dahulu.");
        if(nameInput) nameInput.focus();
        return;
    }

    document.getElementById("posttestIntro").style.display = "none";
    document.getElementById("prepostSummary").style.display = "none";
    document.getElementById("posttestQuizContainer").style.display = "block";
    document.getElementById("posttestContinueBtn").style.display = "none";
    renderPostQuestion();
}

function renderPostQuestion(){
    clearInterval(postTimer);
    const q = ESSAY_QUESTIONS[postIndex];
    const total = ESSAY_QUESTIONS.length;
    const savedAnswer = postAnswers[postIndex] || "";
    const container = document.getElementById("posttestQuizContainer");

    container.innerHTML = `
        <div class="lab-quiz-top" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span class="lab-quiz-progress" style="font-weight:600;color:#1e5a97;">Soal ${postIndex+1} / ${total}</span>
            <span class="lab-quiz-timer" id="postTimer" style="font-weight:700;color:#1e5a97;">⏱ <span id="postTimerValue">${TIME_PER_ESSAY}</span>s</span>
        </div>
        <div class="progress-bar" style="margin-bottom:10px;"><div class="progress-fill" style="width:${(postIndex/total)*100}%"></div></div>
        <div class="lab-quiz-timerbar" style="width:100%;height:4px;background:#eef1f7;border-radius:10px;overflow:hidden;margin-bottom:16px;">
            <div class="lab-quiz-timerfill" id="postTimerFill" style="height:100%;width:100%;background:#22c55e;transition:width 1s linear, background .3s ease;"></div>
        </div>
        <div class="lab-quiz-label" style="font-size:12px;font-weight:700;color:#64748b;letter-spacing:.05em;margin-bottom:6px;">TAHAP ${q.tahap.toUpperCase()} • MATERI ${q.materi}</div>
        <div class="lab-quiz-question" style="font-weight:600;font-size:16px;margin-bottom:14px;line-height:1.6;">${q.question}</div>
        <textarea id="postAnswerInput" rows="6" placeholder="Tulis jawabanmu di sini..." style="width:100%;padding:14px 16px;border:2px solid #dcecff;border-radius:12px;font-family:inherit;font-size:15px;resize:vertical;outline:none;">${savedAnswer}</textarea>
        <p id="postWarning" style="display:none;color:#dc2626;font-size:14px;margin-top:8px;">⚠ Silakan tuliskan jawabanmu terlebih dahulu.</p>
        <div class="lab-quiz-actions" style="margin-top:16px;">
            <button class="next-btn" id="postNextBtn">${postIndex===total-1?'Selesai ✓':'Lanjut →'}</button>
        </div>`;

    const textarea = document.getElementById("postAnswerInput");
    textarea.addEventListener("input", ()=>{
        postAnswers[postIndex] = textarea.value;
        document.getElementById("postWarning").style.display = "none";
    });
    document.getElementById("postNextBtn").onclick = nextPostQuestion;
    textarea.focus();
    startPostTimer();
}

function startPostTimer(){
    postTimeLeft = TIME_PER_ESSAY;
    updatePostTimer();
    postTimer=setInterval(()=>{
        postTimeLeft--;
        updatePostTimer();
        if(postTimeLeft<=0){
            clearInterval(postTimer);
            nextPostQuestion(true);
        }
    },1000);
}

function updatePostTimer(){
    const value=document.getElementById("postTimerValue");
    const timer=document.getElementById("postTimer");
    const fill=document.getElementById("postTimerFill");
    if(!value) return;
    value.textContent=postTimeLeft;
    fill.style.width=Math.max(0,(postTimeLeft/TIME_PER_ESSAY)*100)+"%";
    const warn=postTimeLeft<=45;
    timer.classList.toggle("warn",warn);
    fill.classList.toggle("warn",warn);
}

function nextPostQuestion(auto=false){
    clearInterval(postTimer);
    const textarea = document.getElementById("postAnswerInput");
    if(textarea) postAnswers[postIndex] = textarea.value;

    if(!auto && postAnswers[postIndex].trim()===""){
        document.getElementById("postWarning").style.display="block";
        return;
    }
    if(postIndex<ESSAY_QUESTIONS.length-1){
        postIndex++;
        renderPostQuestion();
    }else{
        finishPosttest();
    }
}

function finishPosttest(){
    clearInterval(postTimer);

    const textarea = document.getElementById("postAnswerInput");
    if(textarea) postAnswers[postIndex] = textarea.value;

    const cleanedAnswers = postAnswers.map(a => (a || "").trim());
    const answeredCount = cleanedAnswers.filter(a => a !== "").length;

    posttestData = {
        answers: cleanedAnswers,
        answeredCount: answeredCount,
        total: ESSAY_QUESTIONS.length
    };

    if(!pretestData){
        loadExternalPretestData();
    }

    const nameFromInput = document.getElementById("posttestNameInput")
        ? document.getElementById("posttestNameInput").value.trim()
        : "";
    const pre = pretestData || { name: nameFromInput || "-" };

    document.getElementById("summaryName").textContent = pre.name || nameFromInput || "-";
    document.getElementById("summaryPosttestCorrect").textContent =
        answeredCount + " / " + ESSAY_QUESTIONS.length + " soal terjawab (menunggu penilaian guru)";

    document.getElementById("posttestQuizContainer").style.display="none";
    document.getElementById("prepostSummary").style.display="block";
    document.getElementById("posttestContinueBtn").style.display="inline-flex";

    saveResultToGoogleSheet();
}

// ========================================
// SIMPAN HASIL KE GOOGLE SHEETS
// ========================================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-AUDkZF0vZNkZZHESTSLmo-8wRsFxhKyoS3hiFTms6_96KL6WIG1-KT0SmZhDZHoxVg/exec";

function saveResultToGoogleSheet(){

    if(!posttestData){
        return;
    }

    const statusEl = document.getElementById("summarySaveStatus");

    if(!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.indexOf("PASTE_URL") !== -1){
        if(statusEl){
            statusEl.textContent =
                "⚠ URL Google Apps Script belum dikonfigurasi.";
        }
        return;
    }

    if(!pretestData){
        loadExternalPretestData();
    }

    if(!sessionId){
        sessionId = (pretestData && pretestData.sessionId) || localStorage.getItem("engenix_session_id") || "";
    }

    const nameFromInput = document.getElementById("posttestNameInput")
        ? document.getElementById("posttestNameInput").value.trim()
        : "";

    const payload = {
        action: "posttest",
        sessionId: sessionId,
        nama: (pretestData && pretestData.name) || nameFromInput,
        email: (pretestData && pretestData.email) || localStorage.getItem("engenix_student_email") || "",
        postestAnswers: posttestData.answers
    };

    if(statusEl){
        statusEl.textContent = "⏳ Menyimpan jawaban posttest ke Google Sheets...";
    }

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    })
    .then(()=>{
        if(statusEl){
            statusEl.textContent = "✅ Jawaban posttest tersimpan ke Google Sheets. Guru akan menilai menggunakan rubrik.";
        }
    })
    .catch((err)=>{
        console.error("Gagal menyimpan ke Google Sheets:", err);
        if(statusEl){
            statusEl.textContent =
                "❌ Gagal mengirim jawaban ke Google Sheets.";
        }
    });
}

/* ==========================================================
   ENGENIX -- Header transparan di hero, menebal saat discroll
   ========================================================== */
(function () {
    const headerEl = document.querySelector(".header");
    if (!headerEl) return;

    function updateHeaderState() {
        if (window.scrollY > 60) {
            headerEl.classList.add("is-scrolled");
        } else {
            headerEl.classList.remove("is-scrolled");
        }
    }

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
})();