
/* =====================================================
   K.W.CENTER SCORE WEBSITE
   SCRIPT.JS
===================================================== */


/* =====================================================
   API URL
===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwWnZXdOMoG8WcFvwej2TSYg_mPefYAt23r9PrlAZ63CYJPHmAYlUDUdAwWyvz4MqNK/exec";


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let students = [];

let selectedStudent = null;
let currentResultData = null;

/* =====================================================
   ELEMENTS
===================================================== */

const examSelect =
    document.getElementById("examSelect");

const nameInput =
    document.getElementById("nameInput");

const suggestions =
    document.getElementById("suggestions");

const searchButton =
    document.getElementById("searchButton");

const message =
    document.getElementById("message");

const resultSection =
    document.getElementById("resultSection");


/* =====================================================
   START WEBSITE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadExam();

        setupEvents();

    }
);


/* =====================================================
   LOAD EXAM
===================================================== */

async function loadExam() {

    try {

        showMessage(
            "กำลังโหลดข้อมูลการสอบ...",
            ""
        );


        const response =
            await fetch(
                API_URL +
                "?action=exams"
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "ไม่สามารถโหลดข้อมูลการสอบได้"
            );

        }


        examSelect.innerHTML = "";


        const option =
            document.createElement("option");

        option.value =
            data.exam.exam_id;

        option.textContent =
            `${data.exam.name} | ${data.exam.class} | ภาคเรียน ${data.exam.semester}`;


        examSelect.appendChild(option);


        showMessage("", "");


    }

    catch (error) {

        console.error(error);

        showMessage(
            "ไม่สามารถโหลดข้อมูลการสอบได้",
            "error"
        );

    }

}


/* =====================================================
   EVENTS
===================================================== */

function setupEvents() {


    /* ----------------------------------------------
       NAME INPUT
    ---------------------------------------------- */

    nameInput.addEventListener(
        "input",
        function () {

            const keyword =
                nameInput.value.trim();


            selectedStudent = null;


            if (
                keyword.length < 1
            ) {

                clearSuggestions();

                return;

            }


            searchStudents(
                keyword
            );

        }
    );


    /* ----------------------------------------------
       SEARCH BUTTON
    ---------------------------------------------- */

    searchButton.addEventListener(
        "click",
        function () {

            searchResult();

        }
    );


    /* ----------------------------------------------
       ENTER KEY
    ---------------------------------------------- */

    nameInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                searchResult();

            }

        }
    );


    /* ----------------------------------------------
       EXAM CHANGE
    ---------------------------------------------- */

    examSelect.addEventListener(
        "change",
        function () {

            selectedStudent = null;

            students = [];

            clearSuggestions();

            resultSection.classList.add(
                "hidden"
            );

        }
    );

}


/* =====================================================
   SEARCH STUDENTS
===================================================== */

async function searchStudents(
    keyword
) {

    const examId =
        examSelect.value;


    if (!examId) {

        return;

    }


    try {

        const url =
            API_URL +
            "?action=search" +
            "&name=" +
            encodeURIComponent(keyword) +
            "&exam_id=" +
            encodeURIComponent(examId);


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (!data.success) {

            clearSuggestions();

            return;

        }


        students =
            data.students || [];


        showSuggestions(
            students
        );

    }

    catch (error) {

        console.error(error);

        clearSuggestions();

    }

}


/* =====================================================
   SHOW SUGGESTIONS
===================================================== */

