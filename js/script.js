// ========================================
// VIRTUAL LABORATORY
// ========================================

// ===============================
// GLOBAL VARIABLE
// ===============================

let currentStep = 1;
const totalStep = 9;

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
// PRETES & POSTES
// ========================================

// Soal Pretes — tingkat DASAR (mengukur pemahaman awal sebelum belajar)
const PRETEST_QUESTIONS = [
    {
        topic: "PLTS",
        question: "Sebuah sekolah ingin mengurangi penggunaan listrik dari jaringan PLN. Atap sekolah memiliki luas 120 m² dan menerima sinar matahari cukup kuat hampir sepanjang hari. Namun, bagian atap sebelah timur sering tertutup bayangan pohon pada pagi hari. Apa pertanyaan yang paling tepat untuk menjadi dasar proses desain PLTS?",
        options: [
            "Apa warna panel surya yang paling menarik?",
            "Berapa jumlah siswa yang menggunakan listrik di sekolah?",
            "Bagaimana merancang posisi dan jumlah panel agar kebutuhan listrik sekolah dapat dipenuhi dengan mempertimbangkan luas atap dan kondisi bayangan?",
            "Mengapa energi matahari termasuk energi terbarukan?",
            "Apakah panel surya lebih mahal daripada generator?"
        ],
        correct: 2
    },
    {
        topic: "PLTB",
        question: "Kelompok siswa akan membuat prototipe turbin angin. Mereka menemukan bahwa kecepatan angin di lokasi sekolah relatif rendah, tetapi berlangsung cukup stabil sepanjang hari. Aspek apa yang paling penting dianalisis sebelum menentukan desain turbin?",
        options: [
            "Warna bilah turbin",
            "Jenis dekorasi pada menara",
            "Bentuk dan ukuran bilah yang mampu menangkap energi angin pada kecepatan rendah",
            "Jumlah siswa yang membuat prototipe",
            "Letak ruang kelas terdekat"
        ],
        correct: 2
    },
    {
        topic: "PLTMH",
        question: "Sebuah desa memiliki sungai dengan aliran air relatif stabil dan terdapat perbedaan ketinggian antara bagian atas dan bawah sungai. Siswa diminta merancang PLTMH sederhana untuk menghasilkan listrik. Desain mana yang paling sesuai dengan kondisi tersebut?",
        options: [
            "Memasang panel surya di dasar sungai",
            "Menggunakan turbin yang memanfaatkan energi aliran dan perbedaan ketinggian air",
            "Memasang turbin angin di permukaan sungai",
            "Menggunakan baterai tanpa sumber energi",
            "Menggunakan generator yang digerakkan secara manual"
        ],
        correct: 1
    },
    {
        topic: "PLTS",
        question: "Sebuah kelompok akan membuat prototipe PLTS. Mereka memiliki panel surya, kabel, multimeter, lampu LED, dan baterai. Target desainnya adalah menghasilkan listrik yang cukup untuk menyalakan LED selama beberapa jam. Langkah Plan yang paling tepat adalah ...",
        options: [
            "Langsung memasang seluruh komponen tanpa menentukan konfigurasi",
            "Menentukan konfigurasi panel, rangkaian komponen, kebutuhan daya, dan cara pengujian sebelum membuat prototipe",
            "Memilih warna kabel terlebih dahulu",
            "Menguji prototipe setelah seluruh proyek selesai",
            "Membeli komponen sebanyak mungkin agar daya semakin besar"
        ],
        correct: 1
    },
    {
        topic: "PLTB",
        question: "Dua kelompok membuat turbin angin dengan generator yang sama. Berdasarkan data berikut, desain mana yang sebaiknya dipilih jika tujuan desain adalah memperoleh tegangan terbesar? Data: Desain A = 2 bilah, 10 cm, 1,8 V; Desain B = 4 bilah, 10 cm, 2,6 V; Desain C = 6 bilah, 10 cm, 2,1 V.",
        options: [
            "Memilih desain A karena memiliki bilah paling sedikit",
            "Memilih desain B karena menghasilkan tegangan tertinggi",
            "Memilih desain C karena jumlah bilah paling banyak",
            "Menggabungkan semua desain tanpa pengujian",
            "Mengabaikan data karena jumlah bilah tidak berpengaruh"
        ],
        correct: 1
    },
    {
        topic: "PLTMH",
        question: "Siswa membuat tiga prototipe turbin air dengan bentuk sudu berbeda. Hasil pengujian menunjukkan P = 1,2 V, Q = 2,4 V, dan R = 1,7 V. Prototipe Q menghasilkan tegangan paling tinggi, tetapi saat debit air dinaikkan, turbin Q mengalami getaran cukup besar. Tindakan berikutnya yang paling tepat dalam EDP adalah ...",
        options: [
            "Menghentikan proyek karena prototipe sudah menghasilkan listrik",
            "Memilih prototipe Q tanpa melakukan perubahan",
            "Menganalisis penyebab getaran kemudian memperbaiki desain dan mengujinya kembali",
            "Mengganti PLTMH menjadi PLTS",
            "Mengabaikan getaran karena tegangan sudah tinggi"
        ],
        correct: 2
    },
    {
        topic: "PLTS",
        question: "Sebuah prototipe PLTS menghasilkan daya 40 W ketika panel terkena cahaya matahari langsung. Setelah dipasang di lokasi sebenarnya, daya hanya mencapai 25 W karena sebagian permukaan panel terkena bayangan. Perbaikan desain yang paling logis adalah ...",
        options: [
            "Mengurangi ukuran panel",
            "Memindahkan atau mengatur posisi panel untuk mengurangi efek bayangan",
            "Mengurangi intensitas cahaya yang diterima panel",
            "Mengganti panel dengan turbin angin tanpa analisis lebih lanjut",
            "Menutup sebagian panel agar suhu meningkat"
        ],
        correct: 1
    },
    {
        topic: "PLTB",
        question: "Sebuah kelompok menguji dua desain bilah turbin angin. Desain A menghasilkan 2,1 V dan Desain B menghasilkan 2,8 V. Keduanya diuji pada kecepatan angin 4 m/s dengan generator yang sama. A memiliki 3 bilah dan B memiliki 5 bilah. Kesimpulan yang paling tepat adalah ...",
        options: [
            "Desain A lebih baik karena memiliki lebih sedikit bilah",
            "Desain B menunjukkan performa listrik lebih tinggi pada kondisi pengujian tersebut",
            "Desain A pasti lebih efisien pada semua kondisi angin",
            "Jumlah bilah tidak mungkin memengaruhi keluaran listrik",
            "Desain B pasti paling baik untuk semua kecepatan angin"
        ],
        correct: 1
    },
    {
        topic: "PLTMH",
        question: "Sebuah prototipe PLTMH menghasilkan tegangan 1,5 V. Setelah dianalisis, siswa menemukan bahwa aliran air tidak langsung mengenai sudu turbin sehingga sebagian energi air tidak dimanfaatkan secara optimal. Perbaikan desain yang paling sesuai adalah ...",
        options: [
            "Mengurangi aliran air sebanyak mungkin",
            "Mengatur saluran air agar aliran lebih terarah menuju sudu turbin",
            "Menghilangkan generator",
            "Mengganti turbin dengan panel surya",
            "Menambahkan beban listrik tanpa mengubah desain"
        ],
        correct: 1
    },
    {
        topic: "Umum",
        question: "Tiga lokasi memiliki karakteristik: A intensitas matahari tinggi dan tidak ada sungai; B angin relatif kuat dan stabil; C sungai mengalir stabil dengan perbedaan ketinggian. Pasangan teknologi yang paling sesuai adalah ...",
        options: [
            "A–PLTB, B–PLTMH, C–PLTS",
            "A–PLTS, B–PLTB, C–PLTMH",
            "A–PLTMH, B–PLTS, C–PLTB",
            "A–PLTB, B–PLTS, C–PLTMH",
            "A–PLTMH, B–PLTB, C–PLTS"
        ],
        correct: 1
    },
    {
        topic: "Umum",
        question: "Sebuah sekolah ingin memasang PLTS dengan tiga ketentuan: biaya pemasangan terbatas, luas atap terbatas, dan sistem harus mampu menyediakan listrik untuk lampu kelas. Dalam EDP, ketiga kondisi tersebut harus dipertimbangkan sebagai ...",
        options: [
            "Hasil akhir",
            "Variabel bebas saja",
            "Kriteria dan kendala desain",
            "Hipotesis",
            "Kesimpulan eksperimen"
        ],
        correct: 2
    },
    {
        topic: "Umum",
        question: "Dua desain PLTB diuji tiga kali. Desain X menghasilkan 2,4 V; 2,5 V; 2,3 V. Desain Y menghasilkan 2,1 V; 2,2 V; 3,0 V. Kelompok menyatakan Desain Y pasti lebih baik karena memiliki hasil tertinggi pada pengujian ketiga. Analisis yang paling tepat adalah ...",
        options: [
            "Benar, karena nilai tertinggi selalu menentukan desain terbaik",
            "Benar, karena pengujian pertama dan kedua tidak perlu diperhatikan",
            "Kurang tepat, karena seluruh hasil pengujian perlu dipertimbangkan sebelum menentukan desain terbaik",
            "Salah, karena tegangan tidak dapat digunakan untuk membandingkan desain",
            "Salah, karena desain harus dipilih berdasarkan jumlah pengujian saja"
        ],
        correct: 2
    },
    {
        topic: "PLTS",
        question: "Sebuah rumah menggunakan PLTS dengan baterai. Pada siang hari energi yang dihasilkan panel cukup besar, tetapi pada malam hari baterai cepat habis sehingga lampu tidak dapat menyala sepanjang malam. Solusi desain yang paling tepat untuk dianalisis terlebih dahulu adalah ...",
        options: [
            "Menghilangkan baterai",
            "Menganalisis kebutuhan energi malam hari dan kapasitas penyimpanan sebelum menentukan perubahan sistem",
            "Mematikan panel pada siang hari",
            "Mengurangi jumlah lampu tanpa menghitung kebutuhan energi",
            "Mengganti PLTS dengan PLTB tanpa menganalisis kondisi lokasi"
        ],
        correct: 1
    },
    {
        topic: "Umum",
        question: "Sebuah kelompok ingin memilih teknologi energi terbarukan untuk sekolah. PLTS menghasilkan energi cukup besar pada siang hari. PLTB tidak stabil karena kecepatan angin berubah-ubah. PLTMH dapat menghasilkan energi lebih stabil, tetapi lokasi sekolah jauh dari sungai. Jika kriteria utama adalah kestabilan sumber energi dan kesesuaian lokasi, keputusan yang paling rasional adalah ...",
        options: [
            "Memilih PLTMH karena selalu paling stabil",
            "Memilih PLTB karena semua sekolah pasti memiliki angin yang cukup",
            "Mempertimbangkan PLTS sebagai pilihan utama karena sumber energi tersedia di lokasi, kemudian menganalisis kebutuhan penyimpanan energi",
            "Memilih PLTMH karena tidak membutuhkan aliran air",
            "Memilih PLTB tanpa mempertimbangkan data lokasi"
        ],
        correct: 2
    },
    {
        topic: "PLTS",
        question: "Sebuah kelompok membuat prototipe PLTS. Pada pengujian pertama daya 30 W. Setelah posisi panel diperbaiki, daya meningkat menjadi 38 W. Namun, ketika sebagian panel tertutup bayangan, daya kembali turun menjadi 24 W. Tindakan yang paling mencerminkan tahap Improve dalam EDP adalah ...",
        options: [
            "Menganggap desain pertama sudah berhasil",
            "Menggunakan hasil 24 W karena merupakan pengujian terakhir",
            "Mempertahankan perubahan posisi yang meningkatkan daya dan mencari solusi untuk mengurangi pengaruh bayangan",
            "Menghapus seluruh data pengujian",
            "Mengganti PLTS dengan sumber energi lain tanpa evaluasi"
        ],
        correct: 2
    }
];

