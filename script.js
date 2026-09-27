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

    // ==========================================================
    // LOMPAT LANGSUNG KE POSTTEST (Step 8) UNTUK KELOMPOK LKPD
    // Dipicu dari tombol di lkpd.html: virtuallab.html?goto=posttest
    // Kelompok yang mengerjakan LKPD tidak perlu mengulang Step 1-7
    // karena tahap desain sudah dijalankan oleh anggota yang membuka
    // Virtual Lab langsung.
    // ==========================================================
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get("goto") === "posttest"){
        currentStep = 8;
    }

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
// POSTTEST (ESAI) — VIRTUAL LAB STEP 8
// Soal identik dengan pretest.html (syarat instrumen gain-score:
// pretest & posttest harus memakai soal yang sama).
// ========================================

const POSTTEST_QUESTIONS = [
    {
        tahap: "Identifikasi Masalah (Ask/Identify)",
        materi: "PLTS",
        text: "Sebuah sekolah ingin memasang PLTS. Atap sekolah seluas 120 m² menerima sinar matahari cukup kuat hampir sepanjang hari, tetapi bagian atap sebelah timur sering tertutup bayangan pohon pada pagi hari. Identifikasi dan analisislah kendala-kendala yang harus dipertimbangkan sebelum menentukan desain PLTS di sekolah tersebut!"
    },
    {
        tahap: "Identifikasi Masalah (Ask/Identify)",
        materi: "PLTB",
        text: "Data kecepatan angin rata-rata di suatu wilayah adalah 3,2 m/s, sementara turbin angin pada umumnya baru mulai berputar efektif di cut-in speed sekitar 3 m/s dan mencapai daya maksimum sekitar 12 m/s. Identifikasi dan analisislah apakah wilayah tersebut layak untuk pembangunan PLTB!"
    },
    {
        tahap: "Membayangkan Solusi (Imagine)",
        materi: "PLTMH",
        text: "Sebuah sungai memiliki head (beda tinggi) 15 m dan debit air sedang. Bayangkan dan usulkan beberapa alternatif jenis turbin air yang mungkin digunakan untuk kondisi ini, serta jelaskan pertimbangan pemilihan masing-masing alternatif!"
    },
    {
        tahap: "Membayangkan Solusi (Imagine)",
        materi: "Umum",
        text: "Suatu wilayah memiliki potensi: intensitas matahari sedang, kecepatan angin sedang, dan terdapat sungai kecil dengan debit stabil. Usulkan beberapa alternatif solusi energi terbarukan yang mungkin diterapkan di wilayah tersebut, lengkap dengan kelebihan dan kekurangan masing-masing alternatif!"
    },
    {
        tahap: "Merencanakan (Plan)",
        materi: "PLTS",
        text: "Sebuah desa menargetkan energi 24 kWh/hari dari PLTS, dengan irradiance rata-rata G = 800 W/m², efisiensi panel η = 18%, luas 1 panel = 1,6 m², dan sistem beroperasi efektif 5 jam/hari. Gunakan rumus P = A × G × η × N. Rencanakan jumlah panel (N) minimal yang dibutuhkan untuk mencapai target tersebut!"
    },
    {
        tahap: "Merencanakan (Plan)",
        materi: "PLTB",
        text: "Sebuah tim ingin merancang PLTB dengan target daya sekitar 2 MW pada kecepatan angin rata-rata 10 m/s, menggunakan turbin dengan Cp = 0,4 dan ρ = 1,225 kg/m³. Gunakan rumus P = ½ × ρ × A × v³ × Cp. Rencanakan estimasi luas sapuan rotor (A) yang dibutuhkan (dalam m²)!"
    },
    {
        tahap: "Membuat (Create)",
        materi: "PLTMH",
        text: "Sebuah kelompok memiliki komponen: bak penenang, pipa pesat (penstock), turbin Crossflow, generator, dan kabel penyalur. Rancangan mereka menetapkan head 15 m dan debit sedang. Susunlah langkah pembuatan (Create) purwarupa PLTMH menggunakan komponen tersebut agar sesuai dengan rancangan dan dapat berfungsi optimal!"
    },
    {
        tahap: "Menguji (Test)",
        materi: "Umum",
        text: "Tiga purwarupa turbin air diuji coba: Purwarupa P = 1,2 V, Q = 2,4 V, R = 1,7 V. Purwarupa Q menghasilkan tegangan tertinggi, namun saat debit dinaikkan, Q mengalami getaran cukup besar dibanding P dan R. Analisislah hasil pengujian tersebut dan tentukan purwarupa mana yang lebih layak dipilih, sertakan batasan dari kesimpulanmu!"
    },
    {
        tahap: "Memperbaiki (Improve)",
        materi: "PLTB",
        text: "Sebuah purwarupa turbin angin menghasilkan tegangan tinggi, tetapi mengalami getaran besar saat kecepatan angin dinaikkan. Evaluasilah kemungkinan penyebab getaran tersebut dan usulkan perbaikan desain yang tepat!"
    },
    {
        tahap: "Memperbaiki (Improve)",
        materi: "PLTS",
        text: "Hasil simulasi sebuah desain PLTS menunjukkan energi yang dihasilkan 95 kWh/hari (target 120 kWh/hari) dengan efisiensi sistem 78% (target ≥85%). Evaluasilah penyebab desain belum memenuhi target dan rancanglah perbaikan desain yang terjustifikasi berdasarkan variabel dalam rumus P = A × G × η × N!"
    }
];