function showSuggestions(
    list
) {

    suggestions.innerHTML = "";


    if (
        list.length === 0
    ) {

        return;

    }


    /* แสดงสูงสุด 5 คน */

    const limitedList =
        list.slice(0, 5);


    limitedList.forEach(
        function (student) {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "suggestion-item";


            item.innerHTML = `

                <div class="suggestion-name">
                    ${escapeHtml(student.name)}
                </div>

                <div class="suggestion-class">
                    ชั้น ${escapeHtml(student.class)}
                </div>

            `;


            item.addEventListener(
                "click",
                function () {

                    selectStudent(
                        student
                    );

                }
            );


            suggestions.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   SELECT STUDENT
===================================================== */

function selectStudent(
    student
) {

    selectedStudent =
        student;


    nameInput.value =
        student.name;


    clearSuggestions();

    showMessage(
        "เลือกนักเรียนแล้ว ✓",
        "success"
    );

}


/* =====================================================
   SEARCH RESULT
===================================================== */

async function searchResult() {

    const examId =
        examSelect.value;


    if (!examId) {

        showMessage(
            "กรุณาเลือกการสอบ",
            "error"
        );

        return;

    }


    /* ----------------------------------------------
       ถ้ายังไม่ได้เลือกชื่อจากรายการ
       ให้ลองค้นหาก่อน
    ---------------------------------------------- */

    if (!selectedStudent) {

        const keyword =
            nameInput.value.trim();


        if (!keyword) {

            showMessage(
                "กรุณากรอกชื่อนักเรียน",
                "error"
            );

            nameInput.focus();

            return;

        }


        await searchStudents(
            keyword
        );


        if (
            students.length === 0
        ) {

            showMessage(
                "ไม่พบชื่อนักเรียน",
                "error"
            );

            return;

        }


        if (
            students.length === 1
        ) {

            selectedStudent =
                students[0];

        }

        else {

            showMessage(
                "พบหลายรายชื่อ กรุณาเลือกชื่อจากรายการ",
                "error"
            );

            return;

        }

    }


    /* ----------------------------------------------
       LOAD RESULT
    ---------------------------------------------- */

    try {

        setLoading(true);


        const url =
            API_URL +
            "?action=result" +
            "&student_id=" +
            encodeURIComponent(
                selectedStudent.student_id
            ) +
            "&exam_id=" +
            encodeURIComponent(examId);


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "ไม่พบข้อมูลคะแนน"
            );

        }


        renderResult(
            data
        );


        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    }

    catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "เกิดข้อผิดพลาดในการค้นหาคะแนน",
            "error"
        );

    }

    finally {

        setLoading(false);

    }

}


/* =====================================================
   RENDER RESULT
===================================================== */

function renderResult(
    data
) {
currentResultData = data;
    const student =
        data.student;


    const three =
        data.three_subjects;


    const five =
        data.five_subjects;


    const statistics =
        data.statistics;


    resultSection.innerHTML = `

        <div class="result-card">

            <div class="result-header">

                <div>

                    <div class="result-label">
                        ผลคะแนนของ
                    </div>

                    <h3>
                        ${escapeHtml(student.name)}
                    </h3>

                    <p>
                        ชั้น ${escapeHtml(student.class)}
                    </p>

                </div>

            </div>


            <!-- ==============================
                 3 SUBJECTS
            =============================== -->

            <div class="score-block">

                <div class="score-title">

                    <div>
                        <span class="score-icon">
                            📘
                        </span>

                        <div>
                            <h4>
                                คะแนน 3 วิชา
                            </h4>

                            <p>
                                คณิตศาสตร์ + วิทยาศาสตร์ + ภาษาอังกฤษ
                            </p>
                        </div>
                    </div>

                    <div class="total-score">

                        <strong>
                            ${three.total}
                        </strong>

                        <span>
                            / ${three.full}
                        </span>

                    </div>

                </div>


                <div class="score-progress">

                    <div
                        class="progress-bar"
                        style="width: ${three.percent}%"
                    ></div>

                </div>


                <div class="score-percent">

                    ร้อยละ ${three.percent}%

                </div>


                <div class="subject-grid">

                    ${subjectCard(
                        "คณิตศาสตร์",
                        three.math,
                        statistics.math
                    )}

                    ${subjectCard(
                        "วิทยาศาสตร์",
                        three.science,
                        statistics.science
                    )}

                    ${subjectCard(
                        "ภาษาอังกฤษ",
                        three.english,
                        statistics.english
                    )}

                </div>


                <div class="rank-box">

                    <span>
                        🏆 อันดับ
                    </span>

                    <strong>
                        ${three.rank}
                    </strong>

                    <span>
                        จาก ${three.total_students} คน
                    </span>

                </div>

            </div>


            <!-- ==============================
                 5 SUBJECTS
            =============================== -->

            <div class="score-block">

                <div class="score-title">

                    <div>
                        <span class="score-icon">
                            📗
                        </span>

                        <div>
                            <h4>
                                คะแนน 5 วิชา
                            </h4>

                            <p>
                                คณิต + วิทย์ + อังกฤษ + ไทย + สังคม
                            </p>
                        </div>
                    </div>

                    <div class="total-score">

                        <strong>
                            ${five.total}
                        </strong>

                        <span>
                            / ${five.full}
                        </span>

                    </div>

                </div>


                <div class="score-progress">

                    <div
                        class="progress-bar"
                        style="width: ${five.percent}%"
                    ></div>

                </div>


                <div class="score-percent">

                    ร้อยละ ${five.percent}%

                </div>


                <div class="subject-grid">

                    ${subjectCard(
                        "คณิตศาสตร์",
                        five.math,
                        statistics.math
                    )}

                    ${subjectCard(
                        "วิทยาศาสตร์",
                        five.science,
                        statistics.science
                    )}

                    ${subjectCard(
                        "ภาษาอังกฤษ",
                        five.english,
                        statistics.english
                    )}

                    ${subjectCard(
                        "ภาษาไทย",
                        five.thai,
                        statistics.thai
                    )}

                    ${subjectCard(
                        "สังคมศึกษา",
                        five.social,
                        statistics.social
                    )}

                </div>


                <div class="rank-box">

                    <span>
                        🏆 อันดับ
                    </span>

                    <strong>
                        ${five.rank}
                    </strong>

                    <span>
                        จาก ${five.total_students} คน
                    </span>

                </div>

            </div>


            <!-- ==============================
                 PRINT
            =============================== -->

            <button
                class="print-button"
                onclick="printReport()"
            >

                🖨️ พิมพ์ผลคะแนน

            </button>


        </div>

    `;


    resultSection.classList.remove(
        "hidden"
    );

}