const POSTTEST_QUESTIONS = PRETEST_QUESTIONS.map(q => ({...q, options:[...q.options]}));


// Membuat tampilan soal pilihan ganda di dalam sebuah container
let pretestData = null;
let posttestData = null;
let sessionId = localStorage.getItem("engenix_session_id") || "";

// ========================================
// POSTTEST — ONE QUESTION PER PAGE
// ========================================
let postIndex = 0;
let postAnswers = new Array(POSTTEST_QUESTIONS.length).fill(null);
let postTimer = null;
let postTimeLeft = 90;
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
    postAnswers = new Array(POSTTEST_QUESTIONS.length).fill(null);
    document.getElementById("posttestStartBox").style.display = "none";
    document.getElementById("prepostSummary").style.display = "none";
    document.getElementById("posttestWarning").style.display = "none";
    document.getElementById("posttestQuizContainer").style.display = "block";
    document.getElementById("posttestContinueBtn").style.display = "none";
    renderPostQuestion();
}

function renderPostQuestion(){
    clearInterval(postTimer);
    const q = POSTTEST_QUESTIONS[postIndex];
    const total = POSTTEST_QUESTIONS.length;
    const chosen = postAnswers[postIndex];
    const letters = ["A","B","C","D","E"];
    const container = document.getElementById("posttestQuizContainer");

    container.innerHTML = `
        <div class="lab-quiz-top">
            <span class="lab-quiz-progress">Soal ${postIndex+1} / ${total}</span>
            <span class="lab-quiz-timer" id="postTimer">⏱ <span id="postTimerValue">90</span>s</span>
        </div>
        <div class="lab-quiz-progressbar"><div class="lab-quiz-progressfill" style="width:${(postIndex/total)*100}%"></div></div>
        <div class="lab-quiz-timerbar"><div class="lab-quiz-timerfill" id="postTimerFill"></div></div>
        <div class="lab-quiz-label">TOPIK ${q.topic}</div>
        <div class="lab-quiz-question">${q.question}</div>
        <div class="lab-quiz-options" id="postOptions"></div>
        <div class="lab-quiz-actions">
            <button class="next-btn" id="postNextBtn" ${chosen===null?'disabled':''}>${postIndex===total-1?'Selesai ✓':'Next →'}</button>
        </div>`;

    const options = document.getElementById("postOptions");
    q.options.forEach((opt,i)=>{
        const btn=document.createElement("button");
        btn.type="button";
        btn.className="lab-quiz-option"+(chosen===i?" selected":"");
        btn.innerHTML=`<span class="letter">${letters[i]}</span><span>${opt}</span>`;
        btn.onclick=()=>selectPostAnswer(i);
        options.appendChild(btn);
    });
    document.getElementById("postNextBtn").onclick=nextPostQuestion;
    startPostTimer();
}