const POSTTEST_TIME_PER_QUESTION = 300; // detik (5 menit per soal, sama seperti pretest)

let pretestData = null;
let posttestData = null;
let sessionId = localStorage.getItem("engenix_session_id") || "";

let postIndex = 0;
let postAnswers = new Array(POSTTEST_QUESTIONS.length).fill("");
let postTimer = null;
let postTimeLeft = POSTTEST_TIME_PER_QUESTION;
let posttestIsFinishing = false;

function loadExternalPretestData(){
    try{
        const raw = localStorage.getItem("engenix_pretest_result");
        if(raw){
            pretestData = JSON.parse(raw);
            sessionId = pretestData.sessionId || localStorage.getItem("engenix_session_id") || "";
        }
    }catch(err){
        console.warn("Data pretes tidak dapat dibaca.", err);
    }
}

// ========================================
// POSTTEST — SATU SOAL ESAI PER HALAMAN
// ========================================

function startPosttest(){
    const nameInput = document.getElementById("posttestNameInput");
    const typedName = nameInput ? nameInput.value.trim() : "";

    if(!typedName && !(pretestData && pretestData.name)){
        alert("Silakan tuliskan nama lengkapmu terlebih dahulu sebelum memulai posttest.");
        if(nameInput) nameInput.focus();
        return;
    }

    posttestIsFinishing = false;
    postIndex = 0;
    postAnswers = new Array(POSTTEST_QUESTIONS.length).fill("");

    document.getElementById("posttestIntro").style.display = "none";
    document.getElementById("prepostSummary").style.display = "none";
    document.getElementById("posttestQuizContainer").style.display = "block";
    document.getElementById("posttestContinueBtn").style.display = "none";

    renderPostQuestion();
}

