
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

function printReport() {

    window.print();

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