function selectPostAnswer(index){
    postAnswers[postIndex]=index;
    document.querySelectorAll(".lab-quiz-option").forEach((el,i)=>el.classList.toggle("selected",i===index));
    document.getElementById("postNextBtn").disabled=false;
    document.getElementById("posttestWarning").style.display="none";
}

function startPostTimer(){
    postTimeLeft=90;
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
    fill.style.width=Math.max(0,(postTimeLeft/90)*100)+"%";
    const warn=postTimeLeft<=15;
    timer.classList.toggle("warn",warn);
    fill.classList.toggle("warn",warn);
}

function nextPostQuestion(auto=false){
    clearInterval(postTimer);
    if(!auto && postAnswers[postIndex]===null){
        document.getElementById("posttestWarning").style.display="block";
        return;
    }
    if(postIndex<POSTTEST_QUESTIONS.length-1){
        postIndex++;
        renderPostQuestion();
    }else{
        finishPosttest();
    }
}

function summarizeWrongAnswers(answers){
    const wrong=answers.filter(a=>!a.isCorrect);
    if(wrong.length===0) return "Tidak ada";
    return wrong.map(a=>"Soal "+a.number+" ("+a.topic+")").join(", ");
}

function finishPosttest(){
    clearInterval(postTimer);

    const answers = POSTTEST_QUESTIONS.map((q,i)=>({
        number:i+1,
        topic:q.topic,
        question:q.question,
        chosen:postAnswers[i]===null ? null : q.options[postAnswers[i]],
        correctAnswer:q.options[q.correct],
        isCorrect:postAnswers[i]===q.correct
    }));

    const correctCount = answers.filter(a=>a.isCorrect).length;
    const benarNomor = answers.filter(a=>a.isCorrect).map(a=>a.number);
    const salahNomor = answers.filter(a=>!a.isCorrect).map(a=>a.number);

    posttestData = {
        score: Math.round(correctCount/POSTTEST_QUESTIONS.length*100),
        correctCount: correctCount,
        incorrectCount: POSTTEST_QUESTIONS.length-correctCount,
        total: POSTTEST_QUESTIONS.length,
        benarNomor: benarNomor,
        salahNomor: salahNomor,
        answers: answers
    };

    if(!pretestData){
        loadExternalPretestData();
    }

    const pre = pretestData || {
        name:"-",
        score:0,
        correctCount:0,
        incorrectCount:0
    };

    document.getElementById("summaryName").textContent = pre.name || "-";
    document.getElementById("summaryPretestCorrect").textContent =
        pre.correctCount + " Benar, " + pre.incorrectCount + " Salah";
    document.getElementById("summaryPretestScore").textContent =
        (pre.score || 0) + "%";

    document.getElementById("summaryPosttestCorrect").textContent =
        posttestData.correctCount + " Benar, " + posttestData.incorrectCount + " Salah";
    document.getElementById("summaryPosttestScore").textContent =
        posttestData.score + "%";

    document.getElementById("posttestQuizContainer").style.display="none";
    document.getElementById("prepostSummary").style.display="block";
    document.getElementById("posttestContinueBtn").style.display="inline-flex";

    saveResultToGoogleSheet();
}