function renderPostQuestion(){
    clearInterval(postTimer);

    const q = POSTTEST_QUESTIONS[postIndex];
    const total = POSTTEST_QUESTIONS.length;
    const container = document.getElementById("posttestQuizContainer");

    container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap;">
            <span style="font-weight:700;color:#1e5a97;background:#eef7ff;padding:6px 14px;border-radius:30px;font-size:.85rem;">Soal ${postIndex + 1} / ${total}</span>
            <span id="postTimer" style="font-weight:800;color:#1e5a97;background:#eef7ff;padding:6px 14px;border-radius:30px;font-size:.9rem;">⏱ <span id="postTimerValue">${POSTTEST_TIME_PER_QUESTION}</span>s</span>
        </div>
        <div style="width:100%;height:6px;background:#eef1f7;border-radius:10px;overflow:hidden;margin-bottom:10px;">
            <div style="height:100%;background:linear-gradient(90deg,#245DAB,#4c8ce0);width:${(postIndex / total) * 100}%;"></div>
        </div>
        <div style="width:100%;height:4px;background:#eef1f7;border-radius:10px;overflow:hidden;margin-bottom:18px;">
            <div id="postTimerFill" style="height:100%;background:#22c55e;width:100%;transition:width 1s linear, background .3s ease;"></div>
        </div>
        <div style="font-size:.78rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">TAHAP ${q.tahap.toUpperCase()} • MATERI ${q.materi}</div>
        <div style="font-size:1.15rem;font-weight:700;color:#0f172a;line-height:1.5;margin-bottom:20px;">${q.text}</div>
        <textarea id="postAnswerInput" rows="7" placeholder="Tulis jawabanmu di sini...">${postAnswers[postIndex] || ""}</textarea>
        <p id="postAnswerWarning" style="display:none;color:#dc2626;font-size:.85rem;font-weight:600;margin:8px 0 0;">⚠ Silakan tuliskan jawabanmu terlebih dahulu sebelum melanjutkan.</p>
        <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <button class="next-btn" id="postNextBtn" type="button" ${postAnswers[postIndex].trim() === "" ? "disabled" : ""}>${postIndex === total - 1 ? "Selesai ✓" : "Lanjut →"}</button>
        </div>`;

    const answerInput = document.getElementById("postAnswerInput");
    const nextBtn = document.getElementById("postNextBtn");

    answerInput.oninput = () => {
        postAnswers[postIndex] = answerInput.value;
        nextBtn.disabled = answerInput.value.trim() === "";
        document.getElementById("postAnswerWarning").style.display = "none";
    };

    nextBtn.onclick = () => nextPostQuestion(false);

    startPostTimer();
    answerInput.focus();
}

function startPostTimer(){
    clearInterval(postTimer);
    postTimeLeft = POSTTEST_TIME_PER_QUESTION;
    updatePostTimer();
    postTimer = setInterval(() => {
        postTimeLeft--;
        updatePostTimer();
        if(postTimeLeft <= 0){
            clearInterval(postTimer);
            nextPostQuestion(true);
        }
    }, 1000);
}

function updatePostTimer(){
    const value = document.getElementById("postTimerValue");
    const timer = document.getElementById("postTimer");
    const fill = document.getElementById("postTimerFill");
    if(!value) return;
    value.textContent = postTimeLeft;
    fill.style.width = Math.max(0, (postTimeLeft / POSTTEST_TIME_PER_QUESTION) * 100) + "%";
    const warn = postTimeLeft <= 45;
    timer.style.color = warn ? "#dc2626" : "#1e5a97";
    timer.style.background = warn ? "#fee2e2" : "#eef7ff";
    fill.style.background = warn ? "#dc2626" : "#22c55e";
}

function nextPostQuestion(auto){
    clearInterval(postTimer);
    const total = POSTTEST_QUESTIONS.length;

    if(!auto && postAnswers[postIndex].trim() === ""){
        document.getElementById("postAnswerWarning").style.display = "block";
        return;
    }

    if(postIndex < total - 1){
        postIndex++;
        renderPostQuestion();
    }else{
        if(posttestIsFinishing) return; // cegah klik/timeout ganda
        posttestIsFinishing = true;
        finishPosttest();
    }
}

function finishPosttest(){
    clearInterval(postTimer);

    if(!pretestData){
        loadExternalPretestData();
    }

    const nameInput = document.getElementById("posttestNameInput");
    const typedName = nameInput ? nameInput.value.trim() : "";
    const name = typedName || (pretestData && pretestData.name) || "-";

    if(!sessionId){
        sessionId = (pretestData && pretestData.sessionId) ||
            "ENG-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem("engenix_session_id", sessionId);
    }

    const answeredCount = postAnswers.filter(a => a && a.trim() !== "").length;

    posttestData = {
        sessionId: sessionId,
        name: name,
        answers: postAnswers.map(a => (a || "").trim()),
        answeredCount: answeredCount,
        total: POSTTEST_QUESTIONS.length,
        stage: "posttest"
    };

    document.getElementById("summaryName").textContent = name;
    document.getElementById("summaryPosttestCorrect").textContent =
        answeredCount + "/" + POSTTEST_QUESTIONS.length + " Soal Terjawab";

    document.getElementById("posttestQuizContainer").style.display = "none";
    document.getElementById("prepostSummary").style.display = "block";
    document.getElementById("posttestContinueBtn").style.display = "inline-flex";

    saveResultToGoogleSheet();
}

// ========================================
// SIMPAN HASIL KE GOOGLE SHEETS
// (URL Apps Script sama dengan yang dipakai pretest.html & lkpd.html)
// ========================================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-AUDkZF0vZNkZZHESTSLmo-8wRsFxhKyoS3hiFTms6_96KL6WIG1-KT0SmZhDZHoxVg/exec";

function saveResultToGoogleSheet(){
    if(!posttestData){
        return;
    }

    const statusEl = document.getElementById("summarySaveStatus");

    if(!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.indexOf("PASTE_URL") !== -1){
        if(statusEl){
            statusEl.textContent = "⚠ URL Google Apps Script belum dikonfigurasi.";
        }
        return;
    }

    const payload = {
        action: "posttest",
        sessionId: posttestData.sessionId,
        nama: posttestData.name,
        posttestAnswers: posttestData.answers
    };

    if(statusEl){
        statusEl.textContent = "⏳ Menyimpan hasil pembelajaran ke Google Sheets...";
    }

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    })
    .then(() => {
        if(statusEl){
            statusEl.textContent = "✅ Hasil pembelajaran tersimpan ke Google Sheets.";
        }
    })
    .catch((err) => {
        console.error("Gagal menyimpan ke Google Sheets:", err);
        if(statusEl){
            statusEl.textContent = "❌ Gagal mengirim hasil ke Google Sheets.";
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