/* =====================================================
   SUBJECT CARD
===================================================== */

function subjectCard(
    name,
    score,
    statistics
) {

    const percent =
        statistics.full > 0
            ? Math.round(
                score /
                statistics.full *
                100
            )
            : 0;


    return `

        <div class="subject-card">

            <div class="subject-name">
                ${name}
            </div>

            <div class="subject-score">
                ${score}
                <span>
                    / ${statistics.full}
                </span>
            </div>

            <div class="subject-progress">

                <div
                    style="width: ${percent}%"
                ></div>

            </div>

            <div class="subject-stats">

                <span>
                    สูงสุด ${statistics.max}
                </span>

                <span>
                    เฉลี่ย ${statistics.average}
                </span>

            </div>

        </div>

    `;

}


/* =====================================================
   PRINT REPORT
===================================================== */

/* =====================================================
   PRINT REPORT - A4
===================================================== */

function printReport() {

    if (!currentResultData) {

        alert("กรุณาค้นหาคะแนนก่อนพิมพ์");

        return;
    }


    const data =
        currentResultData;

    const student =
        data.student;

    const three =
        data.three_subjects;

    const five =
        data.five_subjects;

    const statistics =
        data.statistics;


    /* ---------------------------------------------
       ชื่อการสอบ
    --------------------------------------------- */

    const examOption =
        examSelect.options[
            examSelect.selectedIndex
        ];

    const examName =
        examOption
            ? examOption.textContent
            : "การทดสอบวัดระดับ";


    /* ---------------------------------------------
       วันที่พิมพ์
    --------------------------------------------- */

    const today =
        new Date();

    const printDate =
        today.toLocaleDateString(
            "th-TH",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    /* ---------------------------------------------
       ตารางวิชา
    --------------------------------------------- */

    function subjectRow(
        name,
        score,
        stat
    ) {

        return `
            <tr>

                <td class="subject-name">
                    ${escapeHtml(name)}
                </td>

                <td>
                    ${score}
                </td>

                <td>
                    ${stat.full}
                </td>

                <td>
                    ${stat.max}
                </td>

                <td>
                    ${stat.min}
                </td>

                <td>
                    ${stat.average}
                </td>

            </tr>
        `;
    }


    /* ---------------------------------------------
       สร้างหน้ารายงาน
    --------------------------------------------- */

    const reportHTML = `

<!DOCTYPE html>

<html lang="th">

<head>

<meta charset="UTF-8">

<title>
รายงานผลคะแนน - ${escapeHtml(student.name)}
</title>


<style>

@page {

    size: A4 portrait;

    margin: 15mm;

}


* {

    box-sizing: border-box;

}


body {

    margin: 0;

    padding: 0;

    font-family:
        "Arial",
        "Tahoma",
        sans-serif;

    color: #172b4d;

    background: white;

    font-size: 13px;

}


.report {

    width: 100%;

}


/* =========================================
   HEADER
========================================= */

.header {

    text-align: center;

    border-bottom:
        2px solid #0756c9;

    padding-bottom: 14px;

    margin-bottom: 18px;

}


.logo {

    width: 48px;

    height: 48px;

    border-radius: 12px;

    background: #0756c9;

    color: white;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    font-size: 19px;

    font-weight: bold;

    margin-bottom: 6px;

}


.school-name {

    font-size: 22px;

    font-weight: bold;

    color: #0756c9;

}


.school-sub {

    font-size: 12px;

    color: #66758a;

    margin-top: 2px;

}


.report-title {

    font-size: 19px;

    font-weight: bold;

    margin-top: 14px;

}


.exam-name {

    font-size: 12px;

    color: #66758a;

    margin-top: 4px;

}


/* =========================================
   STUDENT
========================================= */

.student-info {

    display: grid;

    grid-template-columns:
        1fr 180px;

    gap: 15px;

    border:
        1px solid #dce5f0;

    border-radius: 8px;

    padding: 12px 15px;

    margin-bottom: 18px;

}


.student-label {

    font-size: 10px;

    color: #7b8798;

}


.student-name {

    font-size: 17px;

    font-weight: bold;

    margin-top: 2px;

}


.student-class {

    text-align: right;

}


.student-class-value {

    font-size: 15px;

    font-weight: bold;

}


/* =========================================
   SECTION
========================================= */

.section {

    margin-bottom: 17px;

}


.section-title {

    font-size: 15px;

    font-weight: bold;

    color: #0756c9;

    border-left:
        4px solid #0756c9;

    padding-left: 8px;

    margin-bottom: 8px;

}


table {

    width: 100%;

    border-collapse: collapse;

}


th {

    background: #eef5ff;

    color: #28476d;

    font-weight: bold;

}


th,
td {

    border:
        1px solid #d9e2ed;

    padding: 7px 8px;

    text-align: center;

}


td.subject-name {

    text-align: left;

    font-weight: 500;

}


.total-row {

    background: #f6f9fd;

    font-weight: bold;

}


.total-row td {

    color: #0756c9;

}


/* =========================================
   SUMMARY
========================================= */

.summary {

    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 10px;

    margin-top: 8px;

}


.summary-box {

    border:
        1px solid #dce5f0;

    border-radius: 8px;

    padding: 10px;

    text-align: center;

}


.summary-label {

    font-size: 10px;

    color: #7b8798;

}


.summary-value {

    font-size: 19px;

    font-weight: bold;

    color: #0756c9;

    margin-top: 3px;

}


.summary-rank {

    color: #172b4d;

}


/* =========================================
   FOOTER
========================================= */

.footer {

    margin-top: 22px;

    padding-top: 10px;

    border-top:
        1px solid #dce5f0;

    display: flex;

    justify-content:
        space-between;

    font-size: 10px;

    color: #7b8798;

}


@media print {

    body {

        -webkit-print-color-adjust:
            exact;

        print-color-adjust:
            exact;

    }

}

</style>

</head>


<body>


<div class="report">


    <!-- HEADER -->

    <div class="header">

        <div class="logo">
            KW
        </div>

        <div class="school-name">
            K.W.CENTER
        </div>

        <div class="school-sub">
            โรงเรียนกวดวิชาแก่นวิทย์
        </div>

        <div class="report-title">
            รายงานผลคะแนน
        </div>

        <div class="exam-name">
            ${escapeHtml(examName)}
        </div>

    </div>


    <!-- STUDENT -->

    <div class="student-info">

        <div>

            <div class="student-label">
                ชื่อนักเรียน
            </div>

            <div class="student-name">
                ${escapeHtml(student.name)}
            </div>

        </div>


        <div class="student-class">

            <div class="student-label">
                ระดับชั้น
            </div>

            <div class="student-class-value">
                ${escapeHtml(student.class)}
            </div>

        </div>

    </div>


    <!-- 3 SUBJECTS -->

    <div class="section">

        <div class="section-title">
            คะแนน 3 วิชา
        </div>


        <table>

            <thead>

                <tr>

                    <th>
                        รายวิชา
                    </th>

                    <th>
                        คะแนน
                    </th>

                    <th>
                        เต็ม
                    </th>

                    <th>
                        สูงสุด
                    </th>

                    <th>
                        ต่ำสุด
                    </th>

                    <th>
                        เฉลี่ย
                    </th>

                </tr>

            </thead>


            <tbody>

                ${subjectRow(
                    "คณิตศาสตร์",
                    three.math,
                    statistics.math
                )}

                ${subjectRow(
                    "วิทยาศาสตร์",
                    three.science,
                    statistics.science
                )}

                ${subjectRow(
                    "ภาษาอังกฤษ",
                    three.english,
                    statistics.english
                )}


                <tr class="total-row">

                    <td>
                        รวม
                    </td>

                    <td>
                        ${three.total}
                    </td>

                    <td>
                        ${three.full}
                    </td>

                    <td colspan="2">
                        -
                    </td>

                    <td>
                        ${statistics.three_subjects.average}
                    </td>

                </tr>

            </tbody>

        </table>


        <div class="summary">

            <div class="summary-box">

                <div class="summary-label">
                    ร้อยละ
                </div>

                <div class="summary-value">
                    ${three.percent}%
                </div>

            </div>


            <div class="summary-box">

                <div class="summary-label">
                    อันดับ
                </div>

                <div class="summary-value summary-rank">
                    ${three.rank}
                    / ${three.total_students}
                </div>

            </div>

        </div>

    </div>


    <!-- 5 SUBJECTS -->

    <div class="section">

        <div class="section-title">
            คะแนน 5 วิชา
        </div>


        <table>

            <thead>

                <tr>

                    <th>
                        รายวิชา
                    </th>

                    <th>
                        คะแนน
                    </th>

                    <th>
                        เต็ม
                    </th>

                    <th>
                        สูงสุด
                    </th>

                    <th>
                        ต่ำสุด
                    </th>

                    <th>
                        เฉลี่ย
                    </th>

                </tr>

            </thead>


            <tbody>

                ${subjectRow(
                    "คณิตศาสตร์",
                    five.math,
                    statistics.math
                )}

                ${subjectRow(
                    "วิทยาศาสตร์",
                    five.science,
                    statistics.science
                )}

                ${subjectRow(
                    "ภาษาอังกฤษ",
                    five.english,
                    statistics.english
                )}

                ${subjectRow(
                    "ภาษาไทย",
                    five.thai,
                    statistics.thai
                )}

                ${subjectRow(
                    "สังคมศึกษา",
                    five.social,
                    statistics.social
                )}


                <tr class="total-row">

                    <td>
                        รวม
                    </td>

                    <td>
                        ${five.total}
                    </td>

                    <td>
                        ${five.full}
                    </td>

                    <td colspan="2">
                        -
                    </td>

                    <td>
                        ${statistics.five_subjects.average}
                    </td>

                </tr>

            </tbody>

        </table>


        <div class="summary">

            <div class="summary-box">

                <div class="summary-label">
                    ร้อยละ
                </div>

                <div class="summary-value">
                    ${five.percent}%
                </div>

            </div>


            <div class="summary-box">

                <div class="summary-label">
                    อันดับ
                </div>

                <div class="summary-value summary-rank">
                    ${five.rank}
                    / ${five.total_students}
                </div>

            </div>

        </div>

    </div>


    <!-- FOOTER -->

    <div class="footer">

        <div>
            K.W.CENTER | โรงเรียนกวดวิชาแก่นวิทย์
        </div>

        <div>
            พิมพ์เมื่อ ${printDate}
        </div>

    </div>


</div>


<script>

window.onload = function () {

    window.print();

};

</script>


</body>

</html>

`;


    /* ---------------------------------------------
       เปิดหน้าพิมพ์
    --------------------------------------------- */

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=1000"
        );


    if (!printWindow) {

        alert(
            "เบราว์เซอร์บล็อกหน้าต่างพิมพ์ กรุณาอนุญาต Pop-up สำหรับเว็บไซต์นี้"
        );

        return;
    }


    printWindow.document.open();

    printWindow.document.write(
        reportHTML
    );

    printWindow.document.close();

}

/* =====================================================
   LOADING
===================================================== */

function setLoading(
    loading
) {

    searchButton.disabled =
        loading;


    if (loading) {

        searchButton.innerHTML =
            "⏳ กำลังค้นหา...";

    }

    else {

        searchButton.innerHTML =
            "🔎 ค้นหาคะแนน";

    }

}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    message.className =
        "message";


    if (type) {

        message.classList.add(
            type
        );

    }

}


/* =====================================================
   CLEAR SUGGESTIONS
===================================================== */

function clearSuggestions() {

    suggestions.innerHTML = "";

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}