// ========================================
// SIMPAN HASIL KE GOOGLE SHEETS
// ========================================

const GOOGLE_SCRIPT_URL = "PASTE_URL_GOOGLE_APPS_SCRIPT_ANDA_DI_SINI";

function saveResultToGoogleSheet(){

    if(!pretestData || !posttestData){
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

    if(!sessionId){
        sessionId = pretestData.sessionId || localStorage.getItem("engenix_session_id") || "";
    }

    const payload = {
        action: "posttest",
        sessionId: sessionId,
        nama: pretestData.name,
        email: pretestData.email || localStorage.getItem("engenix_student_email") || "",

        nilaiPretes: pretestData.score,
        benarPretes: pretestData.correctCount,
        salahPretes: pretestData.incorrectCount,
        benarPretesDetail:
            "Benar " + pretestData.correctCount + " (" +
            ((pretestData.benarNomor || []).join(", ") || "-") + ")",
        salahPretesDetail:
            "Salah " + pretestData.incorrectCount + " (" +
            ((pretestData.salahNomor || []).join(", ") || "-") + ")",

        nilaiPostes: posttestData.score,
        benarPostes: posttestData.correctCount,
        salahPostes: posttestData.incorrectCount,
        benarPostesDetail:
            "Benar " + posttestData.correctCount + " (" +
            ((posttestData.benarNomor || []).join(", ") || "-") + ")",
        salahPostesDetail:
            "Salah " + posttestData.incorrectCount + " (" +
            ((posttestData.salahNomor || []).join(", ") || "-") + ")"
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
    .then(()=>{
        if(statusEl){
            statusEl.textContent = "✅ Hasil pembelajaran tersimpan ke Google Sheets.";
        }
    })
    .catch((err)=>{
        console.error("Gagal menyimpan ke Google Sheets:", err);
        if(statusEl){
            statusEl.textContent =
                "❌ Gagal mengirim hasil ke Google Sheets.";
